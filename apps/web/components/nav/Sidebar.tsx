import Link from 'next/link'
import { getKnowledgeGraph } from '@/lib/content'

/**
 * 左侧栏 — Anti-AI 改造
 * 用 forge-section-label + monospace 元数据 + 极简 hover
 */
export async function Sidebar() {
  const graph = await getKnowledgeGraph()
  const projects = Array.from(graph.projects.values())

  return (
    <aside className="w-56 shrink-0 border-r border-forge-border-subtle bg-forge-bg overflow-y-auto">
      <nav className="p-4 space-y-7">
        {/* Active Projects */}
        <section>
          <h3 className="forge-section-label px-2 mb-3">Projects</h3>
          <ul className="space-y-0.5">
            {projects.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/projects/${project.slug}/workshop`}
                  className="flex items-center gap-2.5 px-2 py-1.5 text-sm text-forge-fg-muted hover:text-forge-fg hover:bg-forge-bg-hover transition-colors group"
                >
                  <span className="size-1 rounded-full bg-forge-paper/60 group-hover:bg-forge-paper transition-colors" />
                  <span className="truncate">{project.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Tools */}
        <section>
          <h3 className="forge-section-label px-2 mb-3">Tools</h3>
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
            href="https://github.com/captainpan007/forge"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 text-xs font-mono text-forge-fg-subtle hover:text-forge-fg-muted transition-colors"
          >
            <span>github</span>
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
        className="block px-2 py-1.5 text-sm text-forge-fg-muted hover:text-forge-fg hover:bg-forge-bg-hover transition-colors"
      >
        {label}
      </Link>
    </li>
  )
}
