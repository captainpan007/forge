/**
 * 搜索的"纯"部分 — type + fuzzy 评分
 *
 * 这个文件不能 import 任何 server-only 模块（fs / @forge/kg / db）。
 * 客户端组件 (CommandPalette.tsx) 直接 import 这个就行。
 *
 * 真正构建索引的 buildSearchIndex() 在 server-only 的 ./search.ts。
 */

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

/**
 * 简单 fuzzy 匹配评分 — 不用 fuse.js，66 项纯手搓
 *
 * 规则：
 *   - 完全匹配 title 头部 → 高分
 *   - 子串命中 title → 中分
 *   - 子串命中 haystack → 低分
 *   - 字符顺序匹配（"gpb" → "gpio basics"）→ 兜底
 *   - 无命中 → -1（过滤掉）
 */
export function fuzzyScore(query: string, entry: SearchEntry): number {
  if (!query) return 0 // 空 query → 全显示
  const q = query.toLowerCase().trim()
  if (!q) return 0

  const title = entry.title.toLowerCase()

  // 类型加权：node > project > page（学习场景节点最常用）
  const kindBoost =
    entry.kind === 'node' ? 0.5 : entry.kind === 'project' ? 0.3 : 0

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
