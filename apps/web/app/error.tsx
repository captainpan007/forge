'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[forge] Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-mono text-forge-danger mb-2">ERROR</p>
        <h1 className="text-2xl font-semibold mb-3">出错了</h1>
        <p className="text-forge-fg-muted mb-6 text-sm">
          {error.message ?? '未知错误'}
          {error.digest && (
            <span className="block mt-2 text-xs font-mono opacity-60">
              digest: {error.digest}
            </span>
          )}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-md bg-forge-accent text-white hover:bg-forge-accent-hover transition-colors text-sm"
        >
          重试
        </button>
      </div>
    </div>
  )
}
