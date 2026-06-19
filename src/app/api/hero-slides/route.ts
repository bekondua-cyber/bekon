import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
    return NextResponse.json({ data: slides })
  } catch (error) {
    console.error("GET /api/hero-slides error:", error)
    return NextResponse.json({ error: "Gagal memuat hero slides" }, { status: 500 })
  }
}
