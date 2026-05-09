import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { streamAgent } from '@forge/ai'
import type { JarvisMessage } from '@forge/ai'

/**
 * JARVIS 对话端点 — SSE 流式
 *
 * POST { messages: JarvisMessage[], projectSlug?, nodeId? }
 * → text/event-stream
 *   data: {"delta":"..."}
 *   data: {"delta":"..."}
 *   ...
 *   data: [DONE]
 *
 * v0.3: 无 tool calling — 纯对话
 * v0.3.1+: 加 tool use 循环
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // Anthropic SDK 用 Node API

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
      try {
        for await (const delta of streamAgent({
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
        })) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
          )
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[jarvis/chat] streaming error:', err)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`)
        )
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
      'X-Accel-Buffering': 'no', // 禁用 nginx 缓冲
    },
  })
}
