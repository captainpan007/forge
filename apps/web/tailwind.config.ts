import type { Config } from 'tailwindcss'

/**
 * forge.dev · Anti-AI 视觉系统（Stage 4.5）
 *
 * 设计哲学：长得像「一本书 + 一个终端」，而不是「又一个 AI 写的 dashboard」。
 *
 * 视觉锚点（来自 anti-AI 设计研究）：
 * - 文字色：off-white #EDEDED + 5 级透明度细分（不是纯白 + 单灰）
 * - 主色：赭橙 #C8623A（已完成 / 解锁）— 反 AI 默认蓝色
 * - 副色：纸黄 #D4B896（JARVIS / 笔记）— 像旧书页
 * - 字体：Instrument Serif（hero 衬线斜体）+ Onest（UI 现代 sans）+ JetBrains Mono（代码 / 图谱）
 * - 卡片：1px 横线分隔（IBM Carbon / Vignelli 风），不再 rounded-xl + shadow
 * - 焦点：box-shadow ring + 200ms cap，永不破坏圆角
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../content/**/*.{md,mdx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── 基础（深底） ───
        'forge-bg': '#0A0A0B', // 比纯黑微暖
        'forge-bg-elevated': '#111113',
        'forge-bg-hover': '#17171A',
        'forge-border': '#1F1F23',
        'forge-border-subtle': '#161618',

        // ─── 文字 5 级（off-white 系统） ───
        'forge-fg': '#EDEDED', // 92% — 正文，绝不用纯白
        'forge-fg-muted': 'rgb(237 237 237 / 0.65)', // 60% — 次级文字
        'forge-fg-subtle': 'rgb(237 237 237 / 0.4)', // 40% — 三级、placeholder
        'forge-fg-faint': 'rgb(237 237 237 / 0.22)', // 22% — 装饰、分隔
        'forge-fg-ghost': 'rgb(237 237 237 / 0.1)', // 10% — 极弱、disabled

        // ─── 主色 · 赭橙（取代 AI 默认蓝） ───
        // 取自 IBM Carbon / Charm.sh / Vignelli 风格，
        // 心理暗示：温暖 / 工程师 / 笔记本 / 黄铜
        'forge-accent': '#C8623A',
        'forge-accent-hover': '#D77046',
        'forge-accent-subtle': 'rgb(200 98 58 / 0.15)',
        'forge-accent-faint': 'rgb(200 98 58 / 0.08)',

        // ─── 副色 · 纸黄（JARVIS / 笔记 / 高亮） ───
        // 像旧书页 / 黄油纸 / Moleskine 内衬
        'forge-paper': '#D4B896',
        'forge-paper-subtle': 'rgb(212 184 150 / 0.15)',
        'forge-paper-faint': 'rgb(212 184 150 / 0.08)',

        // ─── 状态色（克制版，不抢主色） ───
        'forge-success': '#7BA686', // 灰绿，不是 emoji 绿
        'forge-warning': '#C8923A', // 跟主色同色系暖
        'forge-danger': '#B0524C', // 砖红，不是消防红
        'forge-info': 'rgb(212 184 150 / 0.9)', // 复用纸黄

        // ─── 节点状态（图谱可视化） ───
        'node-locked': 'rgb(237 237 237 / 0.18)',
        'node-available': 'rgb(237 237 237 / 0.45)',
        'node-current': '#C8623A',
        'node-completed': '#7BA686',
      },
      fontFamily: {
        // ─── Engineering Notebook 字体五件套（CJK + Latin 各得其所） ───
        // 主 UI：Onest（瑞士现代 sans，反 Inter）
        sans: ['var(--font-onest)', 'PingFang SC', 'system-ui', 'sans-serif'],
        // 拉丁衬线：Instrument Serif（编辑感斜体，限 Latin / 数字）
        // 中文遇到时 fallback 到 Noto Serif SC（永远 normal weight，CJK 不 italic）
        serif: [
          'var(--font-instrument-serif)',
          'var(--font-noto-serif-sc)',
          'Georgia',
          'serif',
        ],
        // 中文衬线专用类（标题用，不 italic）
        'serif-cjk': [
          'var(--font-noto-serif-sc)',
          'Songti SC',
          'STSong',
          'serif',
        ],
        // 等宽
        mono: ['var(--font-jetbrains-mono)', 'Menlo', 'monospace'],
      },
      fontSize: {
        // 紧凑型（保留）
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.375rem' }],
        lg: ['1rem', { lineHeight: '1.5rem' }],
        xl: ['1.125rem', { lineHeight: '1.625rem' }],
        '2xl': ['1.375rem', { lineHeight: '1.875rem' }],
        '3xl': ['1.75rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.5rem', { lineHeight: '2.875rem' }],
        // hero 用 — 衬线斜体 64px / 96px
        hero: ['4rem', { lineHeight: '4.25rem', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        // 大幅减少圆角使用 — 视觉上去除 SaaS 塑料感
        DEFAULT: '4px',
        sm: '2px',
        md: '4px',
        lg: '6px',
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-in-right': 'slide-in-right 200ms ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(8px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
