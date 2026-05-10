/**
 * 命令面板搜索索引 — Server-only 部分
 *
 * ⚠ 这个文件 import 了 KG loader（用 node:fs），所以严禁被任何
 * 'use client' 组件 import —— webpack 会把整个文件打进客户端 chunk
 * 然后 build 失败（"node:fs unhandled scheme"）。
 *
 * 客户端要用的纯逻辑 (type + fuzzyScore) 都在 ./search-fuzzy.ts。
 *
 * 用 server component（如 TopBar）调用 buildSearchIndex()，把结果
 * 作为 prop 传给 client。
 */

import { getKnowledgeGraph } from './content'
import type { SearchEntry } from './search-fuzzy'

export type { SearchEntry } from './search-fuzzy'

const TOP_PAGES: Array<Pick<SearchEntry, 'title' | 'subtitle' | 'href'>> = [
  { title: 'Dashboard', subtitle: '主页 · 项目 + JARVIS Briefing', href: '/dashboard' },
  { title: 'Projects', subtitle: '所有项目', href: '/projects' },
  { title: 'Journal', subtitle: '学习日志', href: '/journal' },
  { title: 'Profile', subtitle: '个人资料 · 进度统计', href: '/profile' },
  { title: 'Settings', subtitle: '设置 · JARVIS / API Key', href: '/settings' },
]

/**
 * 构建完整搜索索引 — 在 (app)/layout 里 server-side 跑一次，
 * 注入到 client CommandPalette。
 */
export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const graph = await getKnowledgeGraph()
  const entries: SearchEntry[] = []

  // 顶级页面
  for (const p of TOP_PAGES) {
    entries.push({
      key: `page:${p.href}`,
      kind: 'page',
      title: p.title,
      subtitle: p.subtitle,
      href: p.href,
      haystack: `${p.title} ${p.subtitle ?? ''}`.toLowerCase(),
    })
  }

  // 项目
  for (const project of graph.projects.values()) {
    entries.push({
      key: `project:${project.slug}`,
      kind: 'project',
      title: project.title,
      subtitle: project.tagline ?? `项目 · ${project.slug}`,
      href: `/projects/${project.slug}/workshop`,
      haystack: [project.slug, project.title, project.tagline]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    })
  }

  // 节点 — 关联到第一个 project（节点可被多个项目复用，导航走第一个就行）
  for (const node of graph.nodes.values()) {
    let projectSlug: string | undefined
    for (const project of graph.projects.values()) {
      if (project.learning_path.includes(node.id)) {
        projectSlug = project.slug
        break
      }
    }
    if (!projectSlug) continue // 孤儿节点跳过

    entries.push({
      key: `node:${node.id}`,
      kind: 'node',
      title: node.title,
      subtitle: `${node.id.toUpperCase()} · Phase ${node.phase} · ${node.phase_name}`,
      href: `/projects/${projectSlug}/nodes/${node.id}`,
      haystack: [node.id, node.title, node.phase_name, ...(node.tags ?? [])]
        .join(' ')
        .toLowerCase(),
    })
  }

  return entries
}
