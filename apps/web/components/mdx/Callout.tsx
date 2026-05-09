import { cn } from '@/lib/utils'

type CalloutType = 'info' | 'tip' | 'warning' | 'danger'

interface CalloutProps {
  type?: CalloutType
  icon?: string
  children: React.ReactNode
}

const typeStyles: Record<CalloutType, string> = {
  info: 'border-forge-info/30 bg-forge-info/5',
  tip: 'border-forge-success/30 bg-forge-success/5',
  warning: 'border-forge-warning/30 bg-forge-warning/5',
  danger: 'border-forge-danger/30 bg-forge-danger/5',
}

export function Callout({ type = 'info', icon, children }: CalloutProps) {
  return (
    <div className={cn('forge-card p-4 my-4 border', typeStyles[type])}>
      <div className="flex gap-3">
        {icon && <span className="shrink-0 text-base">{icon}</span>}
        <div className="flex-1 text-sm text-forge-fg leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
