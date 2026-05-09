/**
 * JARVIS 工具集合 — v0.3 实现
 *
 * 每个工具是一个独立的 ToolDefinition：
 *   - search_docs       — 查官方文档（Pi/Adafruit/MDN）
 *   - analyze_image     — 看用户上传的电路照片
 *   - recommend_next    — 推荐下一节
 *   - parse_error       — 解析报错日志
 *   - run_simulation    — Wokwi 模拟（v1.1）
 *   - feynman_critique  — 评判 Feynman 提交
 *   - search_failure    — 查相似坑（Failure Log）
 */

import type { ToolDefinition } from '../types'

// v0.x: 仅声明工具的元数据，execute 全是 stub
// v0.3: 真实实现

export const tools: ToolDefinition[] = [
  {
    name: 'recommend_next_node',
    description: 'Recommend the next learning node based on user progress.',
    inputSchema: {
      type: 'object',
      properties: {
        project_slug: { type: 'string' },
      },
      required: ['project_slug'],
    },
    execute: async () => {
      throw new Error('Not implemented in v0.x')
    },
  },
  // 其他工具：v0.3 添加
]
