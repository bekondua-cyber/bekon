import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, isPrismaErrorCode } from "@/lib/api-admin"

export const dynamic = "force-dynamic"

/** Log bisa tumbuh cepat, jadi selalu dibatasi — tidak pernah ambil semua. */
const PAGE_SIZE = 50

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { searchParams } = new URL(request.url)
    const onlyFallback = searchParams.get("fallback") === "true"
    const skip = Math.max(0, Number(searchParams.get("skip")) || 0)

    const where = onlyFallback ? { usedFallback: true } : {}

    const [items, total, fallbackCount] = await Promise.all([
      prisma.chatConversation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip,
      }),
      prisma.chatConversation.count({ where }),
      prisma.chatConversation.count({ where: { usedFallback: true } }),
    ])

    return NextResponse.json({ data: items, total, fallbackCount, pageSize: PAGE_SIZE })
  } catch (error) {
    console.error("GET /api/admin/chat-log error:", error)
    return NextResponse.json({ error: "Gagal mengambil log percakapan" }, { status: 500 })
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

    await prisma.chatConversation.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json({ error: "Percakapan tidak ditemukan" }, { status: 404 })
    }
    console.error("DELETE /api/admin/chat-log error:", error)
    return NextResponse.json({ error: "Gagal menghapus percakapan" }, { status: 500 })
  }
}
