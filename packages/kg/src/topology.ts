/**
 * 知识图谱的图算法
 *
 * - topologicalSort: 拓扑排序 (Kahn 算法)
 * - findReadyNodes: 找出可以开始学的节点（依赖都已完成）
 * - detectCycle: 检测循环依赖
 */

import type { Node } from './types'

/**
 * 拓扑排序 — 返回按依赖顺序排列的节点
 * 如果有循环依赖会抛错
 */
export function topologicalSort(
  projectNodes: Node[],
  allNodes: Map<string, Node>
): Node[] {
  // 仅考虑 project 内的节点 + 它们的依赖
  const relevantIds = new Set<string>()
  function collectDeps(id: string): void {
    if (relevantIds.has(id)) return
    relevantIds.add(id)
    const node = allNodes.get(id)
    if (!node) return
    for (const dep of node.depends_on) collectDeps(dep)
  }
  for (const node of projectNodes) collectDeps(node.id)

  // 计算入度
  const inDegree = new Map<string, number>()
  const adj = new Map<string, string[]>()

  for (const id of relevantIds) {
    inDegree.set(id, 0)
    adj.set(id, [])
  }

  for (const id of relevantIds) {
    const node = allNodes.get(id)
    if (!node) continue
    for (const dep of node.depends_on) {
      if (!relevantIds.has(dep)) continue
      adj.get(dep)!.push(id)
      inDegree.set(id, (inDegree.get(id) ?? 0) + 1)
    }
  }

  // Kahn 算法
  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  const sorted: Node[] = []
  while (queue.length > 0) {
    const id = queue.shift()!
    const node = allNodes.get(id)
    if (node) sorted.push(node)

    for (const next of adj.get(id) ?? []) {
      const newDeg = (inDegree.get(next) ?? 0) - 1
      inDegree.set(next, newDeg)
      if (newDeg === 0) queue.push(next)
    }
  }

  if (sorted.length < relevantIds.size) {
    throw new Error('Circular dependency detected in knowledge graph')
  }

  // 仅返回 project 内的节点
  const projectIds = new Set(projectNodes.map((n) => n.id))
  return sorted.filter((n) => projectIds.has(n.id))
}

/**
 * 找出当前可以开始学的节点 — 依赖都已 completed
 */
export function findReadyNodes(projectNodes: Node[], completed: Set<string>): Node[] {
  return projectNodes.filter((n) => {
    if (completed.has(n.id)) return false
    return n.depends_on.every((d) => completed.has(d))
  })
}

/**
 * 检测循环依赖 — 返回循环节点 ID 列表，没有循环则返回空数组
 */
export function detectCycle(allNodes: Map<string, Node>): string[][] {
  const cycles: string[][] = []
  const visiting = new Set<string>()
  const visited = new Set<string>()

  function dfs(id: string, path: string[]): void {
    if (visiting.has(id)) {
      const start = path.indexOf(id)
      cycles.push(path.slice(start))
      return
    }
    if (visited.has(id)) return

    visiting.add(id)
    const node = allNodes.get(id)
    if (node) {
      for (const dep of node.depends_on) {
        dfs(dep, [...path, id])
      }
    }
    visiting.delete(id)
    visited.add(id)
  }

  for (const id of allNodes.keys()) dfs(id, [])
  return cycles
}
