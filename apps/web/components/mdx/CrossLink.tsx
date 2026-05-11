/**
 * CrossLink — 显式跨节点引用（Spaced Repetition）
 *
 * 教学原理：Ebbinghaus 遗忘曲线 + 间隔重复 — 同一概念在不同上下文
 * 反复出现，能极大延长记忆。MDX 里写到一个相关概念时显式 link 回去。
 *
 * 用法：
 *   <CrossLink to="n04" relation="还记得">
 *     电压必须有"地"做参考点
 *   </CrossLink>
 *
 *   <CrossLink to="n21" relation="后面会展开">
 *     按钮的下拉电阻接法
 *   </CrossLink>
 */

import Link from 'next/link'

interface CrossLinkProps {
  /** 目标节点 ID（如 "n04"） */
  to: string
  /** 可选：项目 slug — 不传默认 soundbox */
  project?: string
  /** 关系措辞（"还记得" / "后面会展开" / "对照" 等） */
  relation?: string
  children: React.ReactNode
}

export function CrossLink({
  to,
  project = 'soundbox',
  relation = '相关',
  children,
}: CrossLinkProps) {
  return (
    <Link
      href={`/projects/${project}/nodes/${to}`}
      className="inline-flex items-baseline gap-1.5 px-1.5 py-0.5 mx-0.5 border border-forge-accent/30 bg-forge-accent/5 hover:bg-forge-accent/15 hover:border-forge-accent/60 transition-colors text-sm align-baseline"
      title={`跳到 ${to.toUpperCase()}`}
    >
      <span className="text-[0.65rem] font-mono text-forge-accent uppercase tracking-wider shrink-0">
        {relation} {to.toUpperCase()}
      </span>
      <span className="text-forge-fg">{children}</span>
      <span className="text-forge-fg-subtle text-xs">↗</span>
    </Link>
  )
}
