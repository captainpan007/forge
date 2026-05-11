# Deploy · forge.alexpan.dev

把 forge 部署到 Vercel + 绑定 forge.alexpan.dev 域名的完整步骤。

> **顺序很重要** — Clerk 生产实例 → Turso 生产 DB → Vercel 项目 → 域名绑定。每一步都依赖前一步。

---

## 0. 前置条件

- [x] GitHub 仓库已推到 `captainpan007/forge`，`main` 分支可部署
- [x] 本地 dev 环境跑通（Settings 能保存、JARVIS 能聊、节点能渲染）
- [x] `vercel.json` + `next.config.mjs` 已配（仓库里已就位）
- [ ] 你有 alexpan.dev 这个域名的 DNS 控制权（Cloudflare / 直接注册商）
- [ ] Anthropic API 余额充足（部署上去后服务器会调用）

---

## 1. Clerk · 创建生产实例

⚠ 你本地用的是 Clerk **开发**实例（pk_test\_…）。生产环境必须用独立的 **生产**实例（pk_live\_…）。

1. https://dashboard.clerk.com → 选 forge 应用 → 顶部下拉切到 **"Production"**（不是 Development）
2. 第一次切到 Production，会让你**激活**生产实例：
   - 名字：`forge`
   - **域名填：`forge.alexpan.dev`**（这一步 Clerk 会用来配置 SSL / Cookie）
3. 复制两个 key（待会儿填到 Vercel）：
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → `pk_live_…`
   - `CLERK_SECRET_KEY` → `sk_live_…`
4. 在 Clerk → **Domains** 里确认 `forge.alexpan.dev` 已添加（没有就加上）

---

## 2. Turso · 创建生产数据库

⚠ 别跟 dev DB 混用 — 生产数据要单独的 DB，否则你随手在 dev 跑 `db:push` 可能把线上的表结构改了。

```bash
# 假设已经装了 turso CLI（没装：curl -sSfL https://get.tur.so/install.sh | bash）
turso db create forge-prod --location nrt   # 东京机房，香港用户最近
turso db show forge-prod --url               # 复制这个 URL
turso db tokens create forge-prod            # 生成 read-write token
```

记下：
- `TURSO_DATABASE_URL` → `libsql://forge-prod-xxx.turso.io`
- `TURSO_AUTH_TOKEN` → `eyJ…`

**初始化 schema**（在本地跑，往生产 DB 推）：
```bash
cd apps/web
TURSO_DATABASE_URL='libsql://forge-prod-xxx.turso.io' \
TURSO_AUTH_TOKEN='eyJ…' \
pnpm db:push
```

确认 schema 推上去了：`turso db shell forge-prod` → `.tables` 应该看到 `users`, `conversations`, `messages` 等表。

---

## 3. Vercel · 创建项目

1. https://vercel.com → New Project → Import Git Repository → 选 `captainpan007/forge`
2. **Configure Project** 页：
   - Framework Preset: **Next.js**（自动检测）
   - Root Directory: **保留默认**（仓库根目录）— `vercel.json` 里已配好 monorepo build 命令
   - Build/Install Commands：**不要改**（vercel.json 已覆盖）
3. **Environment Variables** — 先添加这些（点 "Add"）：

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_…` | 步骤 1 |
| `CLERK_SECRET_KEY` | `sk_live_…` | 步骤 1 · ⚠ Sensitive |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/dashboard` | |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/dashboard` | |
| `TURSO_DATABASE_URL` | `libsql://forge-prod-xxx.turso.io` | 步骤 2 |
| `TURSO_AUTH_TOKEN` | `eyJ…` | 步骤 2 · ⚠ Sensitive |
| `ANTHROPIC_API_KEY` | `sk-ant-…` | 服务器 fallback（user BYOK 没设时用）|
| `ANTHROPIC_MODEL` | `claude-haiku-4-5-20251001` | 默认模型，可选 |
| `NEXT_PUBLIC_APP_URL` | `https://forge.alexpan.dev` | 注意 https |
| `NEXT_PUBLIC_APP_NAME` | `forge` | |

⚠ **不要**添加 `HTTPS_PROXY` — Vercel 在美国，不需要代理走出去。

4. 点 **Deploy**。第一次构建大约 3-5 分钟。

---

## 4. 绑定 forge.alexpan.dev 域名

构建完成后：

1. Vercel 项目 → Settings → **Domains** → 添加 `forge.alexpan.dev`
2. Vercel 给你一个 CNAME 记录值，类似 `cname.vercel-dns.com`
3. 去你的 DNS 服务商（Cloudflare / Namecheap / etc.）：
   ```
   类型: CNAME
   名称: forge
   值: cname.vercel-dns.com
   TTL: 自动 / 300
   代理: ❌ 关闭（Cloudflare 用户：先关 orange cloud，等 Vercel 验证完再开）
   ```
4. 等 DNS 传播（1-5 分钟） → Vercel 会自动签 SSL → 访问 `https://forge.alexpan.dev`

---

## 5. 部署后验证 checklist

按顺序点过去，每步出问题先停下。

- [ ] `https://forge.alexpan.dev` → 落地页能打开
- [ ] 注册一个新账号（用真邮箱）→ 进 dashboard
- [ ] Dashboard 能看到 2 个项目卡片（发声盒 / 智能小车）
- [ ] 点 N05 GPIO basics → MDX 渲染正常 + Wokwi iframe 加载
- [ ] 按 ⌘K → 命令面板拉起，搜 "gpio" 能找到节点
- [ ] 在 N05 页面 JARVIS 浮层发一句"你好" → 应该 2-5 秒内开始流式回复
- [ ] /settings 改 JARVIS 名字 → 保存 → 刷新还在
- [ ] /settings 填自己的 Anthropic API key（BYOK）→ 保存 → 再发一条 JARVIS 消息看是否走你的 key

---

## 6. 常见问题

**JARVIS 不响应 / 500 错误**
- Vercel → 项目 → Logs → 看 `/api/jarvis/chat` 的错误
- 大概率：`ANTHROPIC_API_KEY` 没设 / 余额没了 / model 名字错（Haiku 4.5 必须带完整 ID `claude-haiku-4-5-20251001`）

**Clerk 登录跳回 sign-in 死循环**
- Clerk 的 Production 实例 Domain 没加 `forge.alexpan.dev`
- 或者用错 key 了（pk_test 在生产环境不工作）

**dashboard 空 / 显示不出项目**
- Turso 没初始化 → 重新跑 `pnpm db:push`（带生产 env vars）
- 或者 `FORGE_CONTENT_DIR` 解析错 → 看 Vercel build log，应该指到 `/vercel/path0/content`

**"Cannot find module './…'"**
- 通常是 `pnpm-lock.yaml` 没提交。检查 `git status`，把 lockfile commit 上去。

---

## 7. 后续

- Clerk Webhooks（用户注册自动创建 DB row）— v0.5
- Vercel Analytics（看实际访客）— 一行配置
- Sentry（错误追踪）— 部署后再装
- 国内 CDN / 镜像（如果中国访问慢）— 看流量再说
