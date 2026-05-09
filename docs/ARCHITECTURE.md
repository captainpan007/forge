# forge.dev · Architecture

> 这份文档定义 forge 的核心架构、数据模型、关键决策。**所有重大改动应先 PR 这份文档。**

## 设计哲学

| 原则 | 表达 |
|---|---|
| **项目第一，课程藏底** | 用户感知"做项目"，平台底层"喂图谱" — Musk 倒推法 |
| **Feynman 强制** | 没真懂不能进下一节 — "教给孩子"是通关条件 |
| **JARVIS 全平台常驻** | AI 助教不是另一个标签页，是总统幕僚 — 永远知道当前上下文 |
| **内容即代码** | 所有教学内容是 MDX + YAML 文件，跟代码一起 PR、版本化、CDN 缓存 |
| **开源精神** | MIT，鼓励社区贡献节点；BYOK API Key，不靠中间商赚差价 |
| **工程师审美** | Linear 风：深色、信息密度高、Cmd-K 驱动、零卖萌 |

## 系统架构

```
                          ┌───────────────────────────────────┐
                          │   forge.alexpan.dev (Next.js 14)  │
                          │                                   │
   ┌──────────┐           │  ┌──────────────┐  ┌───────────┐ │
   │  User    │ ──HTTPS──▶│  │ App Router   │  │  RSC      │ │
   │ (Mac)    │ ◀─SSE─────│  │ (Server)     │  │ Streaming │ │
   └──────────┘           │  └──────┬───────┘  └─────┬─────┘ │
                          │         │                │       │
                          │  ┌──────▼────────────────▼─────┐ │
                          │  │  Server Actions / API Routes │ │
                          │  └──┬─────────┬──────────┬─────┘ │
                          │     │         │          │       │
                          │  ┌──▼──┐  ┌───▼───┐  ┌──▼──┐    │
                          │  │ AI  │  │  KG   │  │ DB  │    │
                          │  │ Pkg │  │  Pkg  │  │client│   │
                          │  └──┬──┘  └───┬───┘  └──┬──┘    │
                          └─────┼─────────┼─────────┼───────┘
                                │         │         │
                          ┌─────▼──┐ ┌────▼────┐ ┌──▼──────┐
                          │Anthropic│ │Content/ │ │ Turso   │
                          │ Claude  │ │ MDX Files│ │(libSQL) │
                          │  API    │ │ (in-repo)│ │         │
                          └─────────┘ └─────────┘ └─────────┘
```

## 数据模型

### 内容（不进 DB，跟代码一起在 Git 里）

#### `content/knowledge-graph.yaml`
所有项目和节点的元数据 + 依赖关系。启动时由 `packages/kg` 加载到内存，提供：
- 拓扑排序：用户的下一节是什么
- 依赖检查：某节点的前置是否都完成了
- 可视化数据：给 React Flow 喂节点和边

#### `content/projects/[slug].mdx`
项目元数据（标题、tagline、硬件清单、阶段总览）+ 营销内容。

#### `content/nodes/[id]-[slug].mdx`
单个知识节点的完整内容。固定 4 段结构：
1. **Why** — 为什么学这个，对你的项目意味着什么
2. **What** — 核心内容（文字 + 图 + 视频 + 类比）
3. **Try** — 动手验证（quiz / 代码 / 模拟器 / 拍照）
4. **Feynman** — 教给孩子的提示 + AI 评判 rubric + 反问

详见 [CONTENT_GUIDE.md](./CONTENT_GUIDE.md)。

### 状态（进 DB · Turso/libSQL）

