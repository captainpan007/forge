/**
 * 常用数据库查询封装
 *
 * 所有查询都在这里集中，方便 review、加缓存、改 ORM
 */

import { eq, and, desc } from 'drizzle-orm'
import { db, schema } from './client'

// ═══════════════════════════════════════════════════
// Users
// ═══════════════════════════════════════════════════

export async function getOrCreateUser(
  clerkId: string,
  email: string
): Promise<schema.User> {
  // 原子 UPSERT — 防止并发的 Server Components 同时触发 INSERT 撞 UNIQUE
  // (Next.js RSC 在同一请求内可能并行渲染多个组件，每个都会调 requireUser)
  const result = await db
    .insert(schema.users)
    .values({ id: clerkId, email })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: {
        email,
        updatedAt: Math.floor(Date.now() / 1000),
      },
    })
    .returning()

  const user = result[0]
  if (!user) {
    throw new Error(`Failed to upsert user ${clerkId}`)
  }
  return user
}

export async function updateUserPreferences(
  userId: string,
  preferences: schema.UserPreferences
) {
  return db
    .update(schema.users)
    .set({ preferences, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(schema.users.id, userId))
    .returning()
}

// ═══════════════════════════════════════════════════
// User Projects
// ═══════════════════════════════════════════════════

export async function getUserProjects(userId: string) {
  return db.query.userProjects.findMany({
    where: eq(schema.userProjects.userId, userId),
    orderBy: [desc(schema.userProjects.startedAt)],
  })
}

export async function startProject(userId: string, projectSlug: string) {
  return db
    .insert(schema.userProjects)
    .values({ userId, projectSlug })
    .onConflictDoNothing()
    .returning()
}

// ═══════════════════════════════════════════════════
// Node Progress
// ═══════════════════════════════════════════════════

export async function getUserProgress(userId: string) {
  return db.query.nodeProgress.findMany({
    where: eq(schema.nodeProgress.userId, userId),
  })
}

export async function getNodeProgress(userId: string, nodeId: string) {
  return db.query.nodeProgress.findFirst({
    where: and(
      eq(schema.nodeProgress.userId, userId),
      eq(schema.nodeProgress.nodeId, nodeId)
    ),
  })
}

export async function setNodeStatus(
  userId: string,
  nodeId: string,
  status: 'locked' | 'available' | 'in_progress' | 'completed'
) {
  const now = Math.floor(Date.now() / 1000)
  return db
    .insert(schema.nodeProgress)
    .values({
      userId,
      nodeId,
      status,
      startedAt: status === 'in_progress' ? now : undefined,
      completedAt: status === 'completed' ? now : undefined,
    })
    .onConflictDoUpdate({
      target: [schema.nodeProgress.userId, schema.nodeProgress.nodeId],
      set: {
        status,
        startedAt: status === 'in_progress' ? now : undefined,
        completedAt: status === 'completed' ? now : undefined,
      },
    })
    .returning()
}
