import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const items = await prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json({ data: items }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    console.error("GET /api/testimonials error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data testimoni" },
      { status: 500 }
    )
  }
}
