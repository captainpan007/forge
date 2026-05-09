interface FeynmanPromptProps {
  prompt: string
  scoringRubric: string[]
  followUps: { question: string; hint: string }[]
}

export function FeynmanPrompt({ prompt, scoringRubric, followUps }: FeynmanPromptProps) {
  return (
    <div className="forge-card p-5 my-4 border-forge-accent/30">
      <h4 className="text-xs font-mono text-forge-accent uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>🔒</span>
        <span>Feynman · 通关条件</span>
      </h4>

      <div className="space-y-4 text-sm">
        <div>
          <p className="text-forge-fg-muted mb-2">
            <span className="text-forge-fg font-medium">📢 提问：</span>
          </p>
          <blockquote className="border-l-2 border-forge-accent pl-3 italic text-forge-fg">
            {prompt}
          </blockquote>
        </div>

        <div>
          <p className="text-forge-fg-muted mb-2">
            <span className="text-forge-fg font-medium">📋 评分标准：</span>
          </p>
          <ul className="space-y-1 text-xs font-mono text-forge-fg-muted">
            {scoringRubric.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-forge-fg-muted mb-2">
            <span className="text-forge-fg font-medium">🤔 3 个反问（要求全部通过）：</span>
          </p>
          <ol className="space-y-2">
            {followUps.map((f, i) => (
              <li key={i} className="text-sm">
                <p className="text-forge-fg">
                  <span className="font-mono text-forge-fg-subtle mr-2">Q{i + 1}.</span>
                  {f.question}
                </p>
                <p className="text-xs text-forge-fg-subtle font-mono ml-6 mt-0.5">
                  考点：{f.hint}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="pt-3 border-t border-forge-border-subtle">
          <p className="text-xs text-forge-fg-subtle italic">
            v0.5 上线后这里会出现录音/打字按钮，提交给 JARVIS 评判。
          </p>
        </div>
      </div>
    </div>
  )
}
