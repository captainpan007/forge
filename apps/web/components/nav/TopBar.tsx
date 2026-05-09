import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import type { User } from '@/lib/db/schema'

interface TopBarProps {
  user: User
}

export function TopBar({ user: _user }: TopBarProps) {
  return (
    <header className="border-b border-forge-border bg-forge-bg sticky top-0 z-30">
      <div className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="size-7 rounded bg-forge-accent flex items-center justify-center text-white font-bold text-sm">
              F
            </div>
            <span className="font-semibold tracking-tight">forge</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded-md text-xs font-mono text-forge-fg-muted hover:bg-forge-bg-hover transition-colors flex items-center gap-1.5"
            title="Command palette (v0.4)"
            disabled
          >
            <span>⌘</span>
            <span>K</span>
          </button>
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
    </header>
  )
}
