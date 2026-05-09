import type { Config } from 'tailwindcss'

/**
 * forge.dev · Tailwind 主题
 *
 * 视觉锚点：Linear / Vercel Dashboard 风格
 * - 极深底色 + 高对比文字
 * - 单一蓝色强调
 * - 紧凑间距
 * - 6px 圆角（克制，不卖萌）
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
        // 基础 (Linear-inspired)
        'forge-bg': '#08090A',
        'forge-bg-elevated': '#0F1011',
        'forge-bg-hover': '#16171A',
        'forge-border': '#1F2023',
        'forge-border-subtle': '#16171A',

        // 文字
        'forge-fg': '#F4F4F5',
        'forge-fg-muted': '#A1A1AA',
        'forge-fg-subtle': '#71717A',

        // 强调色 — 单一蓝
        'forge-accent': '#3B82F6',
        'forge-accent-hover': '#2563EB',
        'forge-accent-subtle': 'rgba(59, 130, 246, 0.15)',

        // 状态色
        'forge-success': '#10B981',
        'forge-warning': '#F59E0B',
        'forge-danger': '#EF4444',
        'forge-info': '#3B82F6',

        // 节点状态 (用于知识图谱可视化)
        'node-locked': '#3F3F46',
        'node-available': '#71717A',
        'node-current': '#3B82F6',
        'node-completed': '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        // 紧凑型 type scale (Linear-style)
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.375rem' }],
        lg: ['1rem', { lineHeight: '1.5rem' }],
        xl: ['1.125rem', { lineHeight: '1.625rem' }],
        '2xl': ['1.375rem', { lineHeight: '1.875rem' }],
        '3xl': ['1.75rem', { lineHeight: '2.25rem' }],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
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
