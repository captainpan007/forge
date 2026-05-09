import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

// 这页要读 auth state，必须 per-request
export const dynamic = 'force-dynamic'

/**
 * 营销首页 / Landing
 *
 * - 已登录用户 → 自动跳到 /dashboard
 * - 未登录用户 → 看到这个页面，能 sign in/up
 */
export default async function HomePage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-forge-border">
        <div className="forge-container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-7 rounded bg-forge-accent flex items-center justify-center text-white font-bold text-sm">
              F
            </div>
            <span className="font-semibold tracking-tight">forge</span>
            <span className="text-xs text-forge-fg-subtle">alexpan.dev</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/sign-in"
              className="px-3 py-1.5 rounded-md text-forge-fg-muted hover:text-forge-fg hover:bg-forge-bg-hover transition-colors"
            >
              登录
            </Link>
            <Link
              href="/sign-up"
              className="px-3 py-1.5 rounded-md bg-forge-accent text-white hover:bg-forge-accent-hover transition-colors"
            >
              注册
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="forge-container py-20">
          <div className="max-w-3xl">
            <p className="text-sm text-forge-accent font-mono mb-4">
              forge.alexpan.dev
            </p>
            <h1 className="text-5xl font-semibold tracking-tight mb-6 leading-tight">
              个人工程师驾驶舱
              <br />
              <span className="text-forge-fg-muted">用项目教自己嵌入式</span>
            </h1>
            <p className="text-lg text-forge-fg-muted mb-8 max-w-2xl leading-relaxed">
              不再翻 30 个教程网站。一个项目（小车、玩具、智能家居），AI 助教 JARVIS
              帮你算出该学什么、按什么顺序、学到哪、卡哪、怎么过——直到你儿子真的拿到能玩的东西。
            </p>
            <div className="flex items-center gap-3 mb-12">
              <Link
                href="/sign-up"
                className="px-5 py-2.5 rounded-md bg-forge-accent text-white hover:bg-forge-accent-hover transition-colors text-sm font-medium"
              >
                开始一个项目 →
              </Link>
              <a
                href="https://github.com/captainpan007/forge"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-md border border-forge-border text-forge-fg hover:bg-forge-bg-hover transition-colors text-sm"
              >
                GitHub
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <div className="forge-card p-4">
                <div className="text-forge-accent text-sm font-mono mb-1">01</div>
                <h3 className="font-semibold mb-1">Musk 倒推法</h3>
                <p className="text-xs text-forge-fg-muted">
                  选项目 → AI 算出需要哪些原子知识 → 倒推学习路径
                </p>
              </div>
              <div className="forge-card p-4">
                <div className="text-forge-accent text-sm font-mono mb-1">02</div>
                <h3 className="font-semibold mb-1">JARVIS 助教</h3>
                <p className="text-xs text-forge-fg-muted">
                  Claude API 驱动，永远知道你在哪一节、卡在哪、需要什么
                </p>
              </div>
              <div className="forge-card p-4">
                <div className="text-forge-accent text-sm font-mono mb-1">03</div>
                <h3 className="font-semibold mb-1">费曼强制</h3>
                <p className="text-xs text-forge-fg-muted">
                  能不能给 26 个月的孩子讲清楚——这是通关条件
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-forge-border">
        <div className="forge-container h-12 flex items-center justify-between text-xs text-forge-fg-subtle">
          <span>© 2026 Alex Pan · MIT License</span>
          <div className="flex gap-4">
            <a
              href="https://github.com/captainpan007/forge"
              className="hover:text-forge-fg transition-colors"
            >
              GitHub
            </a>
            <Link href="/docs" className="hover:text-forge-fg transition-colors">
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
