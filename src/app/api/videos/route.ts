import { NextRequest, NextResponse } from "next/server"
import { getPublishedVideos } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const items = await getPublishedVideos({ category: searchParams.get("category") })

    return NextResponse.json({ data: items }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    console.error("GET /api/videos error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data video" },
      { status: 500 }
    )
  }
}
