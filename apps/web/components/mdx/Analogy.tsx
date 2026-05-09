interface AnalogyProps {
  pairs: { tech: string; life: string }[]
}

export function Analogy({ pairs }: AnalogyProps) {
  return (
    <div className="forge-card p-4 my-4">
      <h4 className="text-xs font-mono text-forge-fg-subtle uppercase tracking-wider mb-3">
        类比对照
      </h4>
      <ul className="space-y-2">
        {pairs.map((p, i) => (
          <li key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 text-sm">
            <span className="font-mono text-forge-accent shrink-0 sm:w-32">{p.tech}</span>
            <span className="text-forge-fg-muted">≈ {p.life}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
