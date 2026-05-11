'use client'

/**
 * ConceptCheck — 阅读流中的快闪 1 题（Mazur ConcepTest）
 *
 * 教学原理：Eric Mazur 物理课用了 30 年的"概念测验"模式 —— 不是末尾大测验，
 * 是阅读到关键概念时立刻插一题，立刻看反馈。比放到末尾考强 4x。
 *
 * 用法：
 *   <ConceptCheck
 *     question="LED 直接接 3.3V 不加电阻会怎样？"
 *     options={[
 *       { text: "正常发光", correct: false, why: "电流没限制 → 暴增 → 烧掉" },
 *       { text: "瞬间烧掉", correct: true, why: "I = V / R，R 接近 0 时电流爆表" },
 *       { text: "不亮", correct: false, why: "如果电压够，会亮一下再烧" },
 *     ]}
 *   />
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ConceptCheckOption {
  text: string
  correct: boolean
  /** 揭晓后显示：为什么对/错 */
  why: string
}

interface ConceptCheckProps {
  question: string
  options: ConceptCheckOption[]
}

export function ConceptCheck({ question, options }: ConceptCheckProps) {
  const [picked, setPicked] = useState<number | null>(null)

  function handlePick(i: number) {
    if (picked !== null) return // 锁定，已选不能改
    setPicked(i)
  }

  return (
    <div className="my-5 forge-card overflow-hidden">
      <div className="bg-forge-bg-elevated px-4 py-2 border-b border-forge-border-subtle">
        <span className="text-[0.7rem] font-mono text-forge-fg-subtle uppercase tracking-wider">
          ⚡ 快速检查
        </span>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-forge-fg leading-relaxed">{question}</p>

        <ul className="space-y-2">
          {options.map((opt, i) => {
            const isPicked = picked === i
            const showFeedback = picked !== null
            const isCorrect = opt.correct
            return (
              <li key={i}>
                <button
                  onClick={() => handlePick(i)}
                  disabled={showFeedback}
                  className={cn(
                    'w-full text-left px-3 py-2 border transition-colors text-sm',
                    'flex items-start gap-2',
                    !showFeedback &&
                      'border-forge-border-subtle hover:border-forge-fg-subtle hover:bg-forge-bg-hover cursor-pointer',
                    showFeedback &&
                      isPicked &&
                      isCorrect &&
                      'border-forge-success bg-forge-success/10',
                    showFeedback &&
                      isPicked &&
                      !isCorrect &&
                      'border-forge-danger bg-forge-danger/10',
                    showFeedback &&
                      !isPicked &&
                      isCorrect &&
                      'border-forge-success/40 bg-forge-success/5',
                    showFeedback && !isPicked && !isCorrect && 'opacity-50'
                  )}
                >
                  <span className="font-mono text-xs text-forge-fg-subtle shrink-0 mt-0.5">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <span className="flex-1 text-forge-fg-muted">{opt.text}</span>
                  {showFeedback && isCorrect && (
                    <span className="text-forge-success text-xs shrink-0">
                      ✓
                    </span>
                  )}
                  {showFeedback && isPicked && !isCorrect && (
                    <span className="text-forge-danger text-xs shrink-0">
                      ✗
                    </span>
                  )}
                </button>
                {/* 揭晓"为什么" — 只对选中和正确选项显示 */}
                {showFeedback && (isPicked || isCorrect) && (
                  <p className="text-xs text-forge-fg-subtle italic ml-7 mt-1.5 leading-relaxed">
                    {opt.why}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
