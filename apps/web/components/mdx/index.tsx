/**
 * MDX 组件导出 — 在 next-mdx-remote 渲染时统一注入
 *
 * 用法：
 *   import { mdxComponents } from '@/components/mdx'
 *   <MDXRemote source={mdx} components={mdxComponents} />
 *
 * 教学组件按用途分组：
 *   1. 老组件（基础展示）：Callout / Analogy / Code / TryThis / Feynman / 媒体嵌入
 *   2. 新教学组件（v0.5 — 基于神经学+认知学+教育学原理）：
 *      - HandsOnHook（具体先于抽象 · Bruner）
 *      - Misconception（误解预防 · Mazur）
 *      - MultiAnalogy（多重类比 · Gentner）
 *      - MentalModel（图式建构 · Ausubel）
 *      - WorkedExample（认知负荷 + 脚手架 · Sweller）
 *      - CrossLink（间隔重复 · Ebbinghaus）
 *      - PredictThenReveal（生成效应 · Roediger）
 *      - RecallBeat（提取练习 · Bjork）
 *      - ConceptCheck（ConcepTest · Mazur）
 *      - DeepDive（认知负荷分流）
 */

import { Callout } from './Callout'
import { Analogy } from './Analogy'
import { TryThis } from './TryThis'
import { FeynmanPrompt } from './FeynmanPrompt'
import { ConceptDiagram } from './ConceptDiagram'
import { VideoEmbed } from './VideoEmbed'
import { WokwiEmbed } from './WokwiEmbed'
import { HardwareList } from './HardwareList'
import { ProjectStats } from './ProjectStats'
import { PhaseTimeline } from './PhaseTimeline'
import { GraphReuseBadge } from './GraphReuseBadge'

// v0.5 教学组件 — 神经学+认知学+教育学原理
import { HandsOnHook } from './HandsOnHook'
import { Misconception } from './Misconception'
import { MultiAnalogy } from './MultiAnalogy'
import { MentalModel } from './MentalModel'
import { WorkedExample } from './WorkedExample'
import { CrossLink } from './CrossLink'
import { PredictThenReveal } from './PredictThenReveal'
import { RecallBeat } from './RecallBeat'
import { ConceptCheck } from './ConceptCheck'
import { DeepDive } from './DeepDive'

// v0.6 进阶交互组件 — 参考 Ciechanowski / Brilliant / Bret Victor
import { HighlightedTerm } from './HighlightedTerm'
import { LiveBlock, LiveParam, LiveDerived } from './LiveParameter'
import { AssemblyStepper } from './AssemblyStepper'
import { SideBySide } from './SideBySide'
import { WaterFlowInteractive } from './WaterFlowInteractive'

export {
  Callout,
  Analogy,
  TryThis,
  FeynmanPrompt,
  ConceptDiagram,
  VideoEmbed,
  WokwiEmbed,
  HardwareList,
  ProjectStats,
  PhaseTimeline,
  GraphReuseBadge,
  // v0.5 教学组件
  HandsOnHook,
  Misconception,
  MultiAnalogy,
  MentalModel,
  WorkedExample,
  CrossLink,
  PredictThenReveal,
  RecallBeat,
  ConceptCheck,
  DeepDive,
  // v0.6 进阶交互
  HighlightedTerm,
  LiveBlock,
  LiveParam,
  LiveDerived,
  AssemblyStepper,
  SideBySide,
  WaterFlowInteractive,
}

// 给 next-mdx-remote 用的组件 map
// MDX 里直接用短标签，不用 import
export const mdxComponents = {
  // 基础
  Callout,
  Analogy,
  TryThis,
  FeynmanPrompt,
  ConceptDiagram,
  VideoEmbed,
  Wokwi: WokwiEmbed,
  WokwiEmbed,
  HardwareList,
  ProjectStats,
  PhaseTimeline,
  GraphReuseBadge,
  // v0.5 教学组件
  HandsOnHook,
  Misconception,
  MultiAnalogy,
  MentalModel,
  WorkedExample,
  CrossLink,
  PredictThenReveal,
  RecallBeat,
  ConceptCheck,
  DeepDive,
  // v0.6 进阶交互
  HighlightedTerm,
  Term: HighlightedTerm, // 短别名
  LiveBlock,
  LiveParam,
  LiveDerived,
  AssemblyStepper,
  SideBySide,
  WaterFlowInteractive,
  WaterFlow: WaterFlowInteractive, // 短别名
}
