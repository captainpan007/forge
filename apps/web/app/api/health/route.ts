import { NextResponse } from 'next/server'
import { getKnowledgeGraph } from '@/lib/content'

/**
 * 健康检查端点
 *
 * 用于 Vercel / 上线后监控
 * 检查内容：
 *   - 进程存活
 *   - 知识图谱可加载
 *   - 节点数 / 项目数（验证 schema）
 */
export async function GET() {
  try {
    const graph = await getKnowledgeGraph()
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.0.1',
      knowledge_graph: {
        projects: graph.projects.size,
        nodes: graph.nodes.size,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
