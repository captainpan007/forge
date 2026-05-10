/**
 * @forge/ai — JARVIS Agent
 *
 * Public API:
 *   - streamAgent(input): async iterable yielding StreamEvent
 *   - runAgent(input): non-streaming wrapper
 *   - buildSystemPrompt(ctx)
 *   - tools: ToolSpec[] for Anthropic API
 *   - 类型: JarvisContext / JarvisMessage / StreamEvent / ToolExecutor / ToolName
 */

export { streamAgent, runAgent, buildSystemPrompt } from './agent'
export { tools, TOOL_NAMES } from './tools'
export type {
  JarvisContext,
  JarvisMessage,
  JarvisMode,
  StreamEvent,
  ToolDefinition,
  ToolExecutor,
  ToolSpec,
} from './types'
export type { ToolName } from './tools'
