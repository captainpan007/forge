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

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string
  description: string
  inputSchema: unknown            // JSON schema
  execute: (input: TInput, context: JarvisContext) => Promise<TOutput>
}
