interface GraphReuseBadgeProps {
  reused: number
  new_: number
  from: string
}

export function GraphReuseBadge({ reused, new_, from }: GraphReuseBadgeProps) {
  const total = reused + new_
  const reusePct = total > 0 ? Math.round((reused / total) * 100) : 0

  return (
    <div className="forge-card p-4 my-4 border-forge-accent/30 bg-forge-accent-subtle">
      <h4 className="text-xs font-mono text-forge-accent uppercase tracking-wider mb-3">
        Graph Reuse
      </h4>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-2xl font-semibold">{reused}</p>
          <p className="text-xs text-forge-fg-muted">从 {from} 复用</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{new_}</p>
          <p className="text-xs text-forge-fg-muted">新节点</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-forge-accent">{reusePct}%</p>
          <p className="text-xs text-forge-fg-muted">复用率</p>
        </div>
      </div>
    </div>
  )
}
