'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface QuizQuestion {
  q: string
  options: string[]
  correct: number
  explain: string
}

interface TryThisProps {
  type: 'quiz' | 'code' | 'hardware'
  questions?: QuizQuestion[]
  prompt?: string
}

export function TryThis(props: TryThisProps) {
  if (props.type === 'quiz' && props.questions) {
    return <QuizComponent questions={props.questions} />
  }

  return (
    <div className="forge-card p-4 my-4 border-forge-warning/30">
      <p className="text-xs text-forge-warning font-mono">
        TryThis type "{props.type}" — v0.4 上线
      </p>
    </div>
  )
}

function QuizComponent({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})

  return (
    <div className="forge-card p-5 my-4">
      <h4 className="text-xs font-mono text-forge-fg-subtle uppercase tracking-wider mb-4">
        Try · 验证
      </h4>
      <ol className="space-y-6">
        {questions.map((q, qi) => (
          <li key={qi}>
            <p className="text-sm font-medium mb-3">
              <span className="text-forge-fg-subtle font-mono mr-2">Q{qi + 1}.</span>
              {q.q}
            </p>
            <div className="space-y-1">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi
                const showFeedback = answers[qi] !== undefined
                const isCorrect = oi === q.correct
                return (
                  <button
                    key={oi}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={cn(
                      'block w-full text-left px-3 py-2 rounded-md text-sm border transition-colors',
                      !showFeedback &&
                        'border-forge-border hover:border-forge-fg-subtle/40',
                      showFeedback &&
                        selected &&
                        isCorrect &&
                        'border-forge-success bg-forge-success/10 text-forge-success',
                      showFeedback &&
                        selected &&
                        !isCorrect &&
                        'border-forge-danger bg-forge-danger/10 text-forge-danger',
                      showFeedback &&
                        !selected &&
                        isCorrect &&
                        'border-forge-success/40 bg-forge-success/5'
                    )}
                  >
                    <span className="font-mono text-xs mr-2 text-forge-fg-subtle">
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>
            {answers[qi] !== undefined && (
              <p className="text-xs text-forge-fg-muted mt-2 leading-relaxed">
                {q.explain}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
