import { getKnowledgeGraph } from '@/lib/content'

interface PhaseTimelineProps {
  project: string
}

export async function PhaseTimeline({ project }: PhaseTimelineProps) {
  const graph = await getKnowledgeGraph()
  const projectNodes = graph.getProjectNodes(project)

  const phases = Array.from(
    new Map(
      projectNodes.map((n) => [
        n.phase,
        { phase: n.phase, name: n.phase_name, count: 0 },
      ])
    ).values()
  ).sort((a, b) => a.phase - b.phase)

  // 计算每阶段节点数
  for (const node of projectNodes) {
    const p = phases.find((x) => x.phase === node.phase)
    if (p) p.count++
  }

  return (
    <div className="forge-card p-4 my-4">
      <div className="flex items-stretch overflow-x-auto">
        {phases.map((phase, i) => (
          <div
            key={phase.phase}
            className="flex-1 min-w-[100px] px-3 py-2 border-r last:border-r-0 border-forge-border-subtle"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[0.65rem] font-mono text-forge-accent">
                P{phase.phase}
              </span>
              {i < phases.length - 1 && (
                <span className="text-forge-fg-subtle">→</span>
              )}
            </div>
            <p className="text-xs font-medium">{phase.name}</p>
            <p className="text-[0.65rem] text-forge-fg-subtle font-mono mt-0.5">
              {phase.count} 节
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
