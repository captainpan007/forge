'use client'

/**
 * 顶栏的 ⌘K 按钮 — 点击效果等价于按 ⌘K
 *
 * CommandPalette 自己监听 keydown，所以这里只需 dispatch 一个
 * 同步的 KeyboardEvent；不直接共享 state（避免再加一个 context）。
 */
export function CommandPaletteTrigger() {
  function open() {
    // 用合成 KeyboardEvent 触发 CommandPalette 的全局监听
    const ev = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(ev)
  }

  return (
    <button
      onClick={open}
      className="px-3 py-1.5 text-[0.7rem] font-mono text-forge-fg-subtle hover:text-forge-fg-muted hover:bg-forge-bg-hover transition-colors flex items-center gap-1.5 uppercase tracking-wider"
      title="Command palette · ⌘K"
      aria-label="Open command palette"
    >
      <span>⌘</span>
      <span>K</span>
    </button>
  )
}
