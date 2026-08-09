import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApiRoute = pathname.startsWith("/api/")

  // Halaman login tidak butuh token, tapi tetap harus ikut aturan no-store di
  // bawah. Dulu ia return lebih awal, sehingga produksi mengembalikan
  // `public, max-age=3600` dan CDN menyajikannya sebagai halaman ter-cache.
  if (pathname !== "/admin/login" && !isApiRoute) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      const redirect = NextResponse.redirect(loginUrl)
      // Redirect ini pun tidak boleh di-cache. Tanpa ini CDN menyajikannya
      // sebagai `public, max-age=3600`, sehingga admin yang SUDAH login tetap
      // terlempar ke halaman login sampai cache-nya kedaluwarsa.
      redirect.headers.set("Cache-Control", "no-store, max-age=0")
      return redirect
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
