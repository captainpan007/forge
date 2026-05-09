import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { getKnowledgeGraph } from '@/lib/content'
import { getUserProjects } from '@/lib/db/queries'
import { ProjectCard } from '@/components/project/ProjectCard'

export const metadata = {
  title: 'Dashboard',
}

/**
 * 项目工坊（首页）— 用户登录后的默认页
 *
 * 包含：
 *   - JARVIS Daily Briefing (顶部主动卡片)
 *   - "Continue where you left off" 大卡
 *   - "Other Active Projects" 网格
 *   - "Browse Projects" 入口
 */
export default async function DashboardPage() {
  const { user } = await requireUser()
  const graph = await getKnowledgeGraph()
  const userProjects = await getUserProjects(user.id)

  const activeProjects = userProjects
    .map((up) => graph.getProject(up.projectSlug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)

  const allProjects = Array.from(graph.projects.values())

  return (
    <div className="forge-container py-8">
      {/* JARVIS Briefing — Phase 3 上线后启用 */}
      <section className="forge-card p-5 mb-8 border-forge-accent/30 bg-forge-accent-subtle">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded bg-forge-accent flex items-center justify-center text-white font-mono text-xs shrink-0">
            J
          </div>
          <div className="flex-1">
            <p className="text-xs text-forge-accent font-mono mb-1">
              JARVIS · Daily Briefing
            </p>
            <p className="text-sm text-forge-fg leading-relaxed">
              Sir, 欢迎来到 forge. 您当前还没有激活任何项目——下面有 {allProjects.length} 个可以开始的项目。
              {' '}建议从 <span className="font-medium">发声盒</span> 开始，约 12 小时即可完成第一个能给儿子玩的成品。
            </p>
          </div>
        </div>
      </section>

      {/* Active projects */}
      {activeProjects.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Active Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} active />
            ))}
          </div>
        </section>
      )}

      {/* All projects */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            {activeProjects.length > 0 ? 'Browse More' : '可以开始的项目'}
          </h2>
          <Link
            href="/projects"
            className="text-sm text-forge-fg-muted hover:text-forge-fg"
          >
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </div>
  )
}
