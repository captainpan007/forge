'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { User } from '@/lib/db/schema'

interface JarvisPanelProps {
  user: User
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  /** 还在流式接收中 — 用于显示打字指示器 */
  streaming?: boolean
  error?: string
}

/**
 * JARVIS 浮层 — 全平台常驻 · v0.3 真接 Claude API
 *
 * 设计：
 *   - 浮动按钮在右下；点击展开聊天面板
 *   - 自动从 URL 推断当前 project / node 上下文
 *   - 消息流式渲染（逐 token 显示）
 *   - 历史消息保存在 React state（v0.3.1 加 DB 持久化）
 *   - ⌘J 快捷键打开/关闭
 */
export function JarvisPanel({ user }: JarvisPanelProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // 从 URL 推断 project / node 上下文（/projects/[slug]/nodes/[id]）
  const ctx = parseRouteContext(pathname)

  // 自动滚到底部
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  // ⌘J / Ctrl+J 快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
    }
    const assistantMsgId = `a-${Date.now()}`
    setMessages((m) => [
      ...m,
      userMsg,
      { id: assistantMsgId, role: 'assistant', text: '', streaming: true },
    ])
    setInput('')
    setBusy(true)

    try {
      // 拼 messages payload — 包含历史 + 当前 user message
      const payloadMessages = [
        ...messages.map((m) => ({
          role: m.role,
          content: { type: 'text' as const, text: m.text },
        })),
        {
          role: 'user' as const,
          content: { type: 'text' as const, text },
        },
      ]

      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          projectSlug: ctx.projectSlug,
          nodeId: ctx.nodeId,
        }),
      })

      if (!res.ok || !res.body) {
        const errorText = await res.text().catch(() => 'Network error')
        throw new Error(`${res.status}: ${errorText}`)
      }

      // 读 SSE stream
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)
          if (data === '[DONE]') {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantMsgId ? { ...msg, streaming: false } : msg
              )
            )
            continue
          }
          try {
            const parsed = JSON.parse(data) as { delta?: string; error?: string }
            if (parsed.error) {
              setMessages((m) =>
                m.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, streaming: false, error: parsed.error }
                    : msg
                )
              )
              continue
            }
            if (parsed.delta) {
              setMessages((m) =>
                m.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, text: msg.text + parsed.delta }
                    : msg
                )
              )
            }
          } catch {
            // 忽略解析失败
          }
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, streaming: false, error: errorMsg }
            : msg
        )
      )
    } finally {
      setBusy(false)
    }
  }

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
            'w-[400px] h-[600px] max-h-[calc(100vh-7rem)]',
            'forge-card shadow-2xl flex flex-col',
            'animate-slide-in-right'
          )}
        >
          <header className="px-4 py-3 border-b border-forge-border flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-semibold text-sm">{user.jarvisName}</h3>
              <p className="text-[0.65rem] text-forge-fg-subtle font-mono">
                {ctx.label || 'Workshop mode'}
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

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 && (
              <div className="forge-card p-3 bg-forge-bg-elevated/50">
                <p className="text-xs font-mono text-forge-accent mb-1">
                  {user.jarvisName}
                </p>
                <p className="text-sm leading-relaxed">
                  {user.jarvisAddress}, 我已就位。
                  {ctx.label && (
                    <>
                      {' '}
                      已感知您当前在 <span className="font-mono text-forge-accent">{ctx.label}</span>。
                    </>
                  )}{' '}
                  随时提问。
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} jarvisName={user.jarvisName} />
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="px-4 py-3 border-t border-forge-border shrink-0"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={busy}
                placeholder={busy ? `${user.jarvisName} is thinking...` : '问 JARVIS...'}
                className={cn(
                  'flex-1 px-3 py-2 rounded-md text-sm',
                  'bg-forge-bg border border-forge-border',
                  'placeholder:text-forge-fg-subtle',
                  'focus:outline-none focus:ring-2 focus:ring-forge-accent',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className={cn(
                  'px-3 py-2 rounded-md text-sm',
                  'bg-forge-accent text-white',
                  'hover:bg-forge-accent-hover transition-colors',
                  'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
              >
                ↵
              </button>
            </div>
          </form>
        </aside>
      )}
    </>
  )
}

function MessageBubble({
  msg,
  jarvisName,
}: {
  msg: ChatMessage
  jarvisName: string
}) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-3 py-2 rounded-md bg-forge-accent/15 text-sm leading-relaxed border border-forge-accent/30">
          {msg.text}
        </div>
      </div>
    )
  }

  return (
    <div className="forge-card p-3 bg-forge-bg-elevated/50">
      <p className="text-xs font-mono text-forge-accent mb-1">{jarvisName}</p>
      {msg.error ? (
        <p className="text-sm text-forge-danger">⚠ {msg.error}</p>
      ) : (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {msg.text}
          {msg.streaming && (
            <span className="inline-block w-2 h-4 bg-forge-accent/60 animate-pulse ml-0.5 align-text-bottom" />
          )}
        </p>
      )}
    </div>
  )
}

function parseRouteContext(pathname: string): {
  projectSlug?: string
  nodeId?: string
  label?: string
} {
  // /projects/[slug]/nodes/[id]
  const nodeMatch = pathname.match(/^\/projects\/([^/]+)\/nodes\/([^/]+)/)
  if (nodeMatch) {
    return {
      projectSlug: nodeMatch[1],
      nodeId: nodeMatch[2],
      label: `${nodeMatch[2]?.toUpperCase()} · ${nodeMatch[1]}`,
    }
  }
  // /projects/[slug] (workshop / graph)
  const projectMatch = pathname.match(/^\/projects\/([^/]+)/)
  if (projectMatch) {
    return {
      projectSlug: projectMatch[1],
      label: `Project: ${projectMatch[1]}`,
    }
  }
  return {}
}
