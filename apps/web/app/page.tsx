import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

// 这页要读 auth state，必须 per-request
export const dynamic = 'force-dynamic'

/**
 * 营销首页 / Landing — Anti-AI editorial 改造
 *
 * 设计：
 * - Hero 用衬线斜体（Instrument Serif italic）— New Yorker 气质
 * - 章节标签用等宽 + uppercase 字距 — 工程文档感
 * - 三个 feature 用横线分隔代替卡片 — IBM Carbon 风
 * - 配色赭橙 + 纸黄 — 像旧书 + 黄铜，不是 SaaS 控制台
 */
export default async function HomePage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-forge-border-subtle">
        <div className="forge-container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-7 flex items-center justify-center font-mono text-sm text-forge-accent border border-forge-accent/40">
              F
            </div>
            <span className="font-medium tracking-tight">forge</span>
            <span className="text-xs text-forge-fg-subtle font-mono">·  alexpan.dev</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/sign-in"
              className="px-3 py-1.5 text-forge-fg-muted hover:text-forge-fg transition-colors"
            >
              登录
            </Link>
            <Link
              href="/sign-up"
              className="px-3 py-1.5 border border-forge-accent text-forge-accent hover:bg-forge-accent-subtle transition-colors"
            >
              注册 →
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="forge-container py-24">
          <div className="max-w-3xl">
            {/* 章节标签 — 出版物气质 */}
            <p className="forge-section-label mb-8">
              <span className="text-forge-accent">A FIELD MANUAL</span>
              <span className="mx-2 text-forge-fg-faint">/</span>
              <span>FOR THE OLDER LEARNER</span>
            </p>

            {/* Hero — 衬线斜体 + 减字号 */}
            <h1 className="forge-hero mb-8">
              <em>Build it</em>
              <br />
              <span className="text-forge-fg-muted">to know it.</span>
            </h1>

            {/* 副标题 — 中文 + 段落感 */}
            <p className="text-base md:text-lg text-forge-fg-muted mb-3 max-w-2xl leading-relaxed">
              不再翻 30 个教程网站。
            </p>
            <p className="text-base md:text-lg text-forge-fg-muted mb-10 max-w-2xl leading-relaxed">
              一个项目——小车、玩具、智能家居——AI 助教 JARVIS 帮你算出该学什么、
              按什么顺序、学到哪、卡哪、怎么过。直到你儿子真的拿到能玩的东西。
            </p>

            <div className="flex items-center gap-3 mb-20">
              <Link
                href="/sign-up"
                className="px-5 py-2.5 bg-forge-accent text-forge-bg hover:bg-forge-accent-hover transition-colors text-sm font-medium"
              >
                开始一个项目  →
              </Link>
              <a
                href="https://github.com/captainpan007/forge"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 border border-forge-border text-forge-fg-muted hover:text-forge-fg hover:border-forge-fg-faint transition-colors text-sm"
              >
                GitHub  ↗
              </a>
            </div>

            {/* 三原则 — 横线分隔代替卡片，工程文档气质 */}
            <div className="grid grid-cols-1 md:grid-cols-3 max-w-3xl border-t border-forge-border-subtle">
              {[
                {
                  num: '01',
                  title: 'Musk 倒推法',
                  body: '选项目 → AI 算出需要哪些原子知识 → 倒推学习路径',
                },
                {
                  num: '02',
                  title: 'JARVIS 助教',
                  body: 'Claude API 驱动，永远知道你在哪一节、卡在哪、需要什么',
                },
                {
                  num: '03',
                  title: '费曼强制',
                  body: '能不能给 26 个月的孩子讲清楚——这是通关条件',
                },
              ].map((p) => (
                <div
                  key={p.num}
                  className="py-5 md:px-5 md:border-l border-forge-border-subtle first:md:border-l-0"
                >
                  <div className="forge-section-label mb-2">{p.num}</div>
                  <h3 className="font-medium mb-2 text-forge-fg">{p.title}</h3>
                  <p className="text-xs text-forge-fg-muted leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-forge-border-subtle">
        <div className="forge-container h-12 flex items-center justify-between text-xs text-forge-fg-subtle font-mono">
          <span>© 2026 Alex Pan  ·  MIT</span>
          <div className="flex gap-5">
            <a
              href="https://github.com/captainpan007/forge"
              className="hover:text-forge-fg-muted transition-colors"
            >
              github
            </a>
            <Link href="/docs" className="hover:text-forge-fg-muted transition-colors">
              docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
