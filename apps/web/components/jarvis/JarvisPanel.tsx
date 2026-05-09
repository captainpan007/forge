'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { User } from '@/lib/db/schema'

interface JarvisPanelProps {
  user: User
}

/**
 * JARVIS 浮层 — 全平台常驻
 *
 * v0.x: 显示 placeholder UI，告诉用户"v0.3 启用对话"
 * v0.3: 接 Claude API 实现真实对话
 */
export function JarvisPanel({ user }: JarvisPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'fixed bottom-4 right-4 z-40 size-12 rounded-full',
          'bg-forge-accent text-white shadow-lg',
          'flex items-center justify-center font-mono font-bold',
          'hover:bg-forge-accent-hover transition-all',
          'hover:scale-105 active:scale-95'
        )}
        aria-label="Toggle JARVIS"
        title={open ? 'Close JARVIS (⌘J)' : 'Open JARVIS (⌘J)'}
      >
        {user.jarvisName.charAt(0)}
      </button>

      {/* Panel */}
      {open && (
        <aside
          className={cn(
            'fixed bottom-20 right-4 z-40',
            'w-96 max-h-[calc(100vh-7rem)]',
            'forge-card shadow-2xl flex flex-col',
            'animate-slide-in-right'
          )}
        >
          {/* Header */}
          <header className="px-4 py-3 border-b border-forge-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">{user.jarvisName}</h3>
              <p className="text-[0.65rem] text-forge-fg-subtle font-mono">
                Workshop mode · v0.x preview
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-forge-fg-subtle hover:text-forge-fg p-1 rounded"
              aria-label="Close"
            >
              ✕
            </button>
          </header>

          {/* Body */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              <div className="forge-card p-3 bg-forge-bg-elevated/50">
                <p className="text-xs font-mono text-forge-accent mb-1">
                  {user.jarvisName}
                </p>
                <p className="text-sm leading-relaxed">
                  {user.jarvisAddress}, JARVIS 的实时对话能力将在 v0.3 上线。届时我会知道您当前在哪个节点、之前完成过什么、卡在哪——并随时通过 Anthropic Claude API 为您提供帮助。
                </p>
                <p className="text-sm leading-relaxed mt-2">
                  目前阶段（v0.1），架构、路由、Auth、DB 已就绪。下一里程碑是 MDX 渲染（v0.2）。
                </p>
              </div>
            </div>
          </div>

          {/* Input */}
          <footer className="px-4 py-3 border-t border-forge-border">
            <input
              type="text"
              disabled
              placeholder="JARVIS will be available in v0.3..."
              className="w-full px-3 py-2 rounded-md bg-forge-bg border border-forge-border text-sm placeholder:text-forge-fg-subtle disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </footer>
        </aside>
      )}
    </>
  )
}
