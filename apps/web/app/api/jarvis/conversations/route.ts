import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import {
  getOrCreateConversation,
  getConversationMessages,
} from '@/lib/db/queries'
import type { MessageContent } from '@/lib/db/schema'

/**
 * GET /api/jarvis/conversations?projectSlug=X&nodeId=Y
 *
 * 返回当前 (user, project, node) context 下的最新对话历史
 * 用于 JarvisPanel mount 时恢复历史
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const querySchema = z.object({
  projectSlug: z.string().optional(),
  nodeId: z.string().optional(),
})

interface SerializedMessage {
  id: string
  role: 'user' | 'assistant' | 'tool'
  /** 简化版：把所有 text content 拼成一个字符串，方便前端 ChatMessage 直接消费 */
  text: string
  createdAt: number
}

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const parsed = querySchema.safeParse({
    projectSlug: url.searchParams.get('projectSlug') ?? undefined,
    nodeId: url.searchParams.get('nodeId') ?? undefined,
  })
  if (!parsed.success) {
    return Response.json({ error: 'Invalid query' }, { status: 400 })
  }

  try {
    const conv = await getOrCreateConversation(
      userId,
      parsed.data.projectSlug,
      parsed.data.nodeId
    )
    const rawMessages = await getConversationMessages(conv.id)

    // 简化为前端 ChatMessage 格式（拼接所有 text block）
    const messages: SerializedMessage[] = rawMessages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => {
        const blocks = (m.content ?? []) as MessageContent[]
        const text = blocks
          .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
          .map((b) => b.text)
          .join('')
        return {
          id: m.id,
          role: m.role as 'user' | 'assistant',
          text,
          createdAt: m.createdAt,
        }
      })
      .filter((m) => m.text.length > 0)

    return Response.json({ conversationId: conv.id, messages })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[jarvis/conversations] error:', err)
    return Response.json({ error: msg }, { status: 500 })
  }
}
