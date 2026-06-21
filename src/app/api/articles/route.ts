import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where: Record<string, unknown> = { isPublished: true }

    if (category) {
      where.category = category
    }

    const items = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
    })

    return NextResponse.json({ data: items }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    console.error("GET /api/articles error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data artikel" },
      { status: 500 }
    )
  }
}
