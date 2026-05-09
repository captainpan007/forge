#!/usr/bin/env tsx
/**
 * 检查 content/knowledge-graph.yaml 的内部一致性 + 与 MDX 文件的一致性
 *
 * 检查项：
 * 1. 所有节点 ID 唯一
 * 2. 所有 slug 唯一
 * 3. depends_on 引用的节点都存在
 * 4. unlocks 跟反向 depends_on 一致
 * 5. 没有循环依赖
 * 6. 每个节点有对应的 MDX 文件
 * 7. MDX frontmatter 与 yaml 一致
 *
 * 用法：pnpm validate-graph
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'

const CONTENT_DIR = join(process.cwd(), 'content')
const GRAPH_PATH = join(CONTENT_DIR, 'knowledge-graph.yaml')
const NODES_DIR = join(CONTENT_DIR, 'nodes')

interface Node {
  id: string
  slug: string
  title: string
  phase: number
  project: string
  depends_on: string[]
  unlocks: string[]
}

const errors: string[] = []
const warnings: string[] = []

function fail(msg: string): void {
  errors.push(msg)
}

function warn(msg: string): void {
  warnings.push(msg)
}

function main(): void {
  if (!existsSync(GRAPH_PATH)) {
    fail(`Graph file not found: ${GRAPH_PATH}`)
    return
  }

  const raw = readFileSync(GRAPH_PATH, 'utf-8')
  const data = parse(raw) as { nodes: Node[]; projects: Record<string, unknown> }

  if (!data.nodes || !Array.isArray(data.nodes)) {
    fail('knowledge-graph.yaml: missing `nodes` array')
    return
  }

  const nodeMap = new Map<string, Node>()
  const slugSet = new Set<string>()

  // 检查 1+2: ID 和 slug 唯一
  for (const node of data.nodes) {
    if (nodeMap.has(node.id)) {
      fail(`Duplicate node ID: ${node.id}`)
    }
    if (slugSet.has(node.slug)) {
      fail(`Duplicate slug: ${node.slug}`)
    }
    nodeMap.set(node.id, node)
    slugSet.add(node.slug)
  }

  // 检查 3: depends_on 引用都存在
  for (const node of data.nodes) {
    for (const dep of node.depends_on || []) {
      if (!nodeMap.has(dep)) {
        fail(`${node.id} depends_on missing node: ${dep}`)
      }
    }
  }

  // 检查 4: unlocks 跟反向 depends_on 一致
  for (const node of data.nodes) {
    for (const unlocked of node.unlocks || []) {
      const target = nodeMap.get(unlocked)
      if (!target) continue
      if (!(target.depends_on || []).includes(node.id)) {
        warn(`${node.id} unlocks ${unlocked}, but ${unlocked}.depends_on does not include ${node.id}`)
      }
    }
  }

  // 检查 5: 循环依赖
  const visiting = new Set<string>()
  const visited = new Set<string>()

  function dfs(id: string, stack: string[]): void {
    if (visiting.has(id)) {
      fail(`Circular dependency: ${[...stack, id].join(' → ')}`)
      return
    }
    if (visited.has(id)) return
    visiting.add(id)
    const node = nodeMap.get(id)
    for (const dep of node?.depends_on || []) {
      dfs(dep, [...stack, id])
    }
    visiting.delete(id)
    visited.add(id)
  }
  for (const node of data.nodes) dfs(node.id, [])

  // 检查 6+7: MDX 文件存在 + frontmatter 一致
  if (existsSync(NODES_DIR)) {
    const mdxFiles = readdirSync(NODES_DIR).filter(f => f.endsWith('.mdx'))
    const fileMap = new Map<string, string>() // id → filename

    for (const file of mdxFiles) {
      const match = file.match(/^(n\d+)-(.+)\.mdx$/)
      if (!match) {
        warn(`MDX filename does not match pattern n[NN]-[slug].mdx: ${file}`)
        continue
      }
      fileMap.set(match[1], file)
    }

    for (const node of data.nodes) {
      const file = fileMap.get(node.id)
      if (!file) {
        warn(`No MDX file for node ${node.id} (${node.title})`)
      } else {
        // 简单 frontmatter 检查（完整版需要 mdx parser）
        const content = readFileSync(join(NODES_DIR, file), 'utf-8')
        if (!content.includes(`id: ${node.id}`)) {
          fail(`${file}: frontmatter id does not match ${node.id}`)
        }
        if (!content.includes(`slug: ${node.slug}`)) {
          fail(`${file}: frontmatter slug does not match ${node.slug}`)
        }
      }
    }
  }

  // 输出
  if (warnings.length > 0) {
    console.warn(`\n⚠ ${warnings.length} warning(s):`)
    warnings.forEach(w => console.warn(`  - ${w}`))
  }

  if (errors.length > 0) {
    console.error(`\n✗ ${errors.length} error(s):`)
    errors.forEach(e => console.error(`  - ${e}`))
    process.exit(1)
  }

  console.log(`\n✓ Knowledge graph valid: ${nodeMap.size} nodes, ${Object.keys(data.projects || {}).length} projects`)
}

main()
