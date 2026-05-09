import type { Config } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

// drizzle-kit 是独立工具，不像 Next.js 会自动加载 .env.local
// 复用 @next/env（Next.js 内部用的同一个 loader）确保 env 加载顺序一致
loadEnvConfig(process.cwd())

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url) {
  throw new Error(
    'TURSO_DATABASE_URL is not set. Check apps/web/.env.local — did you fill it in?'
  )
}

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'turso',
  dbCredentials: {
    url,
    ...(authToken ? { authToken } : {}),
  },
  verbose: true,
  strict: true,
} satisfies Config
