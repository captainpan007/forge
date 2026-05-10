import Link from 'next/link'
import type { Project } from '@forge/kg'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project & { slug: string }
  active?: boolean
  progress?: number // 0-100
  /** 角落手记本 folio 装饰，比如 "fol. 01" */
  folio?: string
}

/**
 * 项目卡 — Engineering Notebook 风
 *
 * 设计：
 * - 中文标题用 Noto Serif SC（不 italic — CJK italic 是噩梦）
 * - 拉丁副标题（如 SLUG）用 Instrument Serif italic
 * - 角落 folio 装饰（"fol. 01" — 像手工笔记本页码）
 * - 1px 边框 + 4px 圆角，无 shadow（去 SaaS 塑料感）
 */
export function ProjectCard({
  project,
  active,
  progress,
  folio,
}: ProjectCardProps) {
  const totalNodes = project.learning_path.length

  return (
    <Link
      href={`/projects/${project.slug}/workshop`}
      className={cn(
        'block relative p-5 pb-9 border transition-colors group',
        'hover:bg-forge-bg-elevated min-h-[180px]',
        active
          ? 'border-forge-accent/60 bg-forge-accent-faint'
          : 'border-forge-border-subtle hover:border-forge-fg-faint'
      )}
    >
      {/* ACTIVE 印戳 */}
      {active && (
        <span className="absolute top-2.5 right-3 text-[0.6rem] font-mono uppercase tracking-[0.18em] text-forge-accent flex items-center gap-1">
          <span className="size-1 rounded-full bg-forge-accent" />
          Active
        </span>
      )}

      {/* slug 上方装饰 — 拉丁 italic 副标题 */}
      <p className="font-serif italic text-[0.7rem] text-forge-fg-faint mb-2 tracking-wide">
        — {project.slug}
      </p>

      {/* 标题 — 中文 Noto Serif SC，不 italic */}
      <h3
        className={cn(
          'forge-serif-cjk text-2xl mb-3 leading-tight transition-colors',
          active
            ? 'text-forge-fg'
            : 'text-forge-fg group-hover:text-forge-paper'
        )}
      >
        {project.title}
      </h3>

      {/* tagline */}
      <p className="text-xs text-forge-fg-muted leading-relaxed mb-5 line-clamp-2 min-h-[2.4em]">
        {project.tagline}
      </p>

      {/* metadata — 等宽 + 横线分隔 */}
      <div className="flex items-center gap-4 text-[0.65rem] text-forge-fg-subtle font-mono uppercase tracking-wider pt-3 border-t border-forge-border-subtle">
        <span>
          <span className="text-forge-fg-muted">{totalNodes}</span> nodes
        </span>
        {project.estimated_total_hours && (
          <span>
            <span className="text-forge-fg-muted">~{project.estimated_total_hours}</span>h
          </span>
        )}
        {project.estimated_calendar_weeks && (
          <span>
            <span className="text-forge-fg-muted">{project.estimated_calendar_weeks}</span>{' '}
            wk
          </span>
        )}
      </div>

      {/* folio 装饰（手记本页码感） */}
      {folio && <span className="forge-folio">{folio}</span>}

      {typeof progress === 'number' && (
        <div className="absolute bottom-0 inset-x-0 h-px bg-forge-border-subtle">
          <div
            className="h-[2px] -mt-px bg-forge-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </Link>
  )
}
