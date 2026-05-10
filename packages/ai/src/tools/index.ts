/**
 * JARVIS 工具定义（Anthropic schema）
 *
 * 工具的实现由 apps/web 提供（因为要访问 DB + Knowledge Graph）。
 * 这里只声明 schema，让 Claude API 知道可以调用哪些工具。
 *
 * v0.3.5 三个工具：
 *   - recommend_next_node — 推荐下一节
 *   - get_project_status  — 看当前项目进度
 *   - search_failure_log  — 查相似的卡点（其他用户卡过的）
 *
 * v0.4+ 计划：
 *   - search_docs        — 查 Pi/Adafruit/MDN 文档（需联网）
 *   - parse_error        — 解析 stderr / 报错日志
 *   - analyze_image      — 看用户上传的电路照片（需 vision）
 */

import type { ToolSpec } from '../types'

export const tools: ToolSpec[] = [
  {
    name: 'recommend_next_node',
    description:
      "Recommend the next learning node the user should tackle in a project. Returns the node's id, title, brief 'why' rationale, estimated time, and dependencies. Use this when the user asks 'what should I do next' or similar.",
    input_schema: {
      type: 'object',
      properties: {
        project_slug: {
          type: 'string',
          description:
            "Project to recommend within. If user is currently in a project (context.currentProjectSlug is set), prefer that. Otherwise ask the user.",
        },
      },
      required: ['project_slug'],
    },
  },
  {
    name: 'get_project_status',
    description:
      "Get the user's progress on a project: total nodes, completed count, percent, current phase, time spent. Use when user asks 'how far am I' or to ground your advice in their actual progress.",
    input_schema: {
      type: 'object',
      properties: {
        project_slug: {
          type: 'string',
          description: 'Project slug (e.g. "soundbox")',
        },
      },
      required: ['project_slug'],
    },
  },
  {
    name: 'search_failure_log',
    description:
      "Search the failure log for past issues matching a symptom. Use when user describes an error / unexpected behavior to see if anyone else has hit it. Returns up to 5 relevant entries with symptom/cause/solution.",
    input_schema: {
      type: 'object',
      properties: {
        symptom: {
          type: 'string',
          description: 'Brief description of what went wrong',
        },
      },
      required: ['symptom'],
    },
  },
]

/**
 * 工具名常量 — 给 apps/web 的 ToolExecutor 用
 */
export const TOOL_NAMES = {
  RECOMMEND_NEXT_NODE: 'recommend_next_node',
  GET_PROJECT_STATUS: 'get_project_status',
  SEARCH_FAILURE_LOG: 'search_failure_log',
} as const

export type ToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES]
