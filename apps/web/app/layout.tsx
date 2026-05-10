import type { Metadata, Viewport } from 'next'
import {
  Instrument_Serif,
  Onest,
  JetBrains_Mono,
  Noto_Serif_SC,
} from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

/**
 * 字体三件套（Anti-AI Stage 4.5）
 * - Instrument Serif: editorial 衬线，hero / strong typography
 * - Onest: 现代瑞士 sans，UI 主字（反 Inter / 反 Geist）
 * - JetBrains Mono: 代码 / 等宽
 *
 * 进阶：将来手动下载 PP Editorial New + PP Neue Montreal 替换前两者，
 * 5 行 @font-face 改完即可。
 */
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
  display: 'swap',
})

// Chinese serif — 跟 Instrument Serif 配对，拉丁用前者，中文回退到 Noto Serif SC
// 关键：中文不会被强制 italic（CJK 排印里 italic 不存在），但这里整 weight 400
//
// display: 'optional' — 字体加载失败（中国代理偶发 TLS 断开）时回退到系统中文衬线，
// 不阻塞渲染。比 'swap' 更宽容：连 100ms 等待都不做。
const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-serif-sc',
  display: 'optional',
  preload: false, // CJK 字体大，按需加载
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'forge — 个人工程师驾驶舱',
    template: '%s · forge',
  },
  description: '用 Musk 倒推法学嵌入式 · AI 助教 JARVIS 全程陪伴',
  keywords: ['embedded', 'learning', 'raspberry pi', 'AI tutor', '嵌入式', '树莓派'],
  authors: [{ name: 'Alex Pan' }],
  creator: 'Alex Pan',
  metadataBase: new URL('https://forge.alexpan.dev'),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://forge.alexpan.dev',
    siteName: 'forge',
    title: 'forge — 个人工程师驾驶舱',
    description: '用 Musk 倒推法学嵌入式 · AI 助教 JARVIS 全程陪伴',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#C8623A', // 赭橙 — anti-AI default blue
          colorBackground: '#0A0A0B',
          colorInputBackground: '#111113',
          colorInputText: '#EDEDED',
          colorText: '#EDEDED',
          colorTextSecondary: 'rgb(237 237 237 / 0.65)',
          borderRadius: '4px', // 反 SaaS 圆角塑料感
          fontFamily: 'var(--font-onest), system-ui, sans-serif',
        },
      }}
    >
      <html
        lang="zh-CN"
        className={`${instrumentSerif.variable} ${onest.variable} ${notoSerifSC.variable} ${jetbrainsMono.variable} dark`}
      >
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
