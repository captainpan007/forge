'use client'

/**
 * RecallBeat — 阅读中途的微回想（Retrieval Practice / Spaced Recall）
 *
 * 教学原理：每读 3-5 段插一次"主动回想"，能对刚读的内容形成 retrieval
 * cue，立即提升保留率。比一直读到底再回顾强 2x。
 *
 * 阶段：
 *   1. 显示问题
 *   2. 用户思考（5 秒倒计时）
 *   3. 时间到，按钮出现"看看我对不对"
 *   4. 揭晓答案
 *
 * 用法：
 *   <RecallBeat
 *     prompt="刚才读到的'电压是相对的'是什么意思？想 5 秒，再继续。"
 *     answer="电压必须是两点之间的差。说'GPIO 17 是 3.3V' = '相对于 GND 是 3.3V'。"
 *   />
 */

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface RecallBeatProps {
  /** 抛给读者的回想问题 */
  prompt: string
  /** 揭晓答案 / 提示 */
  answer: string
  /** 倒计时秒数 — 默认 5 秒 */
  seconds?: number
}

export function RecallBeat({ prompt, answer, seconds = 5 }: RecallBeatProps) {
  const [phase, setPhase] = useState<'idle' | 'thinking' | 'ready' | 'revealed'>('idle')
  const [countdown, setCountdown] = useState(seconds)

  // 倒计时
  useEffect(() => {
    if (phase !== 'thinking') return
    if (countdown <= 0) {
      setPhase('ready')
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  return (
    <div className="my-5 forge-card overflow-hidden border-l-2 border-forge-warning/50">
      <div className="bg-forge-bg-elevated px-4 py-2 border-b border-forge-border-subtle">
        <span className="text-[0.7rem] font-mono text-forge-warning uppercase tracking-wider">
          ⏸ 暂停 · 主动回想
        </span>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-forge-fg leading-relaxed">{prompt}</p>

        {phase === 'idle' && (
          <button
            onClick={() => setPhase('thinking')}
            className={cn(
              'px-4 py-2 text-sm border border-forge-warning/50 text-forge-warning',
              'hover:bg-forge-warning/10 transition-colors',
              'font-mono uppercase tracking-wider text-xs'
            )}
          >
            开始 {seconds} 秒思考 →
          </button>
        )}

        {phase === 'thinking' && (
          <div className="flex items-center gap-3 text-sm text-forge-fg-muted">
            <div className="size-9 flex items-center justify-center font-mono text-base text-forge-warning border border-forge-warning/40">
              {countdown}
            </div>
            <span className="italic">想想看…（不要往下看）</span>
          </div>
        )}

        {phase === 'ready' && (
          <button
            onClick={() => setPhase('revealed')}
            className={cn(
              'px-4 py-2 text-sm bg-forge-warning text-forge-bg',
              'hover:opacity-90 transition-colors',
              'font-mono uppercase tracking-wider text-xs'
            )}
          >
            看看我对不对 ↓
          </button>
        )}

        {phase === 'revealed' && (
          <div className="border-l-2 border-forge-warning pl-3 py-1">
            <div className="text-[0.7rem] font-mono text-forge-warning uppercase tracking-wider mb-1">
              ✓ 应该回想到
            </div>
            <p className="text-sm text-forge-fg leading-relaxed">{answer}</p>
          </div>
        )}
      </div>
    </div>
  )
}
