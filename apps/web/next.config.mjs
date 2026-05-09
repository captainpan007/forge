import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 让 monorepo 的 packages 也参与 hot reload
  transpilePackages: ['@forge/ai', '@forge/kg', '@forge/ui'],

  // 严格模式
  reactStrictMode: true,

  // 内容文件夹路径作为环境常量，方便 server-side 加载
  env: {
    FORGE_CONTENT_DIR: resolve(__dirname, '../../content'),
  },

  // 实验性功能
  experimental: {
    // 让 packages/* 的 server actions 也能用
    serverComponentsExternalPackages: [],
    // 启用部分 PPR (Partial Prerendering) — Next.js 14.2+ 实验功能
    // ppr: true,
  },

  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },

  // 安全 headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
