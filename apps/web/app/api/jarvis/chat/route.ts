import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { streamAgent } from '@forge/ai'
import type { JarvisMessage } from '@forge/ai'
import { jarvisToolExecutor } from '@/lib/jarvis-tools'

/**
 * JARVIS 对话端点 — SSE 流式 + Tool Calling
 *
 * POST { messages: JarvisMessage[], projectSlug?, nodeId? }
 * → text/event-stream
 *   data: {"type":"text_delta","text":"..."}
 *   data: {"type":"tool_use_start","name":"..."}
 *   data: {"type":"tool_use_end","name":"...","result":{...}}
 *   data: {"type":"turn_end"}
 *   ...
 *   data: [DONE]
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'tool']),
        content: z.union([
          z.object({ type: z.literal('text'), text: z.string() }),
          z.object({
            type: z.literal('tool_use'),
            id: z.string(),
            name: z.string(),
            input: z.unknown(),
          }),
          z.object({
            type: z.literal('tool_result'),
            tool_use_id: z.string(),
            content: z.unknown(),
            is_error: z.boolean().optional(),
          }),
        ]),
      })
    )
    .min(1),
  projectSlug: z.string().optional(),
  nodeId: z.string().optional(),
})

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY not set on server. v0.4 will support BYOK from /settings.' },
      { status: 500 }
    )
  }

  const { messages, projectSlug, nodeId } = parsed.data
  const jarvisMessages = messages as JarvisMessage[]

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        )
      }

      try {
        for await (const ev of streamAgent({
          apiKey,
          context: {
            userId,
            jarvisName: 'JARVIS',
            jarvisAddress: 'Sir',
            mode: 'workshop',
            currentProjectSlug: projectSlug,
            currentNodeId: nodeId,
          },
          messages: jarvisMessages,
          toolExecutor: jarvisToolExecutor,
        })) {
          send(ev)
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[jarvis/chat] streaming error:', err)
        let userFacingError = errorMsg
        if (errorMsg.includes('403') || errorMsg.toLowerCase().includes('forbidden')) {
          const model = process.env.ANTHROPIC_MODEL ?? 'haiku-4-5'
          userFacingError = `${errorMsg}\n\n常见原因：(1) 中国大陆 IP 直连 Anthropic API 被拦截 — 配 HTTPS_PROXY 走本地代理；(2) API key 无效；(3) 账号未启用 ${model} 访问权限。`
        } else if (errorMsg.includes('401')) {
          userFacingError = `${errorMsg}\n\nAPI key 无效或过期，去 https://console.anthropic.com/settings/keys 检查。`
        }
        send({ type: 'error', error: userFacingError })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
