# 贡献指南

欢迎给 forge 提 PR！这份文档告诉你怎么参与。

## 你能怎么贡献

### 1. 写一个新的知识节点
最有价值的贡献。详见 [CONTENT_GUIDE.md](./CONTENT_GUIDE.md)。

### 2. 加一个新项目
比如"micro:bit 入门"、"ESPHome 全屋"、"会讲故事的毛绒熊"。流程：
1. 在 `content/knowledge-graph.yaml` 的 `projects:` 下添加项目元数据
2. 在 `content/projects/` 下创建 `[slug].mdx`
3. 拆分节点列表（建议 20-50 个原子节点）
4. 提 PR

### 3. 报告 bug / 提需求
开 issue，模板会引导你。

### 4. 改进核心代码
看 issue 列表里的 `good first issue` 标签。

## 开发流程

```bash
# 1. fork + clone
git clone https://github.com/YOUR_USERNAME/forge.git
cd forge

# 2. 安装依赖
pnpm install

# 3. 配置环境
cp apps/web/.env.example apps/web/.env.local
# 填入 ANTHROPIC_API_KEY (你自己的 Claude Key)
# 填入 CLERK_*, TURSO_* (开发环境免费创建)

# 4. 起开发服务器
pnpm dev

# 5. 改代码 → 测试 → commit
pnpm lint
pnpm typecheck
pnpm test

# 6. push + PR
git checkout -b feat/your-thing
git commit -m "feat: your thing"
git push origin feat/your-thing
```

## Commit 规范

用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)：

- `feat:` 新功能
- `fix:` 修 bug
- `docs:` 文档
- `chore:` 构建/工具
- `refactor:` 重构
- `test:` 测试
- `content:` 新增或修改教学内容（forge 自定义）

例：
- `feat(jarvis): add tool use streaming`
- `content(soundbox): N16 gpiozero first lesson`
- `fix(kg): handle circular dependency in graph parser`

## PR 检查清单

- [ ] `pnpm lint` 通过
- [ ] `pnpm typecheck` 通过
- [ ] `pnpm test` 通过
- [ ] 如果改了节点：`pnpm validate-graph` 通过
- [ ] 改了 UI：附截图或 GIF
- [ ] PR 描述说清楚 "what + why"

## 行为准则

- 善意优先（assume good faith）
- 对事不对人
- 中文 / 英文 PR 都欢迎
- 任何让人觉得不安全的言论 → 直接 ban

## 谁会 review

- 内容 PR：@alexpan + 该领域 maintainer（未来）
- 代码 PR：@alexpan
- 文档 PR：通常 24 小时内合并

## 许可

提交 PR 即表示你同意你的贡献以 MIT 许可发布。
