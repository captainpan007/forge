/**
 * @forge/ai — 类型定义
 */

export type JarvisMode = 'workshop' | 'coach' | 'review'

export interface JarvisContext {
  userId: string
  jarvisName: string
  jarvisAddress: string
  mode: JarvisMode
  currentNodeId?: string
  currentProjectSlug?: string
  completedNodeIds?: string[]
}

export interface JarvisMessage {
  role: 'user' | 'assistant' | 'tool'
  content:
    | { type: 'text'; text: string }
    | { type: 'tool_use'; id: string; name: string; input: unknown }
    | { type: 'tool_result'; tool_use_id: string; content: unknown; is_error?: boolean }
}

// ═══════════════════════════════════════════════════
// Tool Calling
// ═══════════════════════════════════════════════════

/**
 * Anthropic tool 定义 — 给 Claude API 看的元数据。
 * input_schema 是 JSON Schema。
 */
export interface ToolSpec {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

/**
 * Tool executor — 由 apps/web 注入，因为执行需要 DB / KG 访问
 *
 * 签名：(name, input, ctx) => Promise<result>
 *   - name: 工具名（必须匹配 ToolSpec.name）
 *   - input: Claude 给的 JSON 输入
 *   - ctx: 当前用户上下文
 *   - 返回：会被序列化成 string 作为 tool_result 内容；失败则 throw
 */
export type ToolExecutor = (
  name: string,
  input: unknown,
  ctx: JarvisContext
) => Promise<unknown>

/**
 * Stream event — agent 通过 yield 传给消费者
 *
 * 不是只 yield string 了：tool_use / tool_result 事件让 UI 可以显示状态
 */
export type StreamEvent =
  | { type: 'text_delta'; text: string }
  | { type: 'tool_use_start'; name: string; input?: unknown }
  | { type: 'tool_use_end'; name: string; result?: unknown; error?: string }
  | { type: 'turn_end' }

// 兼容旧 API
export interface ToolDefinition {
  name: string
  description: string
  inputSchema: unknown
  execute: (...args: unknown[]) => Promise<unknown>
}
