import { NextRequest, NextResponse } from "next/server"
import { getPublishedPortfolio } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const takeParam = searchParams.get("take")

    const items = await getPublishedPortfolio({
      featured: searchParams.get("featured") === "true",
      category: searchParams.get("category"),
      excludeSlug: searchParams.get("exclude"),
      take: takeParam ? parseInt(takeParam) : null,
      all: searchParams.get("all") === "true",
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
