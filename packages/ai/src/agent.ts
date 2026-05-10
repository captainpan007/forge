/**
 * JARVIS Agent — Anthropic Claude API + 流式响应 + Tool Calling
 *
 * v0.3:   纯文本对话
 * v0.3.5: 加入多轮 tool use 循环 ★
 *   - 工具定义在 tools/index.ts（schema-only）
 *   - 工具执行通过外部 ToolExecutor 注入（apps/web 实现）
 *   - 最多 MAX_TURNS 轮迭代防止失控
 */

import Anthropic from '@anthropic-ai/sdk'
import type { Anthropic as AnthropicTypes } from '@anthropic-ai/sdk'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { ProxyAgent, setGlobalDispatcher } from 'undici'
import type {
  JarvisContext,
  JarvisMessage,
  StreamEvent,
  ToolExecutor,
} from './types'
import { buildSystemPrompt } from './prompts/system'
import { tools as toolSpecs } from './tools'

const FALLBACK_MODEL = 'claude-haiku-4-5-20251001'
const DEFAULT_MAX_TOKENS = 2048
const MAX_TURNS = 5 // 防 tool use 死循环

function resolveModel(input?: string): string {
  return input ?? process.env.ANTHROPIC_MODEL ?? FALLBACK_MODEL
}

/**
 * 让 Node 22 的全局 fetch 走 HTTPS_PROXY (适用于 Vercel prod / 多数 SDK)
 *
 * 注意：webpack-bundled undici 跟 Node 内置 undici 是两个实例，
 *       这个调用只影响 webpack 这边。Anthropic SDK 在某些路径会走 Node
 *       内置 undici → 我们额外通过 httpAgent 兜底（见下方 streamAgent）。
 */
let proxyConfigured = false
function ensureProxyDispatcher(): void {
  if (proxyConfigured) return
  const proxyUrl =
    process.env.HTTPS_PROXY ??
    process.env.https_proxy ??
    process.env.HTTP_PROXY ??
    process.env.http_proxy
  if (proxyUrl) {
    try {
      setGlobalDispatcher(new ProxyAgent(proxyUrl))
      // eslint-disable-next-line no-console
      console.log(`[forge/ai] global fetch dispatcher → ${proxyUrl}`)
    } catch (err) {
      console.error('[forge/ai] Failed to install ProxyAgent:', err)
    }
  }
  proxyConfigured = true
}

interface StreamAgentInput {
  apiKey: string
  context: JarvisContext
  /** 已有对话消息（最新的 user message 也在这里） */
  messages: JarvisMessage[]
  model?: string
  maxTokens?: number
  /** 工具执行器 — 不传则不启用 tool calling */
  toolExecutor?: ToolExecutor
}

// ═══════════════════════════════════════════════════
// 类型 helper（把 JarvisMessage 转 Anthropic 格式）
// ═══════════════════════════════════════════════════

type AnthropicMessage = AnthropicTypes.Messages.MessageParam

interface PendingToolUse {
  id: string
  name: string
  inputJson: string
}

// ═══════════════════════════════════════════════════
// streamAgent — 主入口（真正流式 tool use loop）
// ═══════════════════════════════════════════════════

/**
 * 流式调用 Claude，yield StreamEvent
 *   - text_delta: 流式 token
 *   - tool_use_start / tool_use_end: 工具调用进度（UI 可显示状态）
 *   - turn_end: Claude 这一轮说完了（可能进入下一轮）
 *
 * 用法：
 *   for await (const ev of streamAgent({ apiKey, context, messages, toolExecutor })) {
 *     if (ev.type === 'text_delta') process.stdout.write(ev.text)
 *   }
 */
