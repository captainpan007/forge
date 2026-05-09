import { redirect } from 'next/navigation'

// 默认重定向到 workshop 视图
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/projects/${slug}/workshop`)
}
