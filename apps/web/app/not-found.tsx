import Link from 'next/link'

// 根布局的 ClerkProvider 需要 runtime 初始化，跳过 SSG
export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-mono text-forge-fg-subtle mb-2">404</p>
        <h1 className="text-2xl font-semibold mb-3">找不到这个页面</h1>
        <p className="text-forge-fg-muted mb-6 text-sm">
          可能链接失效了，或者它从未存在过。
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded-md bg-forge-accent text-white hover:bg-forge-accent-hover transition-colors text-sm"
        >
          回到首页
        </Link>
      </div>
    </div>
  )
}
