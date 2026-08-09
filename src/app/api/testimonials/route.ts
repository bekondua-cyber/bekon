import { NextResponse } from "next/server"
import { getPublishedTestimonials } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const items = await getPublishedTestimonials()

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
