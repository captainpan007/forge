/**
 * HandsOnHook — 节点开场的"具体场景钩子"
 *
 * 教学原理：Concrete-First / Bruner enactive→iconic→symbolic
 *
 * 让读者先进入一个具体的、可想象的失败/成就场景，再讲抽象概念。
 * 抽象先于具体 = 灾难。具体先于抽象 = 大脑准备好接收概念。
 *
 * 用法：
 *   <HandsOnHook>
 *     你刚把 LED 接到 Pi 上 — 灯没亮，反而有焦味。问题在哪？...
 *   </HandsOnHook>
 */

interface HandsOnHookProps {
  children: React.ReactNode
  /** 可选：场景的"题眼" — 在卡片顶部显示 */
  scene?: string
}

export function HandsOnHook({ children, scene }: HandsOnHookProps) {
  return (
    <div className="my-6 forge-card overflow-hidden border-l-2 border-forge-accent">
      <div className="bg-forge-bg-elevated px-4 py-2 border-b border-forge-border-subtle">
        <span className="text-[0.7rem] font-mono text-forge-fg-subtle uppercase tracking-wider">
          📍 场景{scene ? ` · ${scene}` : ''}
        </span>
      </div>
      <div className="px-5 py-4 text-[0.95rem] leading-relaxed italic text-forge-fg-muted">
        {children}
      </div>
    </div>
  )
}
