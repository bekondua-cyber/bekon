import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const item = await prisma.article.findUnique({
      where: { slug: params.slug, isPublished: true },
    })

    if (!item) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: item })
  } catch (error) {
    console.error("GET /api/articles/[slug] error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data artikel" },
      { status: 500 }
    )
  }
}
