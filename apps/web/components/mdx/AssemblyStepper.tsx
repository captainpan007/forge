'use client'

/**
 * AssemblyStepper — 渐进式拼装走查（Ciechanowski 招牌 · 组装手表风）
 *
 * 教学原理：复杂系统的唯一可学方法是「一次一个新部件」 ——
 * 用户能看清每一步加了什么、为什么加。这是组装类教学的杀手锏。
 *
 * 用法：
 *   <AssemblyStepper
 *     intro="给发声盒接外置喇叭，分 4 步"
 *     steps={[
 *       {
 *         title: "起手：Pi 自己有 GND 圈",
 *         visual: "/diagrams/cg-step-1.svg",
 *         description: "Pi 4 内部有自己的 GND 网络..."
 *       },
 *       ...
 *     ]}
 *   />
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AssemblyStep {
  title: string
  /** SVG / PNG 路径 — 每一步独立的图 */
  visual: string
  description: React.ReactNode
  /** 可选：这一步引入的新部件名（在 visual 里高亮显示用） */
  newComponent?: string
}

interface AssemblyStepperProps {
  steps: AssemblyStep[]
  /** 顶部一句话说明拼的是什么 */
  intro?: string
}

export function AssemblyStepper({ steps, intro }: AssemblyStepperProps) {
  const [active, setActive] = useState(0)
  const step = steps[active]
  if (!step) return null

  const isFirst = active === 0
  const isLast = active === steps.length - 1

  return (
    <div className="my-6 forge-card overflow-hidden">
      {/* 顶栏 */}
      <div className="bg-forge-bg-elevated px-4 py-2 border-b border-forge-border-subtle flex items-center justify-between gap-3">
        <span className="text-[0.7rem] font-mono uppercase tracking-wider text-forge-fg-subtle shrink-0">
          🔧 渐进拼装 · {active + 1} / {steps.length}
        </span>
        {intro && (
          <span className="text-[0.7rem] text-forge-fg-subtle italic truncate">
            {intro}
          </span>
        )}
      </div>

      {/* 视觉区 */}
      <div className="bg-forge-bg-elevated p-3 border-b border-forge-border-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={step.visual}
          alt={step.title}
          className="w-full h-auto"
        />
      </div>

      {/* 描述区 */}
      <div className="px-4 py-3">
        <h4 className="forge-serif-cjk text-base text-forge-fg mb-2 flex items-baseline gap-2">
          <span className="font-mono text-[0.65rem] text-forge-accent uppercase tracking-wider shrink-0">
            第 {active + 1} 步
          </span>
          <span>{step.title}</span>
        </h4>
        <div className="text-sm text-forge-fg-muted leading-relaxed [&>p]:mb-2 last:[&>p]:mb-0">
          {step.description}
        </div>
        {step.newComponent && (
          <p className="mt-2 text-[0.7rem] font-mono text-forge-accent uppercase tracking-wider">
            ↳ 这一步新加了：{step.newComponent}
          </p>
        )}
      </div>

      {/* 控制条 */}
      <div className="border-t border-forge-border-subtle flex items-stretch">
        <button
          disabled={isFirst}
          onClick={() => setActive((a) => a - 1)}
          className={cn(
            'flex-1 py-2 text-sm transition-colors font-mono text-xs uppercase tracking-wider',
            isFirst
              ? 'text-forge-fg-subtle/40 cursor-not-allowed'
              : 'text-forge-fg-muted hover:bg-forge-bg-hover hover:text-forge-fg'
          )}
        >
          ← 上一步
        </button>

        {/* 步骤点 */}
        <div className="px-3 flex items-center gap-1.5 border-x border-forge-border-subtle">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`跳到第 ${i + 1} 步`}
              className={cn(
                'size-2 rounded-full transition-all',
                i === active
                  ? 'bg-forge-accent scale-125'
                  : i < active
                  ? 'bg-forge-fg-muted/60 hover:bg-forge-fg-muted'
                  : 'bg-forge-fg-subtle/25 hover:bg-forge-fg-subtle/60'
              )}
            />
          ))}
        </div>

        <button
          disabled={isLast}
          onClick={() => setActive((a) => a + 1)}
          className={cn(
            'flex-1 py-2 text-sm transition-colors font-mono text-xs uppercase tracking-wider',
            isLast
              ? 'text-forge-fg-subtle/40 cursor-not-allowed'
              : 'text-forge-fg-muted hover:bg-forge-bg-hover hover:text-forge-fg'
          )}
        >
          下一步 →
        </button>
      </div>
    </div>
  )
}
