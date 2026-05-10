'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { updateUserSettings } from '@/lib/db/queries'

/**
 * Server action — 更新 JARVIS 名字 / 称呼
 * 在表单 action={...} 里直接绑定
 */

const jarvisSchema = z.object({
  jarvisName: z.string().min(1).max(20),
  jarvisAddress: z.string().min(1).max(20),
})

export interface ActionResult {
  ok: boolean
  message?: string
}

export async function updateJarvisIdentity(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const { user } = await requireUser()

  const parsed = jarvisSchema.safeParse({
    jarvisName: (formData.get('jarvisName') ?? '').toString().trim(),
    jarvisAddress: (formData.get('jarvisAddress') ?? '').toString().trim(),
  })

  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return {
      ok: false,
      message: first ? `${first.path.join('.')}: ${first.message}` : '校验失败',
    }
  }

  try {
    await updateUserSettings(user.id, parsed.data)
    revalidatePath('/settings')
    revalidatePath('/dashboard')
    return { ok: true, message: '已保存' }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : '保存失败',
    }
  }
}

/**
 * 更新 Anthropic API key（BYOK）— 可选
 * v0.4 计划 AES-256 加密存储；v0.3.7 暂时明文存（user 自己的 DB，自己用）
 */
const apiKeySchema = z.object({
  anthropicApiKey: z.string().regex(/^sk-ant-/, 'must start with sk-ant-').or(z.literal('')),
})

export async function updateAnthropicApiKey(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const { user } = await requireUser()

  const parsed = apiKeySchema.safeParse({
    anthropicApiKey: (formData.get('anthropicApiKey') ?? '').toString().trim(),
  })

  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return {
      ok: false,
      message: first?.message ?? 'Invalid API key',
    }
  }

  try {
    await updateUserSettings(user.id, {
      anthropicApiKey: parsed.data.anthropicApiKey || null,
    })
    revalidatePath('/settings')
    return {
      ok: true,
      message: parsed.data.anthropicApiKey ? '已保存' : '已清除',
    }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : '保存失败',
    }
  }
}
