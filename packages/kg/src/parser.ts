/**
 * 解析 content/knowledge-graph.yaml 到内存
 *
 * 用 zod 验证 schema — 解析失败会抛出明确错误
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { knowledgeGraphSchema, type KnowledgeGraphData } from './types'

export function parseKnowledgeGraphYaml(yamlString: string): KnowledgeGraphData {
  const raw = parseYaml(yamlString) as unknown
  const result = knowledgeGraphSchema.safeParse(raw)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`Invalid knowledge-graph.yaml:\n${issues}`)
  }
  return result.data
}

export function loadGraphFromFile(filepath: string): KnowledgeGraphData {
  const content = readFileSync(filepath, 'utf-8')
  return parseKnowledgeGraphYaml(content)
}

export function getGraphPath(contentDir: string): string {
  return join(contentDir, 'knowledge-graph.yaml')
}
