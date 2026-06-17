import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where: Record<string, unknown> = { isPublished: true }

    if (category) {
      where.category = category
    }

    const items = await prisma.video.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json({ data: items })
  } catch (error) {
    console.error("GET /api/videos error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data video" },
      { status: 500 }
    )
  }
}
