import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApiRoute = pathname.startsWith("/api/")

  if (pathname === "/admin/login") {
    return NextResponse.next()
  }

  if (!isApiRoute) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // /api/admin/* relies on its own requireAdmin() check for auth (401 JSON),
  // not a redirect. Every /admin/* and /api/admin/* response must never be
  // cached at the edge, otherwise admin pages/lists go stale after writes.
  const response = NextResponse.next()
  response.headers.set("Cache-Control", "no-store, max-age=0")
  return response
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
