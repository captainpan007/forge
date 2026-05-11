/**
 * HighlightedTerm — 词与图的色彩锚定（Ciechanowski 风）
 *
 * 教学原理：把文字中的关键名词跟图里同色部件建立视觉联系，
 * 大脑不用在文图间来回扫描映射，理解速度翻倍。
 *
 * 用法：
 *   <HighlightedTerm color="red">红色杜邦线</HighlightedTerm>
 *   <HighlightedTerm color="green">GND 共连线</HighlightedTerm>
 *
 * 配套规则：SVG / 图示里对应部件必须用同色（手动保持一致）。
 * 等以后做完 HighlightProvider 可以做到 JS-synced 真双向 hover。
 */

import { cn } from '@/lib/utils'

export type HighlightColor =
  | 'red'
  | 'orange'
  | 'amber'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'gray'
  | 'black'

// 用 inline style 而不是 tailwind class —— 避免 purge 把这些颜色去掉
const palette: Record<HighlightColor, { bg: string; fg: string; border: string }> = {
  red:    { bg: 'rgba(220, 38, 38, 0.16)',   fg: '#fca5a5', border: 'rgba(220, 38, 38, 0.5)' },
  orange: { bg: 'rgba(234, 88, 12, 0.18)',   fg: '#fdba74', border: 'rgba(234, 88, 12, 0.55)' },
  amber:  { bg: 'rgba(202, 138, 4, 0.20)',   fg: '#fcd34d', border: 'rgba(202, 138, 4, 0.55)' },
  green:  { bg: 'rgba(22, 163, 74, 0.18)',   fg: '#86efac', border: 'rgba(22, 163, 74, 0.55)' },
  cyan:   { bg: 'rgba(8, 145, 178, 0.20)',   fg: '#67e8f9', border: 'rgba(8, 145, 178, 0.55)' },
  blue:   { bg: 'rgba(37, 99, 235, 0.20)',   fg: '#93c5fd', border: 'rgba(37, 99, 235, 0.55)' },
  purple: { bg: 'rgba(147, 51, 234, 0.20)',  fg: '#d8b4fe', border: 'rgba(147, 51, 234, 0.55)' },
  gray:   { bg: 'rgba(107, 114, 128, 0.20)', fg: '#cbd5e1', border: 'rgba(107, 114, 128, 0.5)' },
  black:  { bg: 'rgba(0, 0, 0, 0.45)',       fg: '#e5e7eb', border: 'rgba(255, 255, 255, 0.2)' },
}

interface HighlightedTermProps {
  color: HighlightColor
  children: React.ReactNode
  /** 可选：让文字用强调样式（加粗） */
  strong?: boolean
}

export function HighlightedTerm({ color, children, strong = true }: HighlightedTermProps) {
  const c = palette[color] ?? palette.gray
  return (
    <span
      className={cn(
        'inline-block px-1.5 py-0 mx-0.5 border-b-2 align-baseline',
        strong && 'font-medium'
      )}
      style={{
        backgroundColor: c.bg,
        color: c.fg,
        borderColor: c.border,
      }}
    >
      {children}
    </span>
  )
}
