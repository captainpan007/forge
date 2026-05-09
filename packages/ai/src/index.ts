/**
 * @forge/ai — JARVIS Agent
 *
 * Public API:
 *   - streamAgent(input): async iterable yielding text deltas
 *   - runAgent(input): non-streaming version
 *   - buildSystemPrompt(ctx): build the JARVIS system prompt
 *   - tools: tool definitions (v0.3.1+)
 *   - 类型: JarvisContext, JarvisMessage, JarvisMode
 */

export { streamAgent, runAgent, buildSystemPrompt } from './agent'
export { tools } from './tools'
export type { JarvisContext, JarvisMessage, JarvisMode, ToolDefinition } from './types'
