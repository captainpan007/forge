import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

/**
 * JARVIS 对话端点 — v0.3 上线
 *
 * v0.x stub: 验证认证可用，返回占位消息
 * v0.3: 接 Anthropic Claude API + tool calling，SSE streaming
 *
 * 完整实现预览：
 *   1. 验证 user
 *   2. 加载 conversation context (current node, project, history)
 *   3. 加载 user 的 anthropic_api_key (from db, decrypted)
 *   4. 调 packages/ai 的 agent 跑 tool calling 循环
 *   5. SSE stream 给前端
 */
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))

  return NextResponse.json({
    status: 'stub',
    message:
      'JARVIS chat endpoint active. Real Claude integration ships in v0.3 — see packages/ai/agent.ts',
    received: body,
  })
}
