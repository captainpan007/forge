/**
 * MultiAnalogy — 同一概念的多重类比
 *
 * 教学原理：Gentner 的"结构映射理论" — 给同一抽象概念提供 2-3 个
 * 不同领域的类比，能极大增强迁移能力。一个类比只能说出一面，
 * 多个类比互相补足，覆盖盲区。
 *
 * 例如"电压"：
 *   - 水管类比：水压（直观，但用过水管的人才感同身受）
 *   - 高度类比：山顶到山脚的位差（抽象到力学，强调"差"）
 *   - 楼梯类比：楼层差（强调"势能"，每层都有相对高低）
 *
 * 用法：
 *   <MultiAnalogy
 *     concept="电压"
 *     analogies={[
 *       { angle: "水管", desc: "水压 — 推动水流的力", strength: "直观" },
 *       { angle: "山", desc: "山顶到山脚的高度差", strength: "强调'差'" },
 *       { angle: "楼梯", desc: "楼层之间的高低", strength: "层次感" },
 *     ]}
 *   />
 */

interface AnalogyAngle {
  /** 类比的领域 / 角度（一个词） */
  angle: string
  /** 类比内容描述 */
  desc: string
  /** 这个类比强调了什么（让用户知道该带走什么） */
  strength?: string
}

interface MultiAnalogyProps {
  /** 要解释的核心概念 */
  concept: string
  /** 多角度类比（建议 2-3 个） */
  analogies: AnalogyAngle[]
}

export function MultiAnalogy({ concept, analogies }: MultiAnalogyProps) {
  return (
    <div className="my-5 forge-card overflow-hidden">
      <div className="bg-forge-bg-elevated px-4 py-2 border-b border-forge-border-subtle">
        <span className="text-[0.7rem] font-mono text-forge-fg-subtle uppercase tracking-wider">
          🎭 「{concept}」的 {analogies.length} 个不同角度
        </span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3">
        {analogies.map((a, i) => (
          <div
            key={i}
            className="p-4 border-r border-b border-forge-border-subtle last:border-r-0 sm:[&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r lg:[&:nth-child(3)]:border-r-0"
          >
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-mono text-[0.65rem] text-forge-fg-subtle">
                #{i + 1}
              </span>
              <span className="forge-serif-cjk text-base text-forge-accent">
                {a.angle}
              </span>
            </div>
            <p className="text-sm text-forge-fg-muted leading-relaxed mb-2">
              {a.desc}
            </p>
            {a.strength && (
              <p className="text-[0.7rem] font-mono text-forge-fg-subtle uppercase tracking-wider">
                ↳ 强调：{a.strength}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-forge-border-subtle text-[0.7rem] text-forge-fg-subtle italic">
        没有完美的类比 — 每个都说出一面，叠加起来形成完整理解。
      </div>
    </div>
  )
}
