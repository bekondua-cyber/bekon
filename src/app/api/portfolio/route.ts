import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")
    const category = searchParams.get("category")
    const all = searchParams.get("all")
    const exclude = searchParams.get("exclude")
    const takeParam = searchParams.get("take")

    const where: Record<string, unknown> = { isPublished: true }

    if (featured === "true") {
      where.isFeatured = true
    }

    if (category) {
      where.category = category
    }

    if (exclude) {
      where.NOT = { slug: exclude }
    }

    const items = await prisma.portfolio.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      ...(all !== "true" ? { take: takeParam ? parseInt(takeParam) : 8 } : {}),
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        location: true,
        coverImage: true,
        images: true,
        isFeatured: true,
        isPublished: true,
        year: true,
      },
    })

    return NextResponse.json({ data: items }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    console.error("GET /api/portfolio error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data portfolio" },
      { status: 500 }
    )
  }
}
