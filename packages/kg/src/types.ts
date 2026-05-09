/**
 * forge.dev · Knowledge Graph 类型定义
 *
 * 所有 schema 用 zod 写一份 — 既是类型又是运行时验证
 */

import { z } from 'zod'

export const nodeSchema = z.object({
  id: z.string().regex(/^n\d+$/, 'ID must be n followed by digits'),
  slug: z
    .string()
    .regex(
      /^[a-z0-9][a-z0-9-]*$/,
      'slug must be lowercase kebab-case (letters, digits, hyphens; no underscores or spaces)'
    ),
  title: z.string().min(1),
  phase: z.number().int().positive(),
  phase_name: z.string(),
  project: z.string(),
  order: z.number().int().nonnegative(),
  duration: z.number().int(),                         // -1 = 持续
  difficulty: z.number().int().min(1).max(5),
  depends_on: z.array(z.string()).default([]),
  unlocks: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'review', 'ready']).optional(),
  authors: z.array(z.string()).optional(),
  last_updated: z.string().optional(),
})

export type Node = z.infer<typeof nodeSchema>

export const projectSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  target_audience: z.string().optional(),
  estimated_total_hours: z.number().optional(),
  estimated_calendar_weeks: z.number().optional(),
  hardware_required: z.array(z.string()).optional(),
  learning_path: z.array(z.string()).default([]),
})

export type Project = z.infer<typeof projectSchema>

export const knowledgeGraphSchema = z.object({
  projects: z.record(z.string(), projectSchema),
  nodes: z.array(nodeSchema),
})

export type KnowledgeGraphData = z.infer<typeof knowledgeGraphSchema>

export interface KnowledgeGraph {
  projects: Map<string, Project & { slug: string }>
  nodes: Map<string, Node>
  /** Get all nodes in a project's learning_path order */
  getProjectNodes(projectSlug: string): Node[]
  /** Get a single node by ID */
  getNode(id: string): Node | undefined
  /** Get a project by slug */
  getProject(slug: string): (Project & { slug: string }) | undefined
  /** Topological sort — given a project, return nodes in dependency order */
  topologicalOrder(projectSlug: string): Node[]
  /** Find nodes that are "ready to learn" given completed set */
  readyNodes(projectSlug: string, completed: Set<string>): Node[]
  /** Get next recommended node for user */
  nextNode(projectSlug: string, completed: Set<string>): Node | undefined
}
