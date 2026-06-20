import { NextRequest, NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth-server"
import { rateLimit } from "@/lib/rate-limit"

const handler = NextAuth(authOptions)

export { handler as GET }

export async function POST(
  request: NextRequest,
  context: { params: { nextauth: string[] } }
) {
  const isLoginAttempt =
    context.params.nextauth?.[0] === "callback" &&
    context.params.nextauth?.[1] === "credentials"

  if (isLoginAttempt) {
    const identifier =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const limit = rateLimit(`login:${identifier}`, 5, 15 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan login, coba lagi 15 menit lagi" },
        { status: 429 }
      )
    }
  }

  return handler(request, context)
}
