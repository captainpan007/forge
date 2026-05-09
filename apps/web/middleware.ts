import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Clerk middleware for forge.dev
 *
 * Strategy:
 *   - Public routes: marketing, auth pages, health check
 *   - Protected routes: everything else (auto-redirect to sign-in)
 */

const isPublicRoute = createRouteMatcher([
  '/',                          // 营销首页 (未登录看)
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health',
  '/about',
  '/docs(.*)',                  // 公开文档
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // 跳过 Next.js 内部 + 静态资源
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 总是检查 API 路由
    '/(api|trpc)(.*)',
  ],
}
