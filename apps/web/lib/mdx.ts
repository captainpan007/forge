/**
 * MDX 内容加载层
 *
 * 服务端从 content/nodes/*.mdx 读文件 → 用 gray-matter 拆 frontmatter →
 * 把 raw MDX 内容交给 next-mdx-remote/rsc 渲染（在节点页里）
 *
 * 设计参考：docs/CONTENT_GUIDE.md
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'

// frontmatter schema — 跟 packages/kg 的 nodeSchema 对齐
// 但用 passthrough 容忍额外字段（如 last_updated）
const nodeFrontmatterSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    phase: z.number().int().positive(),
    phase_name: z.string(),
    project: z.string(),
    order: z.number().int().nonnegative().optional(),
    duration: z.number().int().optional(),
    difficulty: z.number().int().min(1).max(5).optional(),
    depends_on: z.array(z.string()).optional(),
    unlocks: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'review', 'ready']).optional(),
    authors: z.array(z.string()).optional(),
  })
  .passthrough()

export type NodeFrontmatter = z.infer<typeof nodeFrontmatterSchema>

export interface NodeContent {
  frontmatter: NodeFrontmatter
  content: string // 去 frontmatter 后的纯 MDX
}

function getContentDir(): string {
  const dir = process.env.FORGE_CONTENT_DIR
  if (!dir) {
    throw new Error('FORGE_CONTENT_DIR not set — check next.config.mjs')
  }
  return dir
}

/**
 * 加载一个节点的 MDX
 *
 * @param id   节点 ID（如 "n05"）
 * @param slug 节点 slug（如 "gpio-basics"）— 与文件名匹配 `${id}-${slug}.mdx`
 * @returns null 如果文件不存在（节点 MDX 还没写），调用方应渲染 placeholder
 */
export function loadNodeMdx(id: string, slug: string): NodeContent | null {
  const filepath = join(getContentDir(), 'nodes', `${id}-${slug}.mdx`)
  if (!existsSync(filepath)) return null

  const raw = readFileSync(filepath, 'utf-8')
  const parsed = matter(raw)

  // 去掉文件里的 import 语句（next-mdx-remote 不解析 import；
  // components 通过 prop 注入。CONTENT_GUIDE.md 也强调不要在 MDX 里写 import）
  const cleanedContent = parsed.content
    .split('\n')
    .filter((line) => !/^\s*import\s+.+from\s+['"].+['"]\s*;?\s*$/.test(line))
    .join('\n')

  const frontmatter = nodeFrontmatterSchema.parse(parsed.data)

  return { frontmatter, content: cleanedContent }
}
