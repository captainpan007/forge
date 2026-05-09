import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { getKnowledgeGraph } from '@/lib/content'
import { getUserProgress } from '@/lib/db/queries'
import { formatDuration } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const graph = await getKnowledgeGraph()
  const project = graph.getProject(slug)
  return { title: project?.title ?? 'Project' }
}

/**
 * 项目工坊（项目内主页）
 *
 * 显示：
 *   - 阶段时间轴
 *   - "Now" 指示器 + "Up Next" 卡片
 *   - Project Logbook
 *   - Failure Log
 */
export default async function ProjectWorkshopPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { user } = await requireUser()
  const graph = await getKnowledgeGraph()
  const project = graph.getProject(slug)

  if (!project) notFound()

  const projectNodes = graph.getProjectNodes(slug)
  const userProgress = await getUserProgress(user.id)
  const completed = new Set(
    userProgress.filter((p) => p.status === 'completed').map((p) => p.nodeId)
  )
  const nextNode = graph.nextNode(slug, completed)

  const phases = Array.from(
    new Map(
      projectNodes.map((n) => [n.phase, { phase: n.phase, name: n.phase_name }])
    ).values()
  ).sort((a, b) => a.phase - b.phase)

  return (
    <div className="forge-container py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-xs text-forge-fg-subtle hover:text-forge-fg-muted mb-2 inline-block"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-semibold">{project.title}</h1>
          <p className="text-sm text-forge-fg-muted mt-1">{project.tagline}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/projects/${slug}/workshop`}
            className="px-3 py-1.5 rounded-md text-sm border border-forge-accent bg-forge-accent-subtle text-forge-accent"
          >
            Workshop
          </Link>
          <Link
            href={`/projects/${slug}/graph`}
            className="px-3 py-1.5 rounded-md text-sm border border-forge-border text-forge-fg-muted hover:text-forge-fg"
          >
            Graph
          </Link>
        </div>
      </div>

      {/* Phase timeline */}
      <section className="forge-card p-5 mb-6">
        <h2 className="text-sm font-mono text-forge-fg-subtle mb-3">PROJECT TIMELINE</h2>
        <div className="space-y-3">
          {phases.map((phase) => {
            const phaseNodes = projectNodes.filter((n) => n.phase === phase.phase)
            const phaseDone = phaseNodes.filter((n) => completed.has(n.id)).length
            const pct =
              phaseNodes.length > 0
                ? Math.round((phaseDone / phaseNodes.length) * 100)
                : 0
            return (
              <div key={phase.phase} className="flex items-center gap-3">
                <div className="text-xs font-mono text-forge-fg-subtle w-6">
                  P{phase.phase}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{phase.name}</span>
                    <span className="text-forge-fg-subtle font-mono text-xs">
                      {phaseDone}/{phaseNodes.length}
                    </span>
                  </div>
                  <div className="h-1.5 bg-forge-bg-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-forge-accent transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Up Next */}
      {nextNode && (
        <section className="mb-6">
          <h2 className="text-sm font-mono text-forge-fg-subtle mb-3">UP NEXT</h2>
          <Link
            href={`/projects/${slug}/nodes/${nextNode.id}`}
            className="block forge-card p-5 hover:border-forge-accent/50 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-forge-accent">
                    {nextNode.id.toUpperCase()}
                  </span>
                  <span className="text-xs text-forge-fg-subtle">·</span>
                  <span className="text-xs text-forge-fg-subtle">
                    {nextNode.phase_name}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1 group-hover:text-forge-accent transition-colors">
                  {nextNode.title}
                </h3>
                <p className="text-sm text-forge-fg-subtle">
                  {formatDuration(nextNode.duration)} · 难度 {nextNode.difficulty}/5
                </p>
              </div>
              <div className="text-forge-accent shrink-0 ml-4">→</div>
            </div>
          </Link>
        </section>
      )}

      {/* Logbook & Failure Log — placeholders for v0.5+ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="forge-card p-5">
          <h3 className="text-sm font-mono text-forge-fg-subtle mb-3">PROJECT LOGBOOK</h3>
          <p className="text-sm text-forge-fg-subtle italic">
            完成第一个节点后，您的进展会自动记录在这里。
          </p>
        </div>
        <div className="forge-card p-5">
          <h3 className="text-sm font-mono text-forge-fg-subtle mb-3">FAILURE LOG</h3>
          <p className="text-sm text-forge-fg-subtle italic">
            您卡过的问题会在这里归档（可选公开），帮助以后的学习者。
          </p>
        </div>
      </section>
    </div>
  )
}
