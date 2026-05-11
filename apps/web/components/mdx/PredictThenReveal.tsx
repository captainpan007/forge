'use client'

/**
 * PredictThenReveal — 先猜再揭晓（Generation Effect / Roediger）
 *
 * 教学原理：研究最强的学习增益方法之一。先让大脑产生预测（哪怕错的），
 * 再看正确答案，比直接读答案记得牢 3x（Bjork 实验室）。
 *
 * 用法：
 *   <PredictThenReveal
 *     question="如果一段水管两端水压相等，水会流吗？"
 *     hint="想想电压的'差'的本质"
 *     answer="不会。水压相等 = 没有'差' → 没有推动力 → 水不流。电路一样：两点电压相等就没电流。"
 *   />
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PredictThenRevealProps {
  /** 抛给读者的问题 */
  question: string
  /** 可选：暗示思考方向 */
  hint?: string
  /** 标准答案 / 揭晓内容 */
  answer: string
}

export function PredictThenReveal({
  question,
  hint,
  answer,
}: PredictThenRevealProps) {
  const [revealed, setRevealed] = useState(false)
  const [myGuess, setMyGuess] = useState('')

  return (
    <div className="my-5 forge-card overflow-hidden">
      <div className="bg-forge-bg-elevated px-4 py-2 border-b border-forge-border-subtle">
        <span className="text-[0.7rem] font-mono text-forge-fg-subtle uppercase tracking-wider">
          🤔 先猜再继续
        </span>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-forge-fg leading-relaxed">{question}</p>

        {hint && (
          <p className="text-xs text-forge-fg-subtle italic">💡 {hint}</p>
        )}

        {/* 输入区（可选）— 鼓励但不强制 */}
        {!revealed && (
          <textarea
            value={myGuess}
            onChange={(e) => setMyGuess(e.target.value)}
            placeholder="（可选）写下你的猜测 — 哪怕错，也比不猜强 3x"
            rows={2}
            className="forge-input w-full text-sm resize-none"
          />
        )}

        {/* 揭晓按钮 / 揭晓内容 */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className={cn(
              'px-4 py-2 text-sm bg-forge-accent text-forge-bg',
              'hover:bg-forge-accent-hover transition-colors',
              'font-mono uppercase tracking-wider text-xs'
            )}
          >
            揭晓答案 ↓
          </button>
        ) : (
          <div className="border-l-2 border-forge-accent pl-3 py-1">
            <div className="text-[0.7rem] font-mono text-forge-accent uppercase tracking-wider mb-1">
              ✓ 答案
            </div>
            <p className="text-sm text-forge-fg leading-relaxed">{answer}</p>
            {myGuess && (
              <div className="mt-3 pt-3 border-t border-forge-border-subtle">
                <div className="text-[0.7rem] font-mono text-forge-fg-subtle uppercase tracking-wider mb-1">
                  你刚才猜的
                </div>
                <p className="text-xs text-forge-fg-muted italic">{myGuess}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
