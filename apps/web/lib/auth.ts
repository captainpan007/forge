/**
 * 认证辅助函数
 *
 * 包装 Clerk 的 server-side helpers，让业务代码更直接
 */

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrCreateUser } from './db/queries'

/**
 * 在 server component / server action 里获取当前用户
 * 没登录直接 redirect 到 sign-in
 */
export async function requireUser() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()
  if (!clerkUser) redirect('/sign-in')

  // 同步到本地 DB（首次登录会自动创建）
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
  const user = await getOrCreateUser(userId, email)

  return { clerkUser, user }
}

/**
 * 不强制登录的版本 — 用于既支持登录也支持游客的页面
 */
export async function getOptionalUser() {
  const { userId } = await auth()
  if (!userId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
  const user = await getOrCreateUser(userId, email)
  return { clerkUser, user }
}
