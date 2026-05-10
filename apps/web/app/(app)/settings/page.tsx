import { requireUser } from '@/lib/auth'
import { JarvisIdentityForm, ApiKeyForm } from './SettingsForms'

export const metadata = {
  title: 'Settings',
}

export default async function SettingsPage() {
  const { user } = await requireUser()

  return (
    <div className="forge-container py-12 max-w-3xl">
      {/* Page header */}
      <div className="mb-10">
        <p className="forge-section-label mb-2">§ Preferences</p>
        <h1 className="forge-serif-cjk text-3xl text-forge-fg">Settings</h1>
      </div>

      {/* Chapter I — JARVIS */}
      <section className="mb-12">
        <div className="forge-roman-chapter" data-roman="I.">
          <span className="forge-roman-chapter-title">JARVIS Identity</span>
          <span className="forge-roman-chapter-rule" />
        </div>
        <JarvisIdentityForm
          initialName={user.jarvisName}
          initialAddress={user.jarvisAddress}
        />
      </section>

      {/* Chapter II — API Key */}
      <section className="mb-12">
        <div className="forge-roman-chapter" data-roman="II.">
          <span className="forge-roman-chapter-title">Anthropic API Key</span>
          <span className="forge-roman-chapter-rule" />
        </div>
        <p className="text-xs text-forge-fg-muted mb-4 leading-relaxed">
          您的 Claude API key — 用于 JARVIS 调用 Claude API。
          BYOK（Bring Your Own Key）模式：key 存储在您自己的 Turso DB，
          forge 服务器不收集。{' '}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="forge-link"
          >
            从 Anthropic Console 获取
          </a>
        </p>
        <ApiKeyForm hasKey={!!user.anthropicApiKey} />
      </section>

      {/* Chapter III — Account info */}
      <section>
        <div className="forge-roman-chapter" data-roman="III.">
          <span className="forge-roman-chapter-title">Account</span>
          <span className="forge-roman-chapter-rule" />
        </div>
        <dl className="space-y-2 text-sm font-mono">
          <Row label="user_id" value={user.id} mono />
          <Row label="email" value={user.email} />
          <Row
            label="created_at"
            value={new Date(user.createdAt * 1000).toLocaleDateString('zh-CN')}
          />
          <Row
            label="updated_at"
            value={new Date(user.updatedAt * 1000).toLocaleDateString('zh-CN')}
          />
        </dl>
      </section>
    </div>
  )
}

function Row({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-baseline gap-4 py-1.5 border-b border-forge-border-subtle last:border-0">
      <dt className="text-forge-fg-subtle text-[0.7rem] uppercase tracking-wider w-28 shrink-0">
        {label}
      </dt>
      <dd
        className={
          mono
            ? 'text-forge-fg-muted text-[0.7rem] truncate'
            : 'text-forge-fg-muted text-xs'
        }
      >
        {value}
      </dd>
    </div>
  )
}
