/**
 * @forge/ai — JARVIS Agent
 *
 * Public API:
 *   - runAgent(input): 跑一次 agent loop
 *   - buildSystemPrompt(ctx): 拼 system prompt
 *   - tools: 工具定义
 *   - 类型: JarvisContext, JarvisMessage, JarvisMode
 */

export { runAgent, buildSystemPrompt } from './agent'
export { tools } from './tools'
export type { JarvisContext, JarvisMessage, JarvisMode, ToolDefinition } from './types'
