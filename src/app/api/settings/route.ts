import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const settings = await prisma.setting.findMany()
    const result: Record<string, string> = {}

    for (const s of settings) {
      if (s.value !== null) {
        result[s.key] = s.value
      }
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error("GET /api/settings error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data settings" },
      { status: 500 }
    )
  }
}
