/**
 * 内存中的 KnowledgeGraph 实例
 *
 * 加载一次 yaml，所有图查询都走内存。零数据库、零 IO。
 */

import type { KnowledgeGraphData, KnowledgeGraph, Node, Project } from './types'
import { topologicalSort, findReadyNodes } from './topology'

class KnowledgeGraphImpl implements KnowledgeGraph {
  public readonly projects: Map<string, Project & { slug: string }>
  public readonly nodes: Map<string, Node>

  constructor(data: KnowledgeGraphData) {
    this.nodes = new Map(data.nodes.map((n) => [n.id, n]))
    this.projects = new Map(
      Object.entries(data.projects).map(([slug, p]) => [slug, { ...p, slug }])
    )
  }

  getNode(id: string): Node | undefined {
    return this.nodes.get(id)
  }

  getProject(slug: string): (Project & { slug: string }) | undefined {
    return this.projects.get(slug)
  }

  getProjectNodes(projectSlug: string): Node[] {
    const project = this.projects.get(projectSlug)
    if (!project) return []
    return project.learning_path
      .map((id) => this.nodes.get(id))
      .filter((n): n is Node => n !== undefined)
  }

  topologicalOrder(projectSlug: string): Node[] {
    const projectNodes = this.getProjectNodes(projectSlug)
    return topologicalSort(projectNodes, this.nodes)
  }

  readyNodes(projectSlug: string, completed: Set<string>): Node[] {
    const projectNodes = this.getProjectNodes(projectSlug)
    return findReadyNodes(projectNodes, completed)
  }

  nextNode(projectSlug: string, completed: Set<string>): Node | undefined {
    const project = this.projects.get(projectSlug)
    if (!project) return undefined

    // 顺着 learning_path 找第一个未完成的节点（且依赖已满足）
    for (const id of project.learning_path) {
      if (completed.has(id)) continue
      const node = this.nodes.get(id)
      if (!node) continue
      const deps = node.depends_on
      if (deps.every((d) => completed.has(d))) return node
    }
    return undefined
  }
}

/**
 * 加载并构造图实例。这是 packages/kg 的主入口。
 */
export async function loadKnowledgeGraph(contentDir: string): Promise<KnowledgeGraph> {
  const { loadGraphFromFile, getGraphPath } = await import('./parser')
  const data = loadGraphFromFile(getGraphPath(contentDir))
  return new KnowledgeGraphImpl(data)
}
