import Link from 'next/link'
import type { Project } from '@forge/kg'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project & { slug: string }
  active?: boolean
  progress?: number      // 0-100
}

export function ProjectCard({ project, active, progress }: ProjectCardProps) {
  const totalNodes = project.learning_path.length

  return (
    <Link
      href={`/projects/${project.slug}/workshop`}
      className={cn(
        'block forge-card p-4 transition-colors group',
        active && 'border-forge-accent/50'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-base group-hover:text-forge-accent transition-colors">
          {project.title}
        </h3>
        {active && (
          <span className="text-[0.65rem] font-mono px-1.5 py-0.5 rounded bg-forge-accent-subtle text-forge-accent">
            ACTIVE
          </span>
        )}
      </div>

      <p className="text-xs text-forge-fg-muted leading-relaxed mb-4 line-clamp-2">
        {project.tagline}
      </p>

      <div className="flex items-center justify-between text-[0.7rem] text-forge-fg-subtle font-mono">
        <span>{totalNodes} 节</span>
        {project.estimated_total_hours && (
          <span>~{project.estimated_total_hours}h</span>
        )}
        {project.estimated_calendar_weeks && (
          <span>{project.estimated_calendar_weeks} 周</span>
        )}
      </div>

      {typeof progress === 'number' && (
        <div className="mt-3 h-1 bg-forge-bg-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-forge-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </Link>
  )
}
