interface ProjectStatsProps {
  hours: number
  weeks: number
  cost: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  nodes: number
}

const difficultyMap = {
  beginner: '入门',
  intermediate: '中等',
  advanced: '进阶',
} as const

export function ProjectStats({ hours, weeks, cost, difficulty, nodes }: ProjectStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-6">
      <Stat label="预计时长" value={`${hours}h`} />
      <Stat label="周数" value={`${weeks} 周`} />
      <Stat label="成本" value={cost} />
      <Stat label="难度" value={difficultyMap[difficulty]} />
      <Stat label="节点数" value={String(nodes)} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="forge-card px-3 py-2">
      <p className="text-[0.65rem] font-mono text-forge-fg-subtle uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}
