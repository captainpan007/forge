'use client'

// React 18: useFormState + useFormStatus live in react-dom
// (renamed to useActionState / built-in pending in React 19)
import { useFormState, useFormStatus } from 'react-dom'
import { cn } from '@/lib/utils'
import {
  updateJarvisIdentity,
  updateAnthropicApiKey,
  type ActionResult,
} from './actions'

/**
 * 客户端 form — 用 useFormState (React 18) 包装 server actions
 * pending 状态由 <SubmitButton> 内部的 useFormStatus 读取
 * 每个 form 自己显示 ok/error feedback
 */

interface JarvisFormProps {
  initialName: string
  initialAddress: string
}

export function JarvisIdentityForm({
  initialName,
  initialAddress,
}: JarvisFormProps) {
  const [state, formAction] = useFormState<ActionResult | null, FormData>(
    updateJarvisIdentity,
    null
  )

  return (
    <form action={formAction} className="space-y-3">
      <Field
        label="名字"
        hint="JARVIS 的称号 — 可改成 ATLAS / FORGE / 老工 等"
      >
        <input
          type="text"
          name="jarvisName"
          defaultValue={initialName}
          maxLength={20}
          className="forge-input"
          required
        />
      </Field>

      <Field
        label="对您的称呼"
        hint='Sir / Captain / 老板 / 名字本身'
      >
        <input
          type="text"
          name="jarvisAddress"
          defaultValue={initialAddress}
          maxLength={20}
          className="forge-input"
          required
        />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton>保存</SubmitButton>
        {state && <FeedbackText result={state} />}
      </div>
    </form>
  )
}

interface ApiKeyFormProps {
  hasKey: boolean
}

export function ApiKeyForm({ hasKey }: ApiKeyFormProps) {
  const [state, formAction] = useFormState<ActionResult | null, FormData>(
    updateAnthropicApiKey,
    null
  )

  return (
    <form action={formAction} className="space-y-3">
      <Field
        label="Anthropic API Key (BYOK)"
        hint={
          hasKey
            ? '已设置 — 输入新值替换，或留空清除'
            : '未设置 — 留空使用服务器默认 key（如配置了的话）'
        }
      >
        <input
          type="password"
          name="anthropicApiKey"
          placeholder={hasKey ? '••••••••••••••••' : 'sk-ant-...'}
          autoComplete="off"
          className="forge-input font-mono text-xs"
        />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton>保存</SubmitButton>
        {state && <FeedbackText result={state} />}
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────
// 子组件
// ─────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block forge-section-label mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[0.7rem] text-forge-fg-subtle mt-1.5">{hint}</span>}
    </label>
  )
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  // useFormStatus() must be called inside a child of <form> — that's why this
  // is a separate component. It reads the form's pending state from context.
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'px-4 py-2 text-sm bg-forge-accent text-forge-bg',
        'hover:bg-forge-accent-hover transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed'
      )}
    >
      {pending ? '保存中…' : children}
    </button>
  )
}

function FeedbackText({ result }: { result: ActionResult }) {
  return (
    <span
      className={cn(
        'text-xs font-mono',
        result.ok ? 'text-forge-success' : 'text-forge-danger'
      )}
    >
      {result.ok ? '✓' : '⚠'} {result.message}
    </span>
  )
}
