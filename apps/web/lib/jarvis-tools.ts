/**
 * JARVIS 工具的 *执行*（apps/web 这边实现，因为要访问 DB + KG）
 *
 * 工具的 *声明* 在 packages/ai/src/tools/index.ts。
 * 这里实现的 ToolExecutor 由 /api/jarvis/chat 路由注入到 streamAgent。
 */

import { eq, and, like } from 'drizzle-orm'
import type { ToolExecutor, JarvisContext } from '@forge/ai'
import { TOOL_NAMES } from '@forge/ai'
import { getKnowledgeGraph } from './content'
import { db, schema } from './db/client'
import { formatDuration } from './utils'

interface RecommendNextNodeInput {
  project_slug?: string
}

interface GetProjectStatusInput {
  project_slug?: string
}

interface SearchFailureLogInput {
  symptom?: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// ─────────────────────────────────────────────
// recommend_next_node
// ─────────────────────────────────────────────
async function recommendNextNode(
  rawInput: unknown,
  ctx: JarvisContext
): Promise<unknown> {
  const input = (isObject(rawInput) ? rawInput : {}) as RecommendNextNodeInput
  const projectSlug = input.project_slug ?? ctx.currentProjectSlug
  if (!projectSlug) {
    return { error: 'project_slug not specified and user is not in a project' }
  }

  const graph = await getKnowledgeGraph()
  const project = graph.getProject(projectSlug)
  if (!project) return { error: `Project "${projectSlug}" not found` }

  // 查用户进度
  const progress = await db.query.nodeProgress.findMany({
    where: and(
      eq(schema.nodeProgress.userId, ctx.userId),
      eq(schema.nodeProgress.status, 'completed')
    ),
  })
  const completed = new Set(progress.map((p) => p.nodeId))

  const nextNode = graph.nextNode(projectSlug, completed)
  if (!nextNode) {
    return {
      project: project.title,
      message: 'All nodes completed for this project — congrats!',
      completed_count: completed.size,
    }
  }

  return {
    project: project.title,
    next_node: {
      id: nextNode.id,
      title: nextNode.title,
      phase: nextNode.phase_name,
      duration: formatDuration(nextNode.duration),
      difficulty: nextNode.difficulty,
      depends_on: nextNode.depends_on,
      tags: nextNode.tags,
    },
    completed_count: completed.size,
    total_nodes: project.learning_path.length,
    progress_pct: Math.round((completed.size / project.learning_path.length) * 100),
  }
}

// ─────────────────────────────────────────────
// get_project_status
// ─────────────────────────────────────────────
async function getProjectStatus(
  rawInput: unknown,
  ctx: JarvisContext
): Promise<unknown> {
  const input = (isObject(rawInput) ? rawInput : {}) as GetProjectStatusInput
  const projectSlug = input.project_slug ?? ctx.currentProjectSlug
  if (!projectSlug) {
    return { error: 'project_slug not specified' }
  }

  const graph = await getKnowledgeGraph()
  const project = graph.getProject(projectSlug)
  if (!project) return { error: `Project "${projectSlug}" not found` }

  const progress = await db.query.nodeProgress.findMany({
    where: eq(schema.nodeProgress.userId, ctx.userId),
  })
  const completed = progress.filter((p) => p.status === 'completed')
  const inProgress = progress.filter((p) => p.status === 'in_progress')
  const totalSeconds = progress.reduce((sum, p) => sum + p.timeSpentSeconds, 0)

  // 找当前阶段（第一个未完成节点的 phase）
  const projectNodes = graph.getProjectNodes(projectSlug)
  const completedSet = new Set(completed.map((p) => p.nodeId))
  const firstUndone = projectNodes.find((n) => !completedSet.has(n.id))
  const currentPhase = firstUndone
    ? `${firstUndone.phase}: ${firstUndone.phase_name}`
    : 'all phases complete'

  return {
    project: project.title,
    tagline: project.tagline,
    total_nodes: projectNodes.length,
    completed_count: completed.length,
    in_progress_count: inProgress.length,
    progress_pct: Math.round((completed.length / projectNodes.length) * 100),
    time_spent_hours: Math.round((totalSeconds / 3600) * 10) / 10,
    current_phase: currentPhase,
  }
}

// ─────────────────────────────────────────────
// search_failure_log
// ─────────────────────────────────────────────
async function searchFailureLog(
  rawInput: unknown,
  ctx: JarvisContext
): Promise<unknown> {
  const input = (isObject(rawInput) ? rawInput : {}) as SearchFailureLogInput
  const symptom = input.symptom?.trim()
  if (!symptom) return { error: 'symptom not provided' }

  // 简单 LIKE 搜索 — v1 升级到向量检索
  const pattern = `%${symptom.toLowerCase().slice(0, 100)}%`
  const results = await db.query.failureLogs.findMany({
    where: and(
      eq(schema.failureLogs.userId, ctx.userId),
      like(schema.failureLogs.symptom, pattern)
    ),
    limit: 5,
  })

  if (results.length === 0) {
    return {
      query: symptom,
      results: [],
      hint: 'No matching failures in your log yet. As you encounter issues, log them — future-you (and other forge users via public log) will thank you.',
    }
  }

  return {
    query: symptom,
    results: results.map((r) => ({
      symptom: r.symptom,
      cause: r.cause ?? '(unknown)',
      solution: r.solution ?? '(no solution recorded)',
      node_id: r.nodeId,
      logged_at: new Date(r.createdAt * 1000).toISOString(),
    })),
  }
}

// ─────────────────────────────────────────────
// 主入口：路由器
// ─────────────────────────────────────────────
export const jarvisToolExecutor: ToolExecutor = async (name, input, ctx) => {
  switch (name) {
    case TOOL_NAMES.RECOMMEND_NEXT_NODE:
      return recommendNextNode(input, ctx)
    case TOOL_NAMES.GET_PROJECT_STATUS:
      return getProjectStatus(input, ctx)
    case TOOL_NAMES.SEARCH_FAILURE_LOG:
      return searchFailureLog(input, ctx)
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}
