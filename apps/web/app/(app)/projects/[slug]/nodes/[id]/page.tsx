import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getKnowledgeGraph } from '@/lib/content'
import { loadNodeMdx } from '@/lib/mdx'
import { mdxComponents } from '@/components/mdx'
import { formatDuration, difficultyDots } from '@/lib/utils'

// GFM 插件 — 启用 Markdown 表格、任务列表、删除线、自动链接等
const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { id } = await params
  const graph = await getKnowledgeGraph()
  const node = graph.getNode(id)
  return { title: node?.title ?? 'Node' }
}

/**
 * 节点学习视图（核心页面）
 *
 * v0.2: 真实 MDX 渲染上线 — 用 next-mdx-remote/rsc + 已注册的 mdxComponents
 * v1.0: 三栏布局（教材 / 交互 / JARVIS）目标
 */
export default async function NodePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params
  const graph = await getKnowledgeGraph()
  const project = graph.getProject(slug)
  const node = graph.getNode(id)

  if (!project || !node) notFound()

  // 找前后节点
  const learningPath = project.learning_path
  const idx = learningPath.indexOf(id)
  const prevId = idx > 0 ? learningPath[idx - 1] : null
  const nextId = idx >= 0 && idx < learningPath.length - 1 ? learningPath[idx + 1] : null

  const dependencies = node.depends_on
    .map((d) => graph.getNode(d))
    .filter((d): d is NonNullable<typeof d> => d !== undefined)

  // 尝试加载该节点的 MDX 内容；不存在 → 渲染占位
  const mdxNode = loadNodeMdx(node.id, node.slug)

  return (
    <div className="forge-container py-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="text-xs text-forge-fg-subtle mb-3">
        <Link href={`/projects/${slug}/workshop`} className="hover:text-forge-fg-muted">
          {project.title}
        </Link>
        <span className="mx-2">/</span>
        <span>Phase {node.phase} · {node.phase_name}</span>
        <span className="mx-2">/</span>
        <span className="font-mono text-forge-fg-muted">{node.id.toUpperCase()}</span>
      </div>

      {/* Title + meta */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold mb-3">{node.title}</h1>
        <div className="flex items-center gap-3 text-xs text-forge-fg-muted">
          <span className="font-mono">{formatDuration(node.duration)}</span>
          <span className="text-forge-fg-subtle">·</span>
          <span className="font-mono">难度 {difficultyDots(node.difficulty)}</span>
          <span className="text-forge-fg-subtle">·</span>
          <span className="flex flex-wrap gap-1">
            {node.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded bg-forge-bg-elevated text-forge-fg-subtle font-mono text-[0.7rem]"
              >
                {tag}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <div className="forge-card p-4 mb-6">
          <h3 className="text-xs font-mono text-forge-fg-subtle mb-2">
            DEPENDS ON · 学这一节前你需要会
          </h3>
          <div className="flex flex-wrap gap-2">
            {dependencies.map((dep) => (
              <Link
                key={dep.id}
                href={`/projects/${slug}/nodes/${dep.id}`}
                className="px-2 py-1 rounded text-xs bg-forge-bg-elevated border border-forge-border-subtle hover:border-forge-fg-subtle/40 transition-colors"
              >
                <span className="font-mono text-forge-fg-subtle mr-1.5">
                  {dep.id.toUpperCase()}
                </span>
                {dep.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* MDX 真内容 / placeholder */}
      {mdxNode ? (
        <article className="prose-forge mb-8">
          <MDXRemote
            source={mdxNode.content}
            components={mdxComponents}
            options={mdxOptions}
          />
        </article>
      ) : (
        <div className="forge-card p-8 mb-8 border-forge-warning/30">
          <div className="text-center">
            <p className="text-sm font-mono text-forge-warning mb-2">CONTENT PENDING</p>
            <h2 className="text-xl font-semibold mb-3">这一节的内容还没写</h2>
            <p className="text-sm text-forge-fg-muted max-w-md mx-auto mb-4">
              这是一个完全合法的节点（在 <code>knowledge-graph.yaml</code> 里），但
              <code>
                content/nodes/{node.id}-{node.slug}.mdx
              </code>{' '}
              还不存在——等作者把它写出来。
            </p>
            <p className="text-xs text-forge-fg-subtle">
              想自己写？参考{' '}
              <code>content/nodes/n05-gpio-basics.mdx</code>{' '}
              + <code>docs/CONTENT_GUIDE.md</code>
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-forge-border">
        {prevId ? (
          <Link
            href={`/projects/${slug}/nodes/${prevId}`}
            className="text-sm text-forge-fg-muted hover:text-forge-fg"
          >
            ← {graph.getNode(prevId)?.title ?? '上一节'}
          </Link>
        ) : (
          <span />
        )}
        {nextId && (
          <Link
            href={`/projects/${slug}/nodes/${nextId}`}
            className="text-sm text-forge-accent hover:text-forge-accent-hover"
          >
            {graph.getNode(nextId)?.title ?? '下一节'} →
          </Link>
        )}
      </div>
    </div>
  )
}
