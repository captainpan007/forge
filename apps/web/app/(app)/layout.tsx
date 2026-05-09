import { requireUser } from '@/lib/auth'
import { TopBar } from '@/components/nav/TopBar'
import { Sidebar } from '@/components/nav/Sidebar'
import { JarvisPanel } from '@/components/jarvis/JarvisPanel'

// 所有 (app) 路由都依赖 auth()，必须 per-request 渲染
export const dynamic = 'force-dynamic'

/**
 * Authenticated app layout — 三栏：左侧栏 / 主内容 / JARVIS 浮层
 *
 * 所有 (app)/* 路由共享这个布局
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await requireUser()

  return (
    <div className="min-h-screen flex flex-col bg-forge-bg">
      <TopBar user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <JarvisPanel user={user} />
    </div>
  )
}
