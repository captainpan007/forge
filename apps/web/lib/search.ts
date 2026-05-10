/**
 * 命令面板搜索索引
 *
 * 把 KG 里的项目 + 节点 + 顶级页面摊平成一个 flat 数组，
 * 客户端做 fuzzy 匹配。索引大小 ~66 项，整个 JSON < 20KB，
 * 无需后端搜索 API。
 */

import { getKnowledgeGraph } from './content'

export interface SearchEntry {
  /** 唯一 key */
  key: string
  /** 显示标题 */
  title: string
  /** 副标题（项目名 / 类别） */
  subtitle?: string
  /** 路由 URL */
  href: string
  /** 类型标签（影响图标 + 排序） */
  kind: 'page' | 'project' | 'node'
  /** 拼接好的可搜索字符串（小写） */
  haystack: string
}

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
      haystack: [
        project.slug,
        project.title,
        project.tagline,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    })
  }

  // 节点 — 关联到第一个 project（节点可被多个项目复用，导航走第一个就行）
  for (const node of graph.nodes.values()) {
    // 找承载这个节点的第一个项目
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
      haystack: [
        node.id,
        node.title,
        node.phase_name,
        ...(node.tags ?? []),
      ]
        .join(' ')
        .toLowerCase(),
    })
  }

  return entries
}

/**
 * 简单 fuzzy 匹配评分 — 不用 fuse.js，66 项纯手搓
 *
 * 规则：
 *   - 完全匹配 title 头部 → 高分
 *   - 子串命中 title → 中分
 *   - 子串命中 haystack → 低分
 *   - 无命中 → -1（过滤掉）
 */
export function fuzzyScore(query: string, entry: SearchEntry): number {
  if (!query) return 0 // 空 query → 全显示
  const q = query.toLowerCase().trim()
  if (!q) return 0

  const title = entry.title.toLowerCase()

  // 类型加权：node > project > page（学习场景节点最常用）
  const kindBoost = entry.kind === 'node' ? 0.5 : entry.kind === 'project' ? 0.3 : 0

  if (title.startsWith(q)) return 100 + kindBoost
  if (title.includes(q)) return 60 + kindBoost
  if (entry.haystack.includes(q)) return 30 + kindBoost

  // 字符顺序匹配（极简版 — q 的所有字符按序出现在 haystack）
  let qi = 0
  for (let i = 0; i < entry.haystack.length && qi < q.length; i++) {
    if (entry.haystack[i] === q[qi]) qi++
  }
  if (qi === q.length) return 10 + kindBoost

  return -1
}
