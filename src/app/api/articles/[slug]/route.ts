import { NextRequest, NextResponse } from "next/server"
import { getArticleBySlug } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const item = await getArticleBySlug(params.slug)

    if (!item) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: item }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    console.error("GET /api/articles/[slug] error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data artikel" },
      { status: 500 }
    )
  }
}
