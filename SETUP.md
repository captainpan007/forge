# forge.dev · Setup Guide

> 把代码跑起来需要的所有步骤。第一次设置约 30 分钟。

## 前置要求

- macOS / Linux / Windows (WSL2)
- Node.js ≥ 22 (`nvm install 22` 或 `brew install node`)
- pnpm ≥ 9 (`brew install pnpm` 或 `npm install -g pnpm`)
- Git

## 1. 克隆 + 安装依赖

```bash
cd ~/Projects/forge   # 或者你 clone 的位置
pnpm install          # 装所有依赖（约 1-2 分钟）
```

## 2. 注册 Clerk（Auth · 免费 · 5 分钟）

1. 访问 [https://dashboard.clerk.com](https://dashboard.clerk.com) 注册
2. 创建一个新应用，名字随意（比如 `forge-dev`）
3. 选 **Email + Google + GitHub** 作为登录方式
4. 在 **API Keys** 页拿到：
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_test_...`)
   - `CLERK_SECRET_KEY` (`sk_test_...`)
5. 在 **Paths** 设置：
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

## 3. 注册 Turso（DB · 免费 · 5 分钟）

1. 访问 [https://turso.tech](https://turso.tech) 注册
2. 安装 CLI：`curl -sSfL https://get.tur.so/install.sh | bash`
3. 登录：`turso auth login`
4. 创建数据库：
   ```bash
   turso db create forge-dev
   turso db show forge-dev --url        # 拷贝输出 → TURSO_DATABASE_URL
   turso db tokens create forge-dev      # 拷贝输出 → TURSO_AUTH_TOKEN
   ```

## 4. 配置环境变量

```bash
cd apps/web
cp .env.example .env.local
```

编辑 `.env.local`，填入：

```bash
ANTHROPIC_API_KEY=sk-ant-...           # 从 https://console.anthropic.com 拿
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
TURSO_DATABASE_URL=libsql://forge-dev-yourname.turso.io
TURSO_AUTH_TOKEN=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. 初始化数据库 schema

```bash
cd apps/web
pnpm db:push   # 将 lib/db/schema.ts 同步到 Turso
```

## 6. 启动开发服务器

```bash
cd ~/Projects/forge
pnpm dev
```

应该看到：

```
@forge/web:dev: ▲ Next.js 14.2.18
@forge/web:dev: - Local:        http://localhost:3000
@forge/web:dev: ✓ Ready in 1.2s
```

打开 `http://localhost:3000`：

- 未登录：看到 forge 的落地页
- 点 "注册" → Clerk 弹窗 → 完成注册
- 自动跳转到 `/dashboard` → 看到项目列表（发声盒 + 智能小车）

## 7. 验证图谱

```bash
pnpm validate-graph
```

应该看到：
```
✓ Knowledge graph valid: 66 nodes, 2 projects
```

## 部署到 Vercel

### 第一次部署

1. 把仓库 push 到 GitHub（`git remote add origin git@github.com:captainpan007/forge.git`）
2. 访问 [https://vercel.com](https://vercel.com)，点 **New Project**
3. 选你的 `forge` 仓库
4. **Framework Preset**: Next.js（自动检测）
5. **Root Directory**: `apps/web`
6. 在 **Environment Variables** 把 `.env.local` 里的所有值都填一遍
7. 点 Deploy

### 配置自定义域名

1. Vercel 项目 → **Settings → Domains** → 添加 `forge.alexpan.dev`
2. Vercel 给你一条 CNAME 记录
3. 在你的 DNS 服务商（Cloudflare / 阿里云 / etc.）：
   - 给 alexpan.dev 加一条 CNAME：`forge` → `cname.vercel-dns.com`
4. 等几分钟 DNS 生效 → 访问 `https://forge.alexpan.dev`

## 常见问题

### `pnpm install` 报错 "EACCES" 或权限错
```bash
sudo chown -R $(whoami) ~/.pnpm-store
```

### Clerk 登录后跳转回 sign-in（无限循环）
检查 `.env.local` 里的 `NEXT_PUBLIC_CLERK_*` 路径设置是否跟 Clerk Dashboard 一致。

### Turso 报 `Error: 401 Unauthorized`
重新生成 token：`turso db tokens create forge-dev`

### Tailwind 类名不生效
确认 `tailwind.config.ts` 的 `content` 数组包含了 `app/**/*` 和 `components/**/*`。

### 类型错误：`Cannot find module '@forge/kg'`
跑 `pnpm install` 重建 workspace 链接，再重启 dev server。

## 下一步

跑通后，参考 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) 了解整体设计，
[docs/CONTENT_GUIDE.md](./docs/CONTENT_GUIDE.md) 了解怎么写新节点。
