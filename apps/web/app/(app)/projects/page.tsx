import { getKnowledgeGraph } from '@/lib/content'
import { ProjectCard } from '@/components/project/ProjectCard'

export const metadata = {
  title: 'Projects',
}

export default async function ProjectsPage() {
  const graph = await getKnowledgeGraph()
  const allProjects = Array.from(graph.projects.values())

  return (
    <div className="forge-container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">所有项目</h1>
        <p className="text-sm text-forge-fg-muted">
          每个项目是一条完整的"从零到能玩"的路径。挑一个开始。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  )
}
