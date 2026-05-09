/**
 * @forge/kg — Knowledge Graph parser & traversal
 *
 * Public API:
 *   - loadKnowledgeGraph(contentDir): 加载并返回图实例
 *   - parseKnowledgeGraphYaml(string): 仅解析 yaml 字符串
 *   - 类型: Node, Project, KnowledgeGraph
 */

export { loadKnowledgeGraph } from './graph'
export { parseKnowledgeGraphYaml, loadGraphFromFile } from './parser'
export { topologicalSort, findReadyNodes, detectCycle } from './topology'
export type {
  Node,
  Project,
  KnowledgeGraph,
  KnowledgeGraphData,
} from './types'
export { nodeSchema, projectSchema, knowledgeGraphSchema } from './types'
