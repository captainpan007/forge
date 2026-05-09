# forge

> 个人工程师驾驶舱 · 用 Musk 倒推法学嵌入式 · AI 助教 JARVIS 全程陪伴

**forge** 不是又一个在线课程，而是一个为成年零基础学习者设计的「项目驱动 + 知识图谱 + AI 陪练 + 费曼强制」的工程学习驾驶舱。

> 用户感觉自己只是在做小车，但平台在背后悄悄给他完整的课程结构。

## 这是什么

- **项目第一**：你想做"会发声的玩具"或"自动驾驶小车"——你直接选项目，平台为你倒推必要的知识图谱。
- **知识图谱**：项目被拆成 ~30 个原子知识节点（每个 10-15 分钟）。节点之间有依赖关系。AI 帮你按依赖顺序铺路。
- **JARVIS**：基于 Anthropic Claude API 的 AI 助教。知道你在哪一节、做完了哪些、卡过哪些。三种模式：Workshop / Coach / Review。
- **费曼工坊**：每节课通关条件 = "你能否给 26 个月的儿子讲清楚"。AI 评判 + 反问 + 必须答对 3 个孩子级问题。
- **失败日志**：你卡住的每一个坑会被结构化记录，未来对其他用户极有价值。

## 技术栈

| 层 | 选型 |
|---|---|
| 前端 | Next.js 14 (App Router) + TypeScript + Tailwind |
| UI 组件 | shadcn/ui + 自研 |
| AI | Claude API + Tool Calling |
| DB | Turso (libSQL / SQLite) |
| Auth | Clerk |
| 内容 | MDX 文件 + YAML 知识图谱 |
| 图谱可视化 | React Flow |
| 代码编辑器 | Monaco |
| 部署 | Vercel |
| Monorepo | Turborepo + pnpm |

## 仓库结构

```
forge/
├── apps/
│   └── web/                 # Next.js 应用 → forge.alexpan.dev
├── packages/
│   ├── ai/                  # JARVIS Agent + Claude 工具调用
│   ├── kg/                  # 知识图谱解析与遍历
│   └── ui/                  # 共享 UI 组件
├── content/                 # ★ 核心资产
│   ├── projects/            # 项目元数据 (MDX)
│   ├── nodes/               # 知识节点 (MDX)
│   └── knowledge-graph.yaml # 节点依赖
├── docs/                    # 给开源贡献者
└── scripts/                 # 构建脚本
```

## 快速开始

```bash
# 准备环境
pnpm install
cp apps/web/.env.example apps/web/.env.local
# 填入: ANTHROPIC_API_KEY, CLERK_*, TURSO_*

# 开发模式
pnpm dev

# 构建
pnpm build
```

## 文档

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — 整体架构与设计决策
- **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)** — 如何参与贡献
- **[CONTENT_GUIDE.md](./docs/CONTENT_GUIDE.md)** — 如何写一个新的知识节点

## 路线图

- [x] v0：仓库骨架 + 第一个内容节点
- [ ] v0.1：阶段 1 完成（路由 / Auth / DB schema / 部署）
- [ ] v0.2：阶段 2（项目工坊页 + 节点页 静态版本）
- [ ] v0.3：阶段 3（JARVIS 接入 + 工具调用）
- [ ] v0.4：阶段 4（Wokwi / Monaco 集成 + 进度跟踪）
- [ ] v0.5：阶段 5（Feynman 工坊）
- [ ] v0.6：阶段 6（28 节点内容 + 第一个项目跑通）
- [ ] **v1.0**：你能从头到尾用 forge 做出发声盒

## 许可

MIT © Alex Pan
