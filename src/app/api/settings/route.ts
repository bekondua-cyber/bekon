import { NextResponse } from "next/server"
import { getSettingsMap } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const result = await getSettingsMap()

    return NextResponse.json({ data: result }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    console.error("GET /api/settings error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data settings" },
      { status: 500 }
    )
  }
}
