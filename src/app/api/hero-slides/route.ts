import { NextResponse } from "next/server"
import { getActiveHeroSlides } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const slides = await getActiveHeroSlides()

    return NextResponse.json({ data: slides }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    console.error("GET /api/hero-slides error:", error)
    return NextResponse.json({ error: "Gagal memuat hero slides" }, { status: 500 })
  }
}
