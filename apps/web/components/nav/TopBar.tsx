import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import type { User } from '@/lib/db/schema'
import { buildSearchIndex } from '@/lib/search'
import { CommandPalette } from './CommandPalette'
import { CommandPaletteTrigger } from './CommandPaletteTrigger'

interface TopBarProps {
  user: User
}

/**
 * 顶部导航栏 — Server Component
 *
 * 在服务端构建搜索索引（一次，依赖 KG 内存缓存），把 flat 数组传给
 * <CommandPalette>（client）。
 */
export async function TopBar({ user: _user }: TopBarProps) {
  const searchIndex = await buildSearchIndex()

  return (
    <header className="border-b border-forge-border-subtle bg-forge-bg sticky top-0 z-30">
      <div className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="size-7 flex items-center justify-center font-mono text-sm text-forge-accent border border-forge-accent/40">
              F
            </div>
            <span className="font-medium tracking-tight">forge</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <CommandPaletteTrigger />
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'size-7',
              },
            }}
          />
        </div>
      </div>

      {/* 命令面板本体 — 自己监听 ⌘K，floating modal */}
      <CommandPalette index={searchIndex} />
    </header>
  )
}