```sql
-- 用户
CREATE TABLE users (
  id TEXT PRIMARY KEY,         -- Clerk user_id
  email TEXT NOT NULL,
  jarvis_name TEXT DEFAULT 'JARVIS',
  jarvis_address TEXT DEFAULT 'Sir',
  anthropic_api_key TEXT,      -- 加密存储
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 用户的项目
CREATE TABLE user_projects (
  user_id TEXT NOT NULL,
  project_slug TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, project_slug)
);

-- 节点进度
CREATE TABLE node_progress (
  user_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  status TEXT NOT NULL,        -- 'locked' | 'available' | 'in_progress' | 'completed'
  started_at INTEGER,
  completed_at INTEGER,
  feynman_passed_at INTEGER,
  time_spent_seconds INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, node_id)
);

-- JARVIS 对话
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  context_node_id TEXT,
  context_project_slug TEXT,
  mode TEXT NOT NULL,          -- 'workshop' | 'coach' | 'review'
  created_at INTEGER NOT NULL
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,          -- 'user' | 'assistant' | 'tool'
  content TEXT NOT NULL,       -- JSON: text + tool_use + tool_result
  created_at INTEGER NOT NULL
);

-- Feynman 提交
CREATE TABLE feynman_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  submission_type TEXT NOT NULL,  -- 'audio' | 'text'
  content TEXT NOT NULL,
  audio_url TEXT,
  transcript TEXT,
  critique TEXT,                  -- JARVIS 评判
  follow_up_answers TEXT,         -- JSON
  passed BOOLEAN NOT NULL,
  created_at INTEGER NOT NULL
);

-- Failure Log
CREATE TABLE failure_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  node_id TEXT,
  symptom TEXT NOT NULL,
  cause TEXT,
  solution TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at INTEGER NOT NULL
);

-- 项目日记
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,             -- YYYY-MM-DD
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

## 包（packages/）

### `packages/kg` — Knowledge Graph
- `parser.ts` — 解析 `content/knowledge-graph.yaml` + MDX frontmatter
- `graph.ts` — 内存图结构 + 拓扑排序
- `topology.ts` — "下一节是什么"、"还差什么前置" 的算法
- 暴露给 web app 的 API：`getNextNode(userId, projectSlug)`、`getReadyNodes(userId)`

### `packages/ai` — JARVIS Agent
- `agent.ts` — 主 Agent 循环（消息 → 决定工具 → 执行 → 回答）
- `prompts/` — System prompt、各模式 prompt、Feynman 评判 prompt
- `tools/` — 7 个工具的实现：
  - `search_docs` — 查 Pi/Adafruit/MDN 文档
  - `analyze_image` — 看用户上传的电路照片
  - `recommend_next_node` — 调 packages/kg
  - `parse_error` — 解析报错日志
  - `run_simulation` — 调 Wokwi (v1.1)
  - `feynman_critique` — 评判 Feynman 提交
  - `search_failure_log` — 查相似坑

### `packages/ui` — 共享 UI 组件
- shadcn/ui 风格基础组件
- forge 自研组件：`<JarvisPanel>`、`<NodeCard>`、`<ProjectCard>`、`<FeynmanRecorder>` 等
- MDX 组件：`<Callout>`、`<Analogy>`、`<TryThis>`、`<FeynmanPrompt>` 等

## 关键架构决策（ADR）

每个决策值得单独的 ADR 文档（未来在 `docs/adr/` 下）。简版列在这里：

| # | 决策 | 选项 | 选定 | 理由 |
|---|---|---|---|---|
| 001 | Auth | Clerk / Auth.js / Supabase | **Clerk** | 30 分钟集成完，省 1 周自建 |
| 002 | DB | Postgres / SQLite / Turso | **Turso (libSQL)** | 兼容 SQLite + 边缘部署 + 免费额度 |
| 003 | 内容存储 | DB / Git MDX | **Git MDX** | 开源贡献者能 PR、版本可控、CDN 友好 |
| 004 | 知识图谱 | Neo4j / Postgres / YAML | **YAML 内存** | 节点千级以下，YAML 足够，零依赖 |
| 005 | 图谱可视化 | React Flow / Cytoscape / D3 | **React Flow** | 文档好、活跃、足够灵活 |
| 006 | 代码编辑器 | Monaco / CodeMirror | **Monaco** | VS Code 同款，所有人都熟 |
| 007 | API Key 模式 | 平台付 / BYOK | **BYOK** | 开源精神、v1 不付 API 钱 |
| 008 | 部署 | Vercel / 自托管 | **Vercel** | 免费额度、零配置、备好迁出预案 |
| 009 | Monorepo | Nx / Turbo / Rush | **Turborepo** | Vercel 出的，跟 Next.js 配合最好 |
| 010 | 包管理 | npm / yarn / pnpm | **pnpm** | 比 npm 快 + 对 monorepo 友好 |

## 路由设计

```
/                                       项目工坊（首页）
/projects                               所有项目浏览
/projects/[slug]                        项目页（默认 redirect 到 /workshop）
/projects/[slug]/workshop               项目工坊
/projects/[slug]/graph                  知识图谱视图
/projects/[slug]/nodes/[node]           节点学习页 ★ 核心页面
/projects/[slug]/nodes/[node]/feynman   Feynman 工坊（modal）

/journal                                学习日记
/profile                                个人主页 + 作品集
/settings                               设置（API Key / JARVIS / 主题）

/api/jarvis/chat                        SSE 流式对话端点
/api/jarvis/feynman                     Feynman 评判
/api/progress                           进度更新
/api/journal                            日记 CRUD
```

## JARVIS 对话流（关键流程）

```
User input → Server Action
    │
    ├── 加载 context: 当前 project / node / 用户进度
    ├── 加载历史 messages
    │
    ▼
packages/ai/agent.ts
    │
    ├── system prompt (含 JARVIS 人格 + 当前 context)
    ├── tools 定义
    │
    ▼
Anthropic Claude API (streaming)
    │
    ├── tool_use? → 执行 tool → 把结果塞回 messages → 再调 Claude
    └── final text → SSE stream 给前端
    │
    ▼
前端 <JarvisPanel> 渲染
```

## 安全考量

- **Anthropic API Key**：用户 BYOK，存进 DB 时 AES-256 加密；前端永远不暴露明文
- **MDX 渲染**：禁用所有 raw HTML，只允许已注册的 React 组件
- **用户上传图片**：限制大小 + 内容审核（v2 接 Anthropic vision moderation）
- **Failure Log 公开**：默认私有，用户主动选 "make public" 才进入公开库

## 性能目标（v1）

- 首屏 LCP < 1.5s（Vercel + Edge Runtime）
- JARVIS 首字 < 800ms（Claude streaming）
- 知识图谱页面渲染 < 200ms（图在内存）
- 节点页面 SSG（构建时静态）+ ISR（用户交互时增量）

## 下一步

参见 [Roadmap](../README.md#路线图) 和当前里程碑 issue。
