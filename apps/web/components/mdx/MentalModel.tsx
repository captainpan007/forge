/**
 * MentalModel — 显式心智模型标记（Ausubel Schema 建构）
 *
 * 教学原理：让大脑明确知道"这是要建立的核心心智模型，记住这张图就够"。
 * 没有显式标记，学习者会平等对待所有信息 → 无法分清主次。
 *
 * 在 N 节点末尾用一次，把"完成后你脑子里应该有的画面"显式化。
 *
 * 用法：
 *   <MentalModel
 *     name="电路 = 水管系统"
 *     points={[
 *       "电压 = 水压（推动力）",
 *       "电流 = 水流量（每秒走多少）",
 *       "GND = 排水池（最终回流点）",
 *     ]}
 *     visual="/diagrams/water-circuit.svg"
 *     visualAlt="水管类比电路"
 *   />
 */

interface MentalModelProps {
  /** 心智模型的名字（一句话能复述） */
  name: string
  /** 这个模型的关键映射点（3-5 条） */
  points: string[]
  /** 可选：配套视觉 */
  visual?: string
  visualAlt?: string
}

export function MentalModel({ name, points, visual, visualAlt }: MentalModelProps) {
  return (
    <div className="my-6 forge-card overflow-hidden border-2 border-forge-accent/40">
      <div className="bg-forge-accent/10 px-4 py-3 border-b border-forge-accent/30">
        <div className="flex items-baseline gap-2">
          <span className="text-[0.7rem] font-mono text-forge-accent uppercase tracking-wider">
            🧠 心智模型
          </span>
          <span className="text-[0.7rem] font-mono text-forge-fg-subtle">
            · 记住这一张图就够
          </span>
        </div>
        <h4 className="forge-serif-cjk text-lg text-forge-fg mt-1">{name}</h4>
      </div>
      <div className="p-4">
        {visual && (
          <div className="mb-4 bg-forge-bg-elevated rounded p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visual}
              alt={visualAlt ?? name}
              className="w-full h-auto"
            />
          </div>
        )}
        <ul className="space-y-1.5">
          {points.map((p, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-forge-accent font-mono text-xs shrink-0 mt-0.5">
                ◆
              </span>
              <span className="text-forge-fg-muted">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
