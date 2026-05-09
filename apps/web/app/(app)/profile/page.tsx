import { requireUser } from '@/lib/auth'
import { getUserProgress, getUserProjects } from '@/lib/db/queries'
import { getKnowledgeGraph } from '@/lib/content'

export const metadata = {
  title: 'Profile',
}

export default async function ProfilePage() {
  const { clerkUser, user } = await requireUser()
  const progress = await getUserProgress(user.id)
  const userProjects = await getUserProjects(user.id)
  const graph = await getKnowledgeGraph()

  const completedNodes = progress.filter((p) => p.status === 'completed').length
  const totalSeconds = progress.reduce((sum, p) => sum + p.timeSpentSeconds, 0)
  const totalHours = Math.floor(totalSeconds / 3600)

  return (
    <div className="forge-container py-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        {clerkUser.imageUrl && (
          <img
            src={clerkUser.imageUrl}
            alt={clerkUser.firstName ?? 'avatar'}
            className="size-16 rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-semibold">
            {clerkUser.firstName ?? user.email}
          </h1>
          <p className="text-sm text-forge-fg-muted">{user.email}</p>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-4 mb-8">
        <div className="forge-card p-4">
          <p className="text-xs text-forge-fg-subtle font-mono mb-1">累计学习</p>
          <p className="text-2xl font-semibold">{totalHours}h</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-xs text-forge-fg-subtle font-mono mb-1">完成节点</p>
          <p className="text-2xl font-semibold">{completedNodes}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-xs text-forge-fg-subtle font-mono mb-1">激活项目</p>
          <p className="text-2xl font-semibold">{userProjects.length}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">作品集</h2>
        <div className="forge-card p-8 text-center">
          <p className="text-sm text-forge-fg-subtle italic">
            完成第一个项目后，您可以在这里上传儿子玩玩具的视频/照片。
          </p>
        </div>
      </section>
    </div>
  )
}
