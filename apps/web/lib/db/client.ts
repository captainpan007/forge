import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

/**
 * Turso (libSQL) client — singleton
 *
 * 在 dev 环境，Turso URL 可以是本地 file:./forge.db 跑 SQLite
 * 在 prod，用 libsql://... + auth token
 */

const url = process.env.TURSO_DATABASE_URL ?? 'file:./forge.db'
const authToken = process.env.TURSO_AUTH_TOKEN

const client = createClient({
  url,
  ...(authToken ? { authToken } : {}),
})

export const db = drizzle(client, { schema })
export { schema }
