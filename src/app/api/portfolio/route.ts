import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")
    const category = searchParams.get("category")
    const all = searchParams.get("all")

    const where: Record<string, unknown> = { isPublished: true }

    if (featured === "true") {
      where.isFeatured = true
    }

    if (category) {
      where.category = category
    }

    const items = await prisma.portfolio.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...(all !== "true" ? { take: 8 } : {}),
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
