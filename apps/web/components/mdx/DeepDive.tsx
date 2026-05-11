'use client'

/**
 * DeepDive — 可折叠的"深度展开"（Cognitive Load 分流）
 *
 * 教学原理：Sweller 认知负荷理论 — 主流学习路径要保持低负荷。
 * 但好奇心强的 10% 想知道"那为什么 X？为什么不是 Y？" 这些深度内容
 * 应该折叠默认隐藏，主流读者跳过不影响，好奇者一点展开。
 *
 * 用法：
 *   <DeepDive title="为什么 Pi 4 GPIO 是 3.3V 不是 5V？">
 *     ...
 *   </DeepDive>
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface DeepDiveProps {
  title: string
  children: React.ReactNode
  /** 给标题加一个小副标题（可选） */
  hint?: string
}

export function DeepDive({ title, children, hint }: DeepDiveProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="my-4 forge-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-forge-bg-hover transition-colors text-left"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[0.7rem] font-mono text-forge-fg-subtle uppercase tracking-wider">
            🔬 深度展开
          </span>
          {!open && hint && (
            <span className="text-[0.7rem] text-forge-fg-subtle italic">
              · 想懂得更深可以看
            </span>
          )}
        </div>
        <span
          className={cn(
            'font-mono text-xs text-forge-fg-subtle transition-transform',
            open && 'rotate-90'
          )}
        >
          ▶
        </span>
      </button>
      {/* 标题 */}
      <div className="px-4 pb-2 border-b border-forge-border-subtle">
        <h4 className="text-sm font-medium text-forge-fg">{title}</h4>
      </div>
      {/* 内容 — 折叠 */}
      {open && (
        <div className="px-4 py-3 text-sm text-forge-fg-muted leading-relaxed [&>p]:mb-2 last:[&>p]:mb-0">
          {children}
        </div>
      )}
    </div>
  )
}
