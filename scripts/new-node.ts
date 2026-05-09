#!/usr/bin/env tsx
/**
 * 生成一个新节点的 MDX 骨架
 *
 * 用法：
 *   pnpm new-node n33 my-new-topic
 */

import { writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const [, , id, slug] = process.argv

if (!id || !slug) {
  console.error('Usage: pnpm new-node <id> <slug>')
  console.error('Example: pnpm new-node n33 my-new-topic')
  process.exit(1)
}

if (!/^n\d+$/.test(id)) {
  console.error(`Invalid id: ${id} (expected format: n01, n02, ...)`)
  process.exit(1)
}

if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
  console.error(`Invalid slug: ${slug} (lowercase, alphanumeric, dashes only)`)
  process.exit(1)
}

const filename = `${id}-${slug}.mdx`
const filepath = join(process.cwd(), 'content', 'nodes', filename)

if (existsSync(filepath)) {
  console.error(`File already exists: ${filepath}`)
  process.exit(1)
}

const today = new Date().toISOString().slice(0, 10)

const skeleton = `---
id: ${id}
slug: ${slug}
title: TODO
phase: TODO
phase_name: TODO
project: TODO
order: TODO
duration: TODO
difficulty: TODO
depends_on: []
unlocks: []
tags: []
status: draft
authors:
  - alexpan
last_updated: ${today}
---

import { Callout } from '@/components/mdx/Callout'
import { Analogy } from '@/components/mdx/Analogy'
import { TryThis } from '@/components/mdx/TryThis'
import { FeynmanPrompt } from '@/components/mdx/FeynmanPrompt'

## Why · 你为什么要学这一节

TODO: 1-3 段，连到当前项目，说清"做完你的项目需要这一节"。

<Callout type="tip" icon="🎯">
  **学完这一节你能做到：** TODO
</Callout>

## What · 核心内容

### 一句话定义

TODO

### 用人话翻译

<Analogy
  pairs={[
    { tech: 'TODO 技术概念', life: 'TODO 生活类比' },
  ]}
/>

TODO

## Try · 动手验证

<TryThis
  type="quiz"
  questions={[
    {
      q: 'TODO',
      options: ['A', 'B', 'C', 'D'],
      correct: 0,
      explain: 'TODO',
    },
  ]}
/>

## Feynman · 教给你 26 个月的儿子

<FeynmanPrompt
  prompt="TODO: 请用最简单的话解释..."
  scoringRubric={[
    '✓ TODO 加分项',
    '✗ TODO 减分项',
  ]}
  followUps={[
    {
      question: 'TODO 3 岁孩子的反问 1',
      hint: '考点：TODO',
    },
    {
      question: 'TODO 3 岁孩子的反问 2',
      hint: '考点：TODO',
    },
    {
      question: 'TODO 3 岁孩子的反问 3',
      hint: '考点：TODO',
    },
  ]}
/>

## 完成后

✅ Feynman 通过 → 自动解锁 **TODO 下一节**
`

writeFileSync(filepath, skeleton, 'utf-8')
console.log(`✓ Created ${filepath}`)
console.log(`  Now: 1) Fill in frontmatter`)
console.log(`       2) Add to content/knowledge-graph.yaml`)
console.log(`       3) Run pnpm validate-graph`)
