/**
 * 常用数据库查询封装
 *
 * 所有查询都在这里集中，方便 review、加缓存、改 ORM
 */

import { eq, and, desc, isNull } from 'drizzle-orm'
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

/**
 * 部分更新 user — 任意字段（jarvis name/address/preferences/api key 等）
 */
export async function updateUserSettings(
  userId: string,
  patch: Partial<{
    jarvisName: string
    jarvisAddress: string
    preferences: schema.UserPreferences
    anthropicApiKey: string | null
  }>
): Promise<schema.User> {
  const result = await db
    .update(schema.users)
    .set({ ...patch, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(schema.users.id, userId))
    .returning()
  const user = result[0]
  if (!user) throw new Error(`User ${userId} not found`)
  return user
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

// ═══════════════════════════════════════════════════
// Conversations + Messages (JARVIS chat persistence)
// ═══════════════════════════════════════════════════

import { randomUUID } from 'node:crypto'

/**
 * 找到或创建一个对话 — 按 (user, project, node) context 切分
 *
 * 设计哲学：每个 (project, node) 一条线性对话历史。换页面 = 换对话。
 * 想看历史就回到那个 page。
 */
export async function getOrCreateConversation(
  userId: string,
  projectSlug: string | undefined,
  nodeId: string | undefined,
  mode: 'workshop' | 'coach' | 'review' = 'workshop'
): Promise<schema.Conversation> {
  // 找现有对话（最新的一条）
  const conditions = [
    eq(schema.conversations.userId, userId),
    eq(schema.conversations.mode, mode),
  ]
  conditions.push(
    projectSlug
      ? eq(schema.conversations.contextProjectSlug, projectSlug)
      : isNull(schema.conversations.contextProjectSlug)
  )
  conditions.push(
    nodeId
      ? eq(schema.conversations.contextNodeId, nodeId)
      : isNull(schema.conversations.contextNodeId)
  )

  const existing = await db.query.conversations.findFirst({
    where: and(...conditions),
    orderBy: [desc(schema.conversations.updatedAt)],
  })
  if (existing) return existing

  const id = randomUUID()
  const result = await db
    .insert(schema.conversations)
    .values({
      id,
      userId,
      contextProjectSlug: projectSlug ?? null,
      contextNodeId: nodeId ?? null,
      mode,
    })
    .returning()
  const created = result[0]
  if (!created) throw new Error('Failed to create conversation')
  return created
}

export async function touchConversation(conversationId: string): Promise<void> {
  await db
    .update(schema.conversations)
    .set({ updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(schema.conversations.id, conversationId))
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'tool',
  content: schema.MessageContent[]
): Promise<schema.Message> {
  const id = randomUUID()
  const result = await db
    .insert(schema.messages)
    .values({ id, conversationId, role, content })
    .returning()
  const msg = result[0]
  if (!msg) throw new Error('Failed to save message')
  await touchConversation(conversationId)
  return msg
}

export async function getConversationMessages(
  conversationId: string,
  limit = 100
): Promise<schema.Message[]> {
  return db.query.messages.findMany({
    where: eq(schema.messages.conversationId, conversationId),
    orderBy: [schema.messages.createdAt, schema.messages.id],
    limit,
  })
}
