import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * className 合并工具 — 兼容 clsx + tailwind-merge
 * 用法: cn('px-4', isActive && 'bg-blue-500', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * 格式化分钟数为人类可读时长
 *  10  → "10 分钟"
 *  90  → "1 小时 30 分钟"
 *  -1  → "持续"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return '持续'
  if (minutes < 60) return `${minutes} 分钟`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} 小时` : `${h} 小时 ${m} 分钟`
}

/**
 * 格式化时间戳为相对时间
 */
export function formatRelative(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 30) return `${days} 天前`
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

/**
 * 难度等级显示 (1-5)
 */
export function difficultyDots(difficulty: number): string {
  const filled = '●'.repeat(Math.max(0, Math.min(5, difficulty)))
  const empty = '○'.repeat(5 - Math.max(0, Math.min(5, difficulty)))
  return filled + empty
}
