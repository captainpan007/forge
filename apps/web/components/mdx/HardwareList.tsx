interface HardwareItem {
  name: string
  price: string
  note?: string
  required: boolean
}

interface HardwareListProps {
  items: HardwareItem[]
}

export function HardwareList({ items }: HardwareListProps) {
  return (
    <div className="forge-card overflow-hidden my-4">
      <table className="w-full text-sm">
        <thead className="bg-forge-bg-elevated">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-mono text-forge-fg-subtle uppercase tracking-wider">
              零件
            </th>
            <th className="px-3 py-2 text-left text-xs font-mono text-forge-fg-subtle uppercase tracking-wider">
              价格
            </th>
            <th className="px-3 py-2 text-left text-xs font-mono text-forge-fg-subtle uppercase tracking-wider">
              备注
            </th>
            <th className="px-3 py-2 text-left text-xs font-mono text-forge-fg-subtle uppercase tracking-wider">
              必需
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={i}
              className="border-t border-forge-border-subtle hover:bg-forge-bg-hover/50 transition-colors"
            >
              <td className="px-3 py-2 font-medium">{item.name}</td>
              <td className="px-3 py-2 text-forge-fg-muted font-mono text-xs">
                {item.price}
              </td>
              <td className="px-3 py-2 text-xs text-forge-fg-muted">
                {item.note ?? '—'}
              </td>
              <td className="px-3 py-2 text-xs">
                {item.required ? (
                  <span className="text-forge-success">✓ 必需</span>
                ) : (
                  <span className="text-forge-fg-subtle">可选</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
