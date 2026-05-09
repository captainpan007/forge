# 内容写作指南

> 教你怎么写一个 forge 风格的知识节点。**Reference: `content/nodes/n05-gpio-basics.mdx`**

## 核心原则

1. **每个节点 10-25 分钟读完 + 做完**——超过这个时长就拆成两节
2. **必须有项目上下文**——开头永远说"为什么这一节存在 / 你的项目需要它做什么"
3. **类比比定义重要**——成年人靠类比建立心智模型；术语堆叠会让人放弃
4. **Feynman 是关卡门**——不是装饰；写 Feynman 时**实际想象一个 3 岁孩子会问什么**
5. **MDX 组件 > 纯文字**——能用 `<Callout>` / `<Analogy>` / `<ConceptDiagram>` 就用

## 文件命名

```
content/nodes/n[NN]-[slug].mdx
```

例：
- `n05-gpio-basics.mdx`
- `n16-gpiozero-first.mdx`
- `n24-wire-button-to-pi.mdx`

`NN` 必须跟 `knowledge-graph.yaml` 里的 `id` 一致；`slug` 必须跟 `slug` 一致。

## Frontmatter（必填）

```yaml
---
id: n05                          # 唯一 ID，对应 knowledge-graph.yaml
slug: gpio-basics                # URL slug，对应 knowledge-graph.yaml
title: GPIO 是什么                # 中文标题
phase: 1                         # 阶段编号
phase_name: 心智模型              # 阶段中文名
project: soundbox                # 所属项目 slug
order: 5                         # 项目内顺序
duration: 10                     # 预计分钟数
difficulty: 2                    # 1-5
depends_on: [n01, n04]           # 前置节点 ID 列表
unlocks: [n06, n16, n17, n21]    # 完成后解锁的节点 ID 列表
tags: [hardware, electronics]
status: ready                    # draft | review | ready
authors:
  - alexpan
last_updated: 2026-05-09
---
```

`scripts/validate-graph.ts` 会自动检查 frontmatter 跟 `knowledge-graph.yaml` 的一致性。

## 内容结构（强制 4 段）

每个节点 MDX 必须按以下顺序 4 段：

### 1. Why（为什么学这一节）

- 1-3 段
- 必须连到**当前项目**——"你的发声盒需要..."
- 列出这一节解锁了什么后续节点
- 用 `<Callout type="tip" icon="🎯">` 标出"学完你能做到"

### 2. What（核心内容）

- 这是节点的主体，70% 篇幅
- 推荐子结构：
  - 一句话定义
  - 用人话翻译（生活类比）
  - 关键事实（用表格）
  - 代码或图（如果适用）
  - 一张图看懂（用 `<ConceptDiagram>`）
  - 视频补充（可选，用 `<VideoEmbed>`）
- 任何危险点用 `<Callout type="warning" icon="⚠">` 标出

### 3. Try（动手验证）

- 必须有，不能省
- 三种类型：
  - **Quiz**：`<TryThis type="quiz" questions={[...]} />`
  - **Code**：用 Monaco 编辑器，运行 + 看输出
  - **Hardware**：拍照上传 + JARVIS 视觉评判
  - **Simulator**：嵌入 Wokwi
- 至少 2-3 题或 1 个动手任务

### 4. Feynman（教给孩子）

- 必须有，是通关条件
- 包含三部分：
  - **Prompt**：让用户解释什么概念（具体到一句话）
  - **Scoring Rubric**：JARVIS 评判用的标准（明确的"加分项 + 必须项 + 减分项"）
  - **Follow-ups**：3 个 3 岁孩子会问的反问，每个标 hint（考点）

## MDX 组件清单

下列组件已实现，写节点时直接用：

| 组件 | 用途 |
|---|---|
| `<Callout type="info\|warning\|tip\|danger">` | 突出说明 |
| `<Analogy pairs={[{tech, life}]} />` | 技术概念 vs 生活类比对照 |
| `<ConceptDiagram src caption />` | 概念图（SVG） |
| `<VideoEmbed src title duration language />` | 嵌入视频 |
| `<TryThis type="quiz\|code\|hardware" />` | 动手验证 |
| `<FeynmanPrompt prompt rubric followUps />` | 费曼工坊 |
| `<CodeBlock lang>...</CodeBlock>` | 代码块（带 copy / run） |
| `<HardwareList items />` | 硬件清单（项目 MDX 用） |

⚠ **不要在 MDX 里写 `import` 语句** — `next-mdx-remote` 不解析 imports。组件由 `apps/web/components/mdx/index.tsx` 的 `mdxComponents` map 自动注入到所有 MDX 渲染上下文。直接用 `<Callout>...</Callout>` 即可。如果一个组件没出现在 mdxComponents 里就用了，会变成 unknown HTML 元素（看着像普通 div）。需要新组件 → 先在 `components/mdx/` 加，再 export 到 `index.tsx` 的 `mdxComponents`。

## 文风

- **用"你"，不用"读者"或"我们"**
- **第二人称 + 现在时**
- **JARVIS 的 quote 用 markdown 引用 + 斜体**
- **避免"很简单"、"显然"、"只需要"**——这些词在新手听来像"你怎么这都不会"
- **避免英文术语堆砌**：必须用英文术语时，给中文翻译

## 代码风格

- 代码示例必须**能直接复制粘贴跑**——没有省略号 `...`
- 注释要解释"为什么"，不是"什么"
- 用 4 空格缩进
- 中文注释 OK

## 图片资产

- 放 `apps/web/public/diagrams/` 下
- 命名：`[node-slug]-[topic].svg`
- 优先 SVG（可缩放、文件小、对暗色模式友好）
- 真有照片必要的（PCB / 接线照片）用 WebP，宽度 ≥1200px

## 写作流程建议

1. 在 `knowledge-graph.yaml` 加节点元数据
2. 跑 `pnpm new-node n05 gpio-basics` 自动生成 MDX 骨架
3. 先写 Why（3 行）+ Feynman 的 follow-ups（这强制你想清楚"真懂的人会怎么解释"）
4. 再回头写 What
5. 最后写 Try
6. 自检：用 5 分钟读自己写的，问自己"如果我是 39 岁零基础家长，这一段我懂吗？"
7. 跑 `pnpm validate-graph` 检查一致性
8. 提 PR

## 节点 review 标准

PR 会在这些维度被打分：

- ✅ **结构完整**：Why / What / Try / Feynman 四段都有
- ✅ **类比到位**：至少一个生活类比
- ✅ **可验证**：Try 部分能真的做
- ✅ **Feynman 严谨**：3 个反问真能考住没真懂的人
- ✅ **依赖正确**：`depends_on` 准确，没漏没多
- ✅ **不超时**：实测 ≤ 标称的 1.3 倍

## 一个最小可读的样本

参考 [`content/nodes/n05-gpio-basics.mdx`](../content/nodes/n05-gpio-basics.mdx)。这是 forge 的"内容样板"——所有后续节点照这个格式写。
