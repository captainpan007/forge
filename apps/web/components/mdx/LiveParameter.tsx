'use client'

/**
 * LiveBlock / LiveParam / LiveDerived — Tangle 风「可变量内联文字」
 *
 * 教学原理（Bret Victor "Kill Math"）：把文字里抽象的数字变成"可拖动的旋钮"。
 * 读者不用算公式，直接拖任意一个参数，相关数字立刻更新 —— 大脑通过操纵
 * 建立因果模型，比看公式快 5x。
 *
 * 用法（MDX）：
 *
 *   <LiveBlock initial={{ V_source: 3.3, V_led: 2, I: 10 }}>
 *     当电源电压 <LiveParam name="V_source" min={1.5} max={5} step={0.1} unit="V" />，
 *     LED 工作电压 <LiveParam name="V_led" min={1.8} max={3} step={0.1} unit="V" />，
 *     目标电流 <LiveParam name="I" min={5} max={30} step={1} unit="mA" />，
 *     需要电阻 <LiveDerived
 *       compute={(v) => Math.round((v.V_source - v.V_led) * 1000 / v.I)}
 *       unit="Ω"
 *       label="R"
 *     />。
 *   </LiveBlock>
 */

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'

type LiveValues = Record<string, number>

const LiveContext = createContext<{
  values: LiveValues
  set: (name: string, value: number) => void
} | null>(null)

interface LiveBlockProps {
  initial: LiveValues
  children: ReactNode
  /** 可选标题 */
  label?: string
}

/**
 * LiveBlock —— 提供共享变量上下文。所有 LiveParam / LiveDerived 必须在里面。
 */
export function LiveBlock({ initial, label, children }: LiveBlockProps) {
  const [values, setValues] = useState<LiveValues>(initial)
  const set = (name: string, value: number) =>
    setValues((v) => ({ ...v, [name]: value }))

  return (
    <LiveContext.Provider value={{ values, set }}>
      <div className="my-5 forge-card overflow-hidden">
        <div className="bg-forge-bg-elevated px-4 py-2 border-b border-forge-border-subtle">
          <span className="text-[0.7rem] font-mono uppercase tracking-wider text-forge-fg-subtle">
            🎚 实时实验台
            {label && <span className="ml-2 text-forge-fg-muted">· {label}</span>}
          </span>
        </div>
        <div className="px-4 py-4 text-sm text-forge-fg leading-loose">
          {children}
        </div>
        <div className="px-4 py-2 border-t border-forge-border-subtle text-[0.7rem] text-forge-fg-subtle italic">
          拖滑块感受参数变化 — 公式不用记，建立直觉就够
        </div>
      </div>
    </LiveContext.Provider>
  )
}

interface LiveParamProps {
  /** 在 LiveBlock initial 里定义过的变量名 */
  name: string
  min: number
  max: number
  step: number
  unit?: string
  /** 显示小数位数 — 不传按 step 自动判断 */
  digits?: number
  /** 可选：滑块宽度（px） */
  width?: number
}

/**
 * LiveParam —— 可拖动数字。inline-flex，在段落中跟文字混排。
 */
export function LiveParam({
  name,
  min,
  max,
  step,
  unit = '',
  digits,
  width = 80,
}: LiveParamProps) {
  const ctx = useContext(LiveContext)
  if (!ctx) {
    return (
      <span className="font-mono text-xs text-forge-danger">
        [LiveParam {name} 必须在 LiveBlock 里]
      </span>
    )
  }
  const v = ctx.values[name] ?? 0
  const fmt = digits ?? (step >= 1 ? 0 : step >= 0.1 ? 1 : 2)

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 mx-0.5 align-baseline whitespace-nowrap"
      style={{
        backgroundColor: 'rgba(200, 98, 58, 0.10)',
        border: '1px solid rgba(200, 98, 58, 0.40)',
      }}
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => ctx.set(name, parseFloat(e.target.value))}
        className="accent-forge-accent align-middle cursor-pointer"
        style={{ width: `${width}px`, height: '2px' }}
        aria-label={name}
      />
      <span className="font-mono text-xs text-forge-accent font-medium tabular-nums">
        {v.toFixed(fmt)}
        {unit}
      </span>
    </span>
  )
}

interface LiveDerivedProps {
  /**
   * 计算表达式 — JS 表达式字符串，可访问 LiveBlock 里所有变量名
   *
   * 必须是字符串而不是函数：RSC 不允许把函数从 server component 序列化
   * 到 client component（MDX 编译走的就是 server 路径）。
   *
   * 示例：compute="(V_source - V_led) * 1000 / I_target"
   */
  compute: string
  unit?: string
  digits?: number
  /** 公式标签（可选，显示在等号前）"R" "I" 等 */
  label?: string
  /** 危险条件表达式（返回 boolean 的 JS 表达式） — 触发时显示警告色 */
  warn?: string
}

/**
 * 安全求值：把字符串表达式用 LiveValues 当变量在客户端运行。
 * new Function 不能访问外部 scope，只能用作用域内显式传入的变量。
 *
 * 表达式由 MDX 作者写（不是用户输入），所以风险可控。
 */
function evalExpr(
  expr: string,
  values: LiveValues
): number | string | boolean {
  try {
    const names = Object.keys(values)
    const vals = Object.values(values)
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    const fn = new Function(...names, `"use strict"; return (${expr});`)
    return fn(...vals)
  } catch {
    return '?'
  }
}

/**
 * LiveDerived —— 派生值。不能直接改，由 LiveParam 间接决定。
 */
export function LiveDerived({
  compute,
  unit = '',
  digits = 0,
  label,
  warn,
}: LiveDerivedProps) {
  const ctx = useContext(LiveContext)
  if (!ctx) {
    return (
      <span className="font-mono text-xs text-forge-danger">
        [LiveDerived 必须在 LiveBlock 里]
      </span>
    )
  }
  const result = evalExpr(compute, ctx.values)
  const isDanger = warn ? Boolean(evalExpr(warn, ctx.values)) : false

  const display =
    typeof result === 'number'
      ? Number.isFinite(result)
        ? result.toFixed(digits)
        : '∞'
      : result

  return (
    <span
      className="inline-flex items-baseline gap-1 px-2 py-0.5 mx-0.5 align-baseline whitespace-nowrap"
      style={{
        backgroundColor: isDanger
          ? 'rgba(220, 38, 38, 0.15)'
          : 'rgba(127, 191, 110, 0.15)',
        border: `1px solid ${
          isDanger ? 'rgba(220, 38, 38, 0.5)' : 'rgba(127, 191, 110, 0.5)'
        }`,
      }}
    >
      <span
        className="font-mono text-xs font-medium tabular-nums"
        style={{ color: isDanger ? '#fca5a5' : '#86efac' }}
      >
        {label && <span className="opacity-70 mr-1">{label} =</span>}
        {display}
        {unit}
      </span>
      {isDanger && (
        <span className="text-[0.6rem]" title="超出安全范围">
          ⚠
        </span>
      )}
    </span>
  )
}