export async function* streamAgent(
  input: StreamAgentInput
): AsyncIterable<StreamEvent> {
  ensureProxyDispatcher()

  // 显式给 SDK 喂 httpAgent — 关键，绕过 webpack 双 undici 问题
  const proxyUrl =
    process.env.HTTPS_PROXY ??
    process.env.https_proxy ??
    process.env.HTTP_PROXY ??
    process.env.http_proxy
  const httpAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  const baseURL = process.env.ANTHROPIC_BASE_URL
  const client = new Anthropic({
    apiKey: input.apiKey,
    ...(baseURL ? { baseURL } : {}),
    ...(httpAgent ? { httpAgent } : {}),
  })

  const systemPrompt = buildSystemPrompt(input.context)
  const model = resolveModel(input.model)
  const maxTokens = input.maxTokens ?? DEFAULT_MAX_TOKENS

  // 把 JarvisMessage 转成 Anthropic 格式（保留 tool_use / tool_result）
  const messages: AnthropicMessage[] = input.messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m): AnthropicMessage | null => {
      const c = m.content
      if (c.type === 'text') {
        return { role: m.role as 'user' | 'assistant', content: c.text }
      }
      if (c.type === 'tool_use') {
        return {
          role: 'assistant',
          content: [{ type: 'tool_use', id: c.id, name: c.name, input: c.input }],
        }
      }
      if (c.type === 'tool_result') {
        return {
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: c.tool_use_id,
              content:
                typeof c.content === 'string'
                  ? c.content
                  : JSON.stringify(c.content),
              is_error: c.is_error,
            },
          ],
        }
      }
      return null
    })
    .filter((m): m is AnthropicMessage => m !== null)

  // 多轮 tool use 循环
  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const stream = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
      stream: true,
      ...(input.toolExecutor ? { tools: toolSpecs } : {}),
    })

    // 解析流：累积 text + tool_use blocks
    const assistantBlocks: Array<
      | { type: 'text'; text: string }
      | { type: 'tool_use'; id: string; name: string; input: unknown }
    > = []
    let pendingToolUse: PendingToolUse | null = null
    let stopReason: string | null = null

    for await (const event of stream) {
      // 工具调用块开始 — 开始累积 input JSON
      if (
        event.type === 'content_block_start' &&
        event.content_block.type === 'tool_use'
      ) {
        pendingToolUse = {
          id: event.content_block.id,
          name: event.content_block.name,
          inputJson: '',
        }
        yield { type: 'tool_use_start', name: pendingToolUse.name }
      }
      // ★ 注意：故意不在 content_block_start type='text' 时 push 空 text block
      //   只在第一次 text_delta 到来时按需 push（防止 Anthropic 下一轮拒绝空 text content）

      if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          yield { type: 'text_delta', text: event.delta.text }
          // 把 delta 累到最近的 text block；不存在则新建
          const last = assistantBlocks[assistantBlocks.length - 1]
          if (last && last.type === 'text') {
            last.text += event.delta.text
          } else {
            assistantBlocks.push({ type: 'text', text: event.delta.text })
          }
        }
        if (event.delta.type === 'input_json_delta' && pendingToolUse) {
          pendingToolUse.inputJson += event.delta.partial_json
        }
      }

      if (event.type === 'content_block_stop' && pendingToolUse) {
        let parsedInput: unknown = {}
        try {
          parsedInput = pendingToolUse.inputJson
            ? JSON.parse(pendingToolUse.inputJson)
            : {}
        } catch {
          // 输入解析失败 — 让 tool 自己处理空对象
        }
        assistantBlocks.push({
          type: 'tool_use',
          id: pendingToolUse.id,
          name: pendingToolUse.name,
          input: parsedInput,
        })
        pendingToolUse = null
      }

      if (event.type === 'message_delta' && event.delta.stop_reason) {
        stopReason = event.delta.stop_reason
      }
    }

    yield { type: 'turn_end' }

    // 没用工具或不允许工具 → 收工
    if (stopReason !== 'tool_use' || !input.toolExecutor) {
      return
    }

    // 工具调用：把 assistant 的 blocks 加入 history
    // ★ 过滤空 text block — Anthropic 拒绝空文本块作为 assistant content
    const cleanBlocks = assistantBlocks.filter(
      (b) => b.type !== 'text' || (b.text && b.text.length > 0)
    )
    if (cleanBlocks.length === 0) {
      // 极端：没有任何 block — 异常，跳出
      console.error('[forge/ai] no content blocks in assistant turn — aborting loop')
      return
    }
    messages.push({ role: 'assistant', content: cleanBlocks })

    // 执行所有 tool_use → 收集 tool_result
    const toolResultContents: AnthropicTypes.Messages.ToolResultBlockParam[] = []
    for (const block of assistantBlocks) {
      if (block.type !== 'tool_use') continue
      try {
        const result = await input.toolExecutor(block.name, block.input, input.context)
        const content =
          typeof result === 'string' ? result : JSON.stringify(result)
        toolResultContents.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content,
        })
        yield { type: 'tool_use_end', name: block.name, result }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Tool execution failed'
        toolResultContents.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: `Error: ${msg}`,
          is_error: true,
        })
        yield { type: 'tool_use_end', name: block.name, error: msg }
      }
    }

    // 把 tool_result 作为 user turn 加入 history → 进入下一轮让 Claude 处理结果
    messages.push({ role: 'user', content: toolResultContents })
  }

  // 达到 MAX_TURNS 仍未收口 — 强制结束
  yield { type: 'text_delta', text: '\n\n_(JARVIS hit max turns; stopping.)_' }
}

/**
 * 非流式版本 — 测试用
 */
export async function runAgent(
  input: StreamAgentInput
): Promise<{ text: string }> {
  let text = ''
  for await (const ev of streamAgent(input)) {
    if (ev.type === 'text_delta') text += ev.text
  }
  return { text }
}

export { buildSystemPrompt }
