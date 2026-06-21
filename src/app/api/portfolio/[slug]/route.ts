import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const item = await prisma.portfolio.findUnique({
      where: { slug: params.slug, isPublished: true },
    })

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
