import { requireUser } from '@/lib/auth'

export const metadata = {
  title: 'Settings',
}

export default async function SettingsPage() {
  const { user } = await requireUser()

  return (
    <div className="forge-container py-8 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <section className="forge-card p-5 mb-4">
        <h2 className="text-sm font-mono text-forge-fg-subtle mb-3">JARVIS</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-forge-fg-muted block mb-1">
              名字
            </label>
            <input
              type="text"
              defaultValue={user.jarvisName}
              disabled
              className="w-full px-3 py-2 rounded-md bg-forge-bg border border-forge-border text-sm font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-forge-fg-muted block mb-1">
              对您的称呼
            </label>
            <input
              type="text"
              defaultValue={user.jarvisAddress}
              disabled
              className="w-full px-3 py-2 rounded-md bg-forge-bg border border-forge-border text-sm font-mono"
            />
          </div>
          <p className="text-xs text-forge-fg-subtle">
            v0.3 上线后可编辑（JARVIS 接入完成后启用）
          </p>
        </div>
      </section>

      <section className="forge-card p-5 mb-4">
        <h2 className="text-sm font-mono text-forge-fg-subtle mb-3">
          ANTHROPIC API KEY
        </h2>
        <p className="text-xs text-forge-fg-muted mb-3">
          BYOK · 您自己的 Claude Key 不会上传到 forge 后端，仅在浏览器加密存储
        </p>
        <input
          type="password"
          placeholder="sk-ant-..."
          disabled
          className="w-full px-3 py-2 rounded-md bg-forge-bg border border-forge-border text-sm font-mono"
        />
        <p className="text-xs text-forge-fg-subtle mt-2">
          v0.3 上线后启用
        </p>
      </section>

      <section className="forge-card p-5">
        <h2 className="text-sm font-mono text-forge-fg-subtle mb-3">环境信息</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-forge-fg-muted">User ID</dt>
            <dd className="font-mono text-xs">{user.id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-forge-fg-muted">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-forge-fg-muted">注册时间</dt>
            <dd>{new Date(user.createdAt * 1000).toLocaleDateString('zh-CN')}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
