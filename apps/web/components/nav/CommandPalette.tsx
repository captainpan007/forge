'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
// 关键：从 search-fuzzy import — search.ts 是 server-only（用 node:fs）
import { fuzzyScore, type SearchEntry } from '@/lib/search-fuzzy'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  /** 由 server side build 好的搜索索引 */
  index: SearchEntry[]
}

/**
 * Cmd-K 命令面板 — 全局快捷搜索 + 跳转
 *
 * - ⌘K (mac) / Ctrl-K (win/linux) 打开
 * - ↑↓ 键盘选中，Enter 跳转，Esc 关闭
 * - 模糊匹配项目 / 节点 / 顶级页面
 *
 * 实现笔记：完全 client-side fuzzy（66 项，零延迟），
 * 索引由 server component 构建后注入。
 */
export function CommandPalette({ index }: CommandPaletteProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // ⌘K / Ctrl-K 全局监听 + Esc 关闭
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      } else if (e.key === 'Escape' && open) {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  // 自动 focus 输入框 + reset 状态
  useEffect(() => {
    if (open) {
      // 等 modal 渲染完
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      setQuery('')
      setActiveIdx(0)
    }
  }, [open])

  // 计算搜索结果（带评分）
  const results = useMemo(() => {
    if (!open) return []
    const scored = index
      .map((entry) => ({ entry, score: fuzzyScore(query, entry) }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30) // 顶 30 条够用
    return scored
  }, [index, query, open])

  // 切换 query 时把选中重置到第一项
  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  // 选中项滚动到可视区
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.querySelector<HTMLLIElement>(
      `li[data-idx="${activeIdx}"]`
    )
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  function handleInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const picked = results[activeIdx]
      if (picked) go(picked.entry.href)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* 面板本体 */}
      <div
        className="relative w-full max-w-xl bg-forge-bg border border-forge-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 输入框 */}
        <div className="border-b border-forge-border-subtle px-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKey}
            placeholder="搜索节点、项目、页面…"
            className="w-full bg-transparent py-3 text-sm text-forge-fg placeholder:text-forge-fg-subtle focus:outline-none"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {/* 结果列表 */}
        {results.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-forge-fg-subtle">
            没有匹配 ·{' '}
            <kbd className="font-mono text-xs px-1.5 py-0.5 border border-forge-border-subtle rounded">
              Esc
            </kbd>{' '}
            关闭
          </div>
        ) : (
          <ul ref={listRef} className="max-h-[50vh] overflow-y-auto py-1">
            {results.map((r, i) => (
              <li
                key={r.entry.key}
                data-idx={i}
                className={cn(
                  'px-3 py-2 cursor-pointer flex items-center gap-3 transition-colors',
                  i === activeIdx
                    ? 'bg-forge-accent-subtle text-forge-fg'
                    : 'hover:bg-forge-bg-hover text-forge-fg-muted'
                )}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => go(r.entry.href)}
              >
                {/* 类型图标 */}
                <span
                  className={cn(
                    'shrink-0 size-6 flex items-center justify-center font-mono text-[0.65rem] uppercase tracking-tight border',
                    r.entry.kind === 'node' &&
                      'border-forge-accent/40 text-forge-accent',
                    r.entry.kind === 'project' &&
                      'border-forge-fg-muted/30 text-forge-fg-muted',
                    r.entry.kind === 'page' &&
                      'border-forge-fg-subtle/30 text-forge-fg-subtle'
                  )}
                >
                  {r.entry.kind === 'node'
                    ? 'N'
                    : r.entry.kind === 'project'
                    ? 'P'
                    : '§'}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{r.entry.title}</div>
                  {r.entry.subtitle && (
                    <div className="text-[0.7rem] font-mono text-forge-fg-subtle truncate">
                      {r.entry.subtitle}
                    </div>
                  )}
                </div>

                {i === activeIdx && (
                  <span className="text-[0.7rem] font-mono text-forge-fg-subtle shrink-0">
                    ↵
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* 底栏 hints */}
        <div className="border-t border-forge-border-subtle px-3 py-2 flex items-center gap-3 text-[0.65rem] font-mono text-forge-fg-subtle uppercase tracking-wider">
          <span>
            <kbd className="px-1 border border-forge-border-subtle">↑↓</kbd>{' '}
            移动
          </span>
          <span>
            <kbd className="px-1 border border-forge-border-subtle">↵</kbd>{' '}
            打开
          </span>
          <span>
            <kbd className="px-1 border border-forge-border-subtle">Esc</kbd>{' '}
            关闭
          </span>
          <span className="ml-auto opacity-60">{results.length} 项</span>
        </div>
      </div>
    </div>
  )
}
