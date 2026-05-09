/**
 * MDX 组件导出 — 在 next-mdx-remote 渲染时统一注入
 *
 * 用法：
 *   import { mdxComponents } from '@/components/mdx'
 *   <MDXRemote source={mdx} components={mdxComponents} />
 */

import { Callout } from './Callout'
import { Analogy } from './Analogy'
import { TryThis } from './TryThis'
import { FeynmanPrompt } from './FeynmanPrompt'
import { ConceptDiagram } from './ConceptDiagram'
import { VideoEmbed } from './VideoEmbed'
import { HardwareList } from './HardwareList'
import { ProjectStats } from './ProjectStats'
import { PhaseTimeline } from './PhaseTimeline'
import { GraphReuseBadge } from './GraphReuseBadge'

export {
  Callout,
  Analogy,
  TryThis,
  FeynmanPrompt,
  ConceptDiagram,
  VideoEmbed,
  HardwareList,
  ProjectStats,
  PhaseTimeline,
  GraphReuseBadge,
}

// 给 next-mdx-remote 用的组件 map
export const mdxComponents = {
  Callout,
  Analogy,
  TryThis,
  FeynmanPrompt,
  ConceptDiagram,
  VideoEmbed,
  HardwareList,
  ProjectStats,
  PhaseTimeline,
  GraphReuseBadge,
}
