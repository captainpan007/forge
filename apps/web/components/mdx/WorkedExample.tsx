/**
 * WorkedExample — 步骤化解题示范（Sweller 认知负荷理论）
 *
 * 教学原理：Sweller 实验表明，新手看完整解题示范 + 解释每步"为什么"
 * 比直接做题学得快 2-3x。直到能复述每步思路，再放手让学生自己做。
 *
 * 关键：每一步必须配"为什么这一步" — 不只是 what，更是 why。
 *
 * 用法：
 *   <WorkedExample
 *     problem="LED 直接接 Pi 3.3V 会烧 — 算限流电阻该用多少 Ω"
 *     steps={[
 *       { do: "查 LED 工作电压：典型 2V", why: "数据手册有，红 LED 约 2V，蓝 LED 约 3V" },
 *       { do: "算电阻两端电压：3.3V - 2V = 1.3V", why: "电阻吃掉的是 Pi 给的电压跟 LED 用掉的电压之差" },
 *       { do: "选目标电流：10mA（LED 适中）", why: "5mA 太暗，20mA 偏亮且耗电，10mA 是甜区" },
 *       { do: "套欧姆定律 R = V/I = 1.3 / 0.01 = 130Ω", why: "现实买不到 130Ω 标值，用相近的 220Ω 更安全" },
 *     ]}
 *     answer="220Ω 限流电阻（最小 130Ω）"
 *   />
 */

interface WorkedStep {
  /** 这一步做什么（动作） */
  do: string
  /** 为什么要这样做（思路） */
  why: string
}

interface WorkedExampleProps {
  /** 题面 */
  problem: string
  /** 步骤序列 */
  steps: WorkedStep[]
  /** 最终答案 */
  answer: string
  /** 可选：题目副标题 / 上下文 */
  context?: string
}

export function WorkedExample({
  problem,
  steps,
  answer,
  context,
}: WorkedExampleProps) {
  return (
    <div className="my-6 forge-card overflow-hidden">
      {/* 题目 */}
      <div className="bg-forge-bg-elevated px-4 py-3 border-b border-forge-border-subtle">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[0.7rem] font-mono text-forge-fg-subtle uppercase tracking-wider">
            📐 示范例题
          </span>
          {context && (
            <span className="text-[0.7rem] font-mono text-forge-fg-subtle">
              · {context}
            </span>
          )}
        </div>
        <p className="text-sm text-forge-fg leading-relaxed">{problem}</p>
      </div>

      {/* 步骤 */}
      <div className="divide-y divide-forge-border-subtle">
        {steps.map((s, i) => (
          <div key={i} className="px-4 py-3 flex gap-3">
            <div className="shrink-0 size-7 flex items-center justify-center font-mono text-xs text-forge-accent border border-forge-accent/40">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm text-forge-fg">{s.do}</p>
              <p className="text-xs text-forge-fg-subtle leading-relaxed">
                <span className="font-mono uppercase tracking-wider mr-1.5 text-forge-fg-muted">
                  why:
                </span>
                {s.why}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 答案 */}
      <div className="bg-forge-success/10 border-t-2 border-forge-success/40 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[0.7rem] font-mono text-forge-success uppercase tracking-wider">
            ✓ 答案
          </span>
        </div>
        <p className="text-sm text-forge-fg mt-1 font-medium">{answer}</p>
      </div>
    </div>
  )
}
