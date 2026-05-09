export const metadata = {
  title: 'Journal',
}

export default function JournalPage() {
  return (
    <div className="forge-container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Learning Journal</h1>
        <p className="text-sm text-forge-fg-muted">
          每天 5 分钟，记录今天学了啥、卡在哪、什么让我开心 / 不爽。
        </p>
      </div>

      <div className="forge-card p-8 text-center">
        <p className="text-sm font-mono text-forge-fg-subtle mb-2">v0.5</p>
        <p className="text-sm text-forge-fg-muted">
          Journal 编辑器将在 Phase 2 完成后上线。
        </p>
      </div>
    </div>
  )
}
