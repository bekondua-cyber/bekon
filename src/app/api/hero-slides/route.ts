import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        portfolio: {
          select: { id: true, title: true, slug: true, coverImage: true },
        },
      },
    })
    return NextResponse.json({ data: slides }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    console.error("GET /api/hero-slides error:", error)
    return NextResponse.json({ error: "Gagal memuat hero slides" }, { status: 500 })
  }
}
