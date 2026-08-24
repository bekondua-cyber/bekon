import { NextRequest, NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth-server"
import { rateLimitDb } from "@/lib/rate-limit-db"
import { getClientIp } from "@/lib/request-ip"

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
    // Hitungannya disimpan di database, bukan memori proses. Versi memori
    // memberi tiap instance serverless jatah 5 percobaannya sendiri, sehingga
    // batas ini bisa dilewati begitu saja dengan menunggu instance berganti —
    // dan ini satu-satunya penahan brute force di seluruh sistem.
    const identifier = getClientIp(request)
    const limit = await rateLimitDb(`login:${identifier}`, 5, 15 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan login, coba lagi 15 menit lagi" },
        { status: 429 }
      )
    }
  }

  return handler(request, context)
}
