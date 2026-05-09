import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getKnowledgeGraph } from '@/lib/content'
import { formatDuration } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const graph = await getKnowledgeGraph()
  const project = graph.getProject(slug)
  return { title: `${project?.title ?? 'Project'} · Graph` }
}

/**
 * 知识图谱可视化
 *
 * v0.x: 文字版列表（按阶段分组）
 * v1.0: React Flow 真正的图谱
 */
export default async function ProjectGraphPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const graph = await getKnowledgeGraph()
  const project = graph.getProject(slug)

  if (!project) notFound()

  const projectNodes = graph.getProjectNodes(slug)
  const phaseGroups = Array.from(
    projectNodes.reduce((acc, node) => {
      const key = `${node.phase}-${node.phase_name}`
      if (!acc.has(key)) acc.set(key, [])
      acc.get(key)!.push(node)
      return acc
    }, new Map<string, typeof projectNodes>())
  )

  return (
    <div className="forge-container py-8 max-w-5xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href={`/projects/${slug}/workshop`}
            className="text-xs text-forge-fg-subtle hover:text-forge-fg-muted mb-2 inline-block"
          >
            ← Workshop
          </Link>
          <h1 className="text-2xl font-semibold">{project.title} · 知识图谱</h1>
          <p className="text-sm text-forge-fg-muted mt-1">
            {projectNodes.length} 个原子知识节点 — 点击任意节点跳转到学习页面
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/projects/${slug}/workshop`}
            className="px-3 py-1.5 rounded-md text-sm border border-forge-border text-forge-fg-muted hover:text-forge-fg"
          >
            Workshop
          </Link>
          <Link
            href={`/projects/${slug}/graph`}
            className="px-3 py-1.5 rounded-md text-sm border border-forge-accent bg-forge-accent-subtle text-forge-accent"
          >
            Graph
          </Link>
        </div>
      </div>

      <div className="forge-card p-5 mb-6 border-forge-warning/30 bg-forge-warning/5">
        <p className="text-sm text-forge-fg-muted">
          <span className="font-medium text-forge-warning">v0 限制：</span>{' '}
          交互式图谱可视化（React Flow）将在 v0.4 上线。当前版本以阶段分组列出所有节点。
        </p>
      </div>

      <div className="space-y-8">
        {phaseGroups.map(([key, nodes]) => {
          const [phaseNum, phaseName] = key.split('-', 2)
          return (
            <section key={key}>
              <h2 className="text-sm font-mono text-forge-fg-subtle mb-3">
                PHASE {phaseNum} · {phaseName}
              </h2>
              <div className="space-y-2">
                {nodes.map((node) => (
                  <Link
                    key={node.id}
                    href={`/projects/${slug}/nodes/${node.id}`}
                    className="block forge-card p-3 hover:border-forge-accent/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-forge-fg-subtle w-12">
                        {node.id.toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium group-hover:text-forge-accent transition-colors">
                          {node.title}
                        </div>
                        <div className="text-xs text-forge-fg-subtle mt-0.5">
                          {formatDuration(node.duration)} · 难度 {node.difficulty}/5
                          {node.depends_on.length > 0 && (
                            <>
                              {' · 依赖 '}
                              <span className="font-mono">
                                {node.depends_on.join(', ')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
