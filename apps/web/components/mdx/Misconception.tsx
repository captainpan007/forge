/**
 * Misconception — 显式误解预防（Mazur Peer Instruction 风格）
 *
 * 教学原理：研究显示，错误概念预先点破比"自己慢慢悟出来"快 5x，
 * 且不会形成顽固错误图式。每个抽象概念都至少配一个 Misconception。
 *
 * 用法：
 *   <Misconception
 *     myth="GND 是接到大地里"
 *     truth="GND 只是电路里约定的'最低参考点' — 跟大地没关系"
 *     why="电压是相对值。'地'就是被标为 0V 的那个点 — 哪个点都行，约定了就行。"
 *   />
 */

interface MisconceptionProps {
  /** 常见错觉/误解 */
  myth: string
  /** 实际真相 */
  truth: string
  /** 可选：为什么会有这个误解 / 真相背后的原理 */
  why?: string
}

export function Misconception({ myth, truth, why }: MisconceptionProps) {
  return (
    <div className="my-5 forge-card overflow-hidden">
      <div className="bg-forge-bg-elevated px-4 py-2 border-b border-forge-border-subtle">
        <span className="text-[0.7rem] font-mono text-forge-fg-subtle uppercase tracking-wider">
          🧨 常见误解
        </span>
      </div>

      {/* 误解：红色调 */}
      <div className="px-4 py-3 border-l-2 border-forge-danger/60 bg-forge-danger/5">
        <div className="flex items-start gap-2">
          <span className="text-forge-danger font-mono text-xs shrink-0 mt-0.5">✗</span>
          <div>
            <div className="text-[0.7rem] font-mono text-forge-danger uppercase tracking-wider mb-1">
              你可能以为
            </div>
            <p className="text-sm text-forge-fg-muted">{myth}</p>
          </div>
        </div>
      </div>

      {/* 真相：绿色调 */}
      <div className="px-4 py-3 border-l-2 border-forge-success/60 bg-forge-success/5">
        <div className="flex items-start gap-2">
          <span className="text-forge-success font-mono text-xs shrink-0 mt-0.5">✓</span>
          <div>
            <div className="text-[0.7rem] font-mono text-forge-success uppercase tracking-wider mb-1">
              其实
            </div>
            <p className="text-sm text-forge-fg">{truth}</p>
          </div>
        </div>
      </div>

      {/* 可选：原理解释 */}
      {why && (
        <div className="px-4 py-3 border-t border-forge-border-subtle text-xs text-forge-fg-subtle leading-relaxed">
          <span className="font-mono uppercase tracking-wider mr-2">为何会这样：</span>
          {why}
        </div>
      )}
    </div>
  )
}
