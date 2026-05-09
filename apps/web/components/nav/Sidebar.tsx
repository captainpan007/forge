import Link from 'next/link'
import { getKnowledgeGraph } from '@/lib/content'

/**
 * 左侧栏 — 显示 Active Projects 列表 + 全局导航
 *
 * Server Component，拉取项目数据
 */
export async function Sidebar() {
  const graph = await getKnowledgeGraph()
  const projects = Array.from(graph.projects.values())

  return (
    <aside className="w-56 shrink-0 border-r border-forge-border bg-forge-bg overflow-y-auto">
      <nav className="p-3 space-y-6">
        {/* Active Projects */}
        <section>
          <h3 className="text-[0.65rem] font-mono text-forge-fg-subtle uppercase tracking-wider px-2 mb-2">
            Projects
          </h3>
          <ul className="space-y-0.5">
            {projects.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/projects/${project.slug}/workshop`}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-forge-bg-hover transition-colors"
                >
                  <span className="size-1.5 rounded-full bg-forge-fg-subtle" />
                  <span className="truncate">{project.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Tools */}
        <section>
          <h3 className="text-[0.65rem] font-mono text-forge-fg-subtle uppercase tracking-wider px-2 mb-2">
            Tools
          </h3>
          <ul className="space-y-0.5">
            <SidebarLink href="/dashboard" label="Dashboard" />
            <SidebarLink href="/projects" label="Browse Projects" />
            <SidebarLink href="/journal" label="Journal" />
            <SidebarLink href="/profile" label="Profile" />
            <SidebarLink href="/settings" label="Settings" />
          </ul>
        </section>

        {/* Footer */}
        <section className="pt-4 border-t border-forge-border-subtle">
          <a
            href="https://github.com/alexpan/forge"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-forge-fg-subtle hover:text-forge-fg-muted hover:bg-forge-bg-hover transition-colors"
          >
            <span>GitHub</span>
            <span className="ml-auto">↗</span>
          </a>
        </section>
      </nav>
    </aside>
  )
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="block px-2 py-1.5 rounded-md text-sm text-forge-fg-muted hover:text-forge-fg hover:bg-forge-bg-hover transition-colors"
      >
        {label}
      </Link>
    </li>
  )
}
