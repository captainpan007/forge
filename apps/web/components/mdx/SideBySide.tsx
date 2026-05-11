/**
 * SideBySide — 对错并排（同步上下文比较）
 *
 * 教学原理：把"错的接法"和"对的接法"并排放在同一视野里 ——
 * 大脑做差分比较远比"先读错的再读对的"高效。也是 ConcepTest
 * 类问题的视觉化版。
 *
 * 用法：
 *   <SideBySide
 *     left={{
 *       label: "错的接法",
 *       visual: "/diagrams/no-common-gnd.svg",
 *       caption: "Pi 跟外置电源各自有 GND，互不相连",
 *       consequence: "→ 喇叭收不到信号"
 *     }}
 *     right={{
 *       label: "对的接法",
 *       visual: "/diagrams/common-gnd.svg",
 *       caption: "一根黑线把两个 GND 连起来",
 *       consequence: "→ 共同零点，喇叭工作"
 *     }}
 *     takeaway="两块电路必须先「约定零点」才能互相说话"
 *   />
 */

interface SideBySideSlot {
  label: string
  visual?: string
  caption?: string
  /** 后果描述 — 会用对应色调（左红右绿） */
  consequence?: string
  /** alt 文本 */
  alt?: string
}

interface SideBySideProps {
  left: SideBySideSlot
  right: SideBySideSlot
  /** 底部总结（可选） */
  takeaway?: string
  /** 左红右绿（错/对模式）— 默认开启 */
  contrast?: boolean
}

export function SideBySide({
  left,
  right,
  takeaway,
  contrast = true,
}: SideBySideProps) {
  return (
    <div className="my-6 forge-card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-forge-border-subtle">
        {/* 左侧 */}
        <div
          className={
            contrast
              ? 'border-l-2 border-forge-danger/40 bg-forge-danger/[0.03]'
              : ''
          }
        >
          <div className="px-4 py-2 border-b border-forge-border-subtle bg-forge-bg-elevated">
            <span
              className="text-xs font-mono uppercase tracking-wider"
              style={{ color: contrast ? '#fca5a5' : undefined }}
            >
              {contrast ? '✗ ' : ''}
              {left.label}
            </span>
          </div>
          {left.visual && (
            <div className="bg-forge-bg-elevated p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={left.visual}
                alt={left.alt ?? left.label}
                className="w-full h-auto"
              />
            </div>
          )}
          <div className="px-4 py-3 space-y-1.5">
            {left.caption && (
              <p className="text-xs text-forge-fg-muted leading-relaxed">
                {left.caption}
              </p>
            )}
            {left.consequence && (
              <p
                className="text-xs font-mono"
                style={{ color: contrast ? '#fca5a5' : '#cbd5e1' }}
              >
                {left.consequence}
              </p>
            )}
          </div>
        </div>

        {/* 右侧 */}
        <div
          className={
            contrast
              ? 'border-l-2 border-forge-success/40 bg-forge-success/[0.04]'
              : ''
          }
        >
          <div className="px-4 py-2 border-b border-forge-border-subtle bg-forge-bg-elevated">
            <span
              className="text-xs font-mono uppercase tracking-wider"
              style={{ color: contrast ? '#86efac' : undefined }}
            >
              {contrast ? '✓ ' : ''}
              {right.label}
            </span>
          </div>
          {right.visual && (
            <div className="bg-forge-bg-elevated p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={right.visual}
                alt={right.alt ?? right.label}
                className="w-full h-auto"
              />
            </div>
          )}
          <div className="px-4 py-3 space-y-1.5">
            {right.caption && (
              <p className="text-xs text-forge-fg-muted leading-relaxed">
                {right.caption}
              </p>
            )}
            {right.consequence && (
              <p
                className="text-xs font-mono"
                style={{ color: contrast ? '#86efac' : '#cbd5e1' }}
              >
                {right.consequence}
              </p>
            )}
          </div>
        </div>
      </div>

      {takeaway && (
        <div className="px-4 py-3 border-t border-forge-border-subtle bg-forge-bg text-center">
          <p className="text-sm text-forge-fg italic">→ {takeaway}</p>
        </div>
      )}
    </div>
  )
}
