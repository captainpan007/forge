/**
 * JARVIS Agent — Claude API + tool calling 主循环
 *
 * v0.x: stub (返回占位消息验证导入路径)
 * v0.3: 实际 Anthropic SDK 调用，SSE streaming
 *
 * 设计参考：
 *   - https://docs.anthropic.com/en/docs/build-with-claude/tool-use
 *   - apps/web/app/api/jarvis/chat/route.ts 是 HTTP 入口
 */

import type { JarvisContext, JarvisMessage } from './types'
import { buildSystemPrompt } from './prompts/system'

interface RunAgentInput {
  apiKey: string
  context: JarvisContext
  messages: JarvisMessage[]
}

interface RunAgentResult {
  text: string
  toolUses: Array<{ name: string; input: unknown }>
}

export async function runAgent(_input: RunAgentInput): Promise<RunAgentResult> {
  // v0.x stub
  return {
    text:
      'JARVIS agent loop will be implemented in v0.3. Full pipeline: Anthropic SDK + tool use + SSE streaming.',
    toolUses: [],
  }
}

export { buildSystemPrompt }
