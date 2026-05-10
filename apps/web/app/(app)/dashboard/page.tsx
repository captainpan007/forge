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

  const hasActive = activeProjects.length > 0

  return (
    <div className="forge-container py-12 max-w-5xl">
      {/* JARVIS Daily Briefing — drop cap + 纸黄左竖线（Engineering Notebook 招式） */}
      <section className="mb-14 relative">
        <p className="forge-section-label mb-3 text-forge-paper flex items-center gap-2">
          <span className="font-serif italic text-base normal-case tracking-normal">
            §
          </span>{' '}
          JARVIS · Daily Briefing
        </p>
        <div className="border-l-2 border-forge-paper pl-5 py-1">
          <p className="forge-drop-cap-cjk text-[15px] text-forge-fg-muted leading-[1.85] mb-1">
            <em className="font-sans not-italic text-forge-fg font-medium">
              {user.jarvisAddress},
            </em>{' '}
            欢迎回到 forge. 您当前还没有激活任何项目——下面有{' '}
            <span className="text-forge-fg font-mono">{allProjects.length}</span>{' '}
            个可以开始。建议从{' '}
            <span className="forge-serif-cjk text-forge-paper text-base">
              发声盒
            </span>{' '}
            开始，约 12 小时即可完成第一个能给儿子玩的成品。
          </p>
        </div>
      </section>

      {/* 章节装饰分隔 */}
      <div className="forge-ornament">
        <span className="forge-ornament-glyph">✦</span>
      </div>

      {/* Active projects — Chapter I */}
      {hasActive && (
        <section className="mb-14">
          <div className="forge-roman-chapter" data-roman="I.">
            <span className="forge-roman-chapter-title">Current Work</span>
            <span className="forge-roman-chapter-rule" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeProjects.map((project, i) => (
              <ProjectCard
                key={project.slug}
                project={project}
                active
                folio={`fol. ${String(i + 1).padStart(2, '0')}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* All projects — Chapter II */}
      <section>
        <div className="forge-roman-chapter" data-roman={hasActive ? 'II.' : 'I.'}>
          <span className="forge-roman-chapter-title">
            {hasActive ? 'Browse More' : 'Available Projects'}
          </span>
          <span className="forge-roman-chapter-rule" />
          <Link
            href="/projects"
            className="text-[0.65rem] font-mono text-forge-fg-muted hover:text-forge-paper transition-colors uppercase tracking-wider shrink-0"
          >
            view all  →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allProjects.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              folio={`fol. ${String(i + 1).padStart(2, '0')}`}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
