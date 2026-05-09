/**
 * JARVIS Agent — Anthropic Claude API + 流式响应
 *
 * v0.3: 纯文本对话（无 tool calling）。Server-side only — 必须从 server route 调用。
 * v0.3.1+: 加入 tool use 循环（recommend_next_node / search_docs / parse_error 等）
 */

import Anthropic from '@anthropic-ai/sdk'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { ProxyAgent, setGlobalDispatcher } from 'undici'
import type { JarvisContext, JarvisMessage } from './types'
import { buildSystemPrompt } from './prompts/system'

const FALLBACK_MODEL = 'claude-haiku-4-5-20251001'
const DEFAULT_MAX_TOKENS = 2048

// 模型选择优先级：input 显式 > env var > fallback
function resolveModel(input?: string): string {
  return input ?? process.env.ANTHROPIC_MODEL ?? FALLBACK_MODEL
}

/**
 * 让 Node 22 的全局 fetch（Anthropic SDK 用的）走 HTTPS_PROXY
 *
 * Node 22 fetch 默认 *不* 读 HTTPS_PROXY env var。需要显式装 undici ProxyAgent。
 * 国内开发者的 Mac 经常挂 ClashX/Surge/Mihomo 代理，否则连不上 Anthropic。
 *
 * 一次性 idempotent — 模块第一次加载时配一次，之后所有 fetch 都走代理。
 */
let proxyConfigured = false
function ensureProxyDispatcher(): void {
  if (proxyConfigured) return
  const proxyUrl =
    process.env.HTTPS_PROXY ??
    process.env.https_proxy ??
    process.env.HTTP_PROXY ??
    process.env.http_proxy
  // eslint-disable-next-line no-console
  console.log(
    `[forge/ai] Proxy check — HTTPS_PROXY=${process.env.HTTPS_PROXY ?? '<empty>'} https_proxy=${process.env.https_proxy ?? '<empty>'} resolved=${proxyUrl ?? '<NONE>'}`
  )
  if (proxyUrl) {
    try {
      setGlobalDispatcher(new ProxyAgent(proxyUrl))
      // eslint-disable-next-line no-console
      console.log(`[forge/ai] ✓ Installed ProxyAgent → ${proxyUrl}`)
    } catch (err) {
      console.error('[forge/ai] ✗ Failed to install ProxyAgent:', err)
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      '[forge/ai] ⚠ No proxy env var found. If you are in CN, set HTTPS_PROXY in apps/web/.env.local'
    )
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
}

/**
 * 流式调用 Claude，逐 token yield 文字
 *
 * 用法：
 *   for await (const delta of streamAgent({ apiKey, context, messages })) {
 *     console.log(delta)
 *   }
 */
export async function* streamAgent(input: StreamAgentInput): AsyncIterable<string> {
  // 第一次调用时把全局 dispatcher 切到 ProxyAgent（其他 fetch 也受益，比如 Turso）
  ensureProxyDispatcher()

  // ★ Anthropic SDK 的关键：webpack-bundled undici 跟 Node 内置 undici 是两个实例，
  // setGlobalDispatcher 只影响前者。SDK 内部 fetch 走的可能是 Node 的内置 undici，
  // 所以必须显式给 SDK 喂 httpAgent（标准 Node http.Agent，跟 fetch 实现无关）。
  const proxyUrl =
    process.env.HTTPS_PROXY ??
    process.env.https_proxy ??
    process.env.HTTP_PROXY ??
    process.env.http_proxy
  const httpAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined
  if (httpAgent) {
    // eslint-disable-next-line no-console
    console.log(`[forge/ai] Anthropic SDK httpAgent → ${proxyUrl}`)
  }

  // 可选：自定义 baseURL（CF Worker 反代等）— 通常用 HTTPS_PROXY 即可，不用这个
  const baseURL = process.env.ANTHROPIC_BASE_URL
  const client = new Anthropic({
    apiKey: input.apiKey,
    ...(baseURL ? { baseURL } : {}),
    ...(httpAgent ? { httpAgent } : {}),
  })
  const systemPrompt = buildSystemPrompt(input.context)

  // 把 JarvisMessage 转成 Anthropic 期望的格式
  const anthropicMessages = input.messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => {
      const content = m.content
      if (content.type === 'text') {
        return {
          role: m.role as 'user' | 'assistant',
          content: content.text,
        }
      }
      // tool_use / tool_result — v0.3.1 才用
      return {
        role: m.role as 'user' | 'assistant',
        content: '',
      }
    })

  const stream = await client.messages.create({
    model: resolveModel(input.model),
    max_tokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
    system: systemPrompt,
    messages: anthropicMessages,
    stream: true,
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
}

/**
 * 非流式版本（一次拿完整回答）— 测试用
 */
export async function runAgent(
  input: StreamAgentInput
): Promise<{ text: string }> {
  let text = ''
  for await (const delta of streamAgent(input)) {
    text += delta
  }
  return { text }
}

export { buildSystemPrompt }
