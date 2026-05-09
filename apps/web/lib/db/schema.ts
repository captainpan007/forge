/**
 * forge.dev · Database Schema
 *
 * Drizzle ORM schema for libSQL (Turso / SQLite)
 * 与 ARCHITECTURE.md 中的 SQL schema 保持同步
 */

import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

// ═══════════════════════════════════════════════════
// Users
// ═══════════════════════════════════════════════════

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),                                      // Clerk user_id
  email: text('email').notNull(),
  jarvisName: text('jarvis_name').notNull().default('JARVIS'),
  jarvisAddress: text('jarvis_address').notNull().default('Sir'),
  // Anthropic API Key (AES-256 加密后存储 — 见 lib/encryption.ts)
  anthropicApiKey: text('anthropic_api_key'),
  preferences: text('preferences', { mode: 'json' }).$type<UserPreferences>(),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
})

export interface UserPreferences {
  os?: 'mac' | 'windows' | 'linux'
  hasRaspberryPi?: boolean
  theme?: 'dark' | 'light'
  jarvisMode?: 'workshop' | 'coach' | 'review'
}

// ═══════════════════════════════════════════════════
// User Projects (用户激活的项目)
// ═══════════════════════════════════════════════════

export const userProjects = sqliteTable(
  'user_projects',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    projectSlug: text('project_slug').notNull(),
    startedAt: integer('started_at').notNull().default(sql`(unixepoch())`),
    completedAt: integer('completed_at'),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.projectSlug] }),
    userIdx: index('user_projects_user_idx').on(t.userId),
  })
)

// ═══════════════════════════════════════════════════
// Node Progress (用户在每个节点的进度)
// ═══════════════════════════════════════════════════

export const nodeProgress = sqliteTable(
  'node_progress',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    nodeId: text('node_id').notNull(),
    status: text('status', {
      enum: ['locked', 'available', 'in_progress', 'completed'],
    }).notNull().default('locked'),
    startedAt: integer('started_at'),
    completedAt: integer('completed_at'),
    feynmanPassedAt: integer('feynman_passed_at'),
    timeSpentSeconds: integer('time_spent_seconds').notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.nodeId] }),
    userIdx: index('node_progress_user_idx').on(t.userId),
    statusIdx: index('node_progress_status_idx').on(t.userId, t.status),
  })
)

// ═══════════════════════════════════════════════════
// Conversations (JARVIS 对话)
// ═══════════════════════════════════════════════════

export const conversations = sqliteTable(
  'conversations',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    contextNodeId: text('context_node_id'),
    contextProjectSlug: text('context_project_slug'),
    mode: text('mode', { enum: ['workshop', 'coach', 'review'] }).notNull().default('workshop'),
    createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
  },
  (t) => ({
    userIdx: index('conversations_user_idx').on(t.userId),
    nodeIdx: index('conversations_node_idx').on(t.userId, t.contextNodeId),
  })
)

export const messages = sqliteTable(
  'messages',
  {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id').notNull().references(() => conversations.id, {
      onDelete: 'cascade',
    }),
    role: text('role', { enum: ['user', 'assistant', 'tool'] }).notNull(),
    // JSON: { type: 'text' | 'tool_use' | 'tool_result', ... }
    content: text('content', { mode: 'json' }).notNull().$type<MessageContent[]>(),
    createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  },
  (t) => ({
    conversationIdx: index('messages_conversation_idx').on(t.conversationId),
  })
)

export type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown }
  | { type: 'tool_result'; tool_use_id: string; content: unknown; is_error?: boolean }

// ═══════════════════════════════════════════════════
// Feynman Submissions
// ═══════════════════════════════════════════════════

export const feynmanSubmissions = sqliteTable(
  'feynman_submissions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    nodeId: text('node_id').notNull(),
    submissionType: text('submission_type', { enum: ['audio', 'text'] }).notNull(),
    content: text('content').notNull(),
    audioUrl: text('audio_url'),
    transcript: text('transcript'),
    critique: text('critique', { mode: 'json' }).$type<FeynmanCritique>(),
    followUpAnswers: text('follow_up_answers', { mode: 'json' }).$type<string[]>(),
    passed: integer('passed', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  },
  (t) => ({
    userNodeIdx: index('feynman_user_node_idx').on(t.userId, t.nodeId),
  })
)

export interface FeynmanCritique {
  positives: string[]
  issues: string[]
  followUps: { question: string; hint: string }[]
}

// ═══════════════════════════════════════════════════
// Failure Logs
// ═══════════════════════════════════════════════════

export const failureLogs = sqliteTable(
  'failure_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    nodeId: text('node_id'),
    symptom: text('symptom').notNull(),
    cause: text('cause'),
    solution: text('solution'),
    isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  },
  (t) => ({
    userIdx: index('failure_logs_user_idx').on(t.userId),
    publicIdx: index('failure_logs_public_idx').on(t.isPublic),
  })
)

// ═══════════════════════════════════════════════════
// Journal Entries
// ═══════════════════════════════════════════════════

export const journalEntries = sqliteTable(
  'journal_entries',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),                         // YYYY-MM-DD
    content: text('content').notNull(),
    createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  },
  (t) => ({
    userDateIdx: index('journal_user_date_idx').on(t.userId, t.date),
  })
)

// ═══════════════════════════════════════════════════
// Relations
// ═══════════════════════════════════════════════════

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(userProjects),
  progress: many(nodeProgress),
  conversations: many(conversations),
  feynmanSubmissions: many(feynmanSubmissions),
  failureLogs: many(failureLogs),
  journalEntries: many(journalEntries),
}))

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, { fields: [conversations.userId], references: [users.id] }),
  messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}))

// ═══════════════════════════════════════════════════
// Type exports for app code
// ═══════════════════════════════════════════════════

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type NodeProgress = typeof nodeProgress.$inferSelect
export type Conversation = typeof conversations.$inferSelect
export type Message = typeof messages.$inferSelect
export type FeynmanSubmission = typeof feynmanSubmissions.$inferSelect
export type FailureLog = typeof failureLogs.$inferSelect
export type JournalEntry = typeof journalEntries.$inferSelect
