import { NextRequest, NextResponse } from "next/server"
import { getPortfolioBySlug } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const item = await getPortfolioBySlug(params.slug)

    if (!item) {
      return NextResponse.json(
        { error: "Portfolio tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: item }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    console.error("GET /api/portfolio/[slug] error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data portfolio" },
      { status: 500 }
    )
  }
}
