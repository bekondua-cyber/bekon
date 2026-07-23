import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, isPrismaErrorCode } from "@/lib/api-admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const item = await prisma.videoPromptHistory.findUnique({ where: { id } })
      if (!item) {
        return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
      }
      return NextResponse.json({ data: item })
    }

    const items = await prisma.videoPromptHistory.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ data: items })
  } catch (error) {
    console.error("GET /api/admin/video-prompt-history error:", error)
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 })
    }

    await prisma.videoPromptHistory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
    }
    console.error("DELETE /api/admin/video-prompt-history error:", error)
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 })
  }
}
