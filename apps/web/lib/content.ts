/**
 * 内容加载层 — 封装 @forge/kg 的调用
 *
 * 在 server component 里直接 import 用即可。所有路径基于
 * `process.env.FORGE_CONTENT_DIR`（next.config.mjs 设的常量）
 */

import { loadKnowledgeGraph, type KnowledgeGraph } from '@forge/kg'

let cachedGraph: KnowledgeGraph | null = null

/**
 * 加载图谱 — 内存缓存（dev 模式 hot reload 时会自动失效）
 */
export async function getKnowledgeGraph(): Promise<KnowledgeGraph> {
  if (cachedGraph) return cachedGraph
  const dir = process.env.FORGE_CONTENT_DIR
  if (!dir) throw new Error('FORGE_CONTENT_DIR not set')
  cachedGraph = await loadKnowledgeGraph(dir)
  return cachedGraph
}

/**
 * 失效缓存（修改 yaml 后调用 — dev 用）
 */
export function invalidateContentCache(): void {
  cachedGraph = null
}
