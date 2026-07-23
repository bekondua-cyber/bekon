import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api-admin"
import { getGa4Report, isGa4Configured } from "@/lib/ga4"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  const configured = await isGa4Configured()
  if (!configured) {
    return NextResponse.json({ configured: false, data: null })
  }

  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || "30daysAgo"
    const endDate = searchParams.get("endDate") || "today"

    const report = await getGa4Report(startDate, endDate)
    return NextResponse.json({ configured: true, data: report })
  } catch (error) {
    console.error("GET /api/admin/ga4-report error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data GA4" },
      { status: 500 }
    )
  }
}
