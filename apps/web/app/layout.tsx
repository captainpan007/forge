import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
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
  themeColor: '#08090A',
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
          colorPrimary: '#3B82F6',
          colorBackground: '#08090A',
          colorInputBackground: '#0F1011',
          colorInputText: '#F4F4F5',
          colorText: '#F4F4F5',
          colorTextSecondary: '#A1A1AA',
          borderRadius: '6px',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      }}
    >
      <html lang="zh-CN" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
