import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-admin"
import { deleteImage } from "@/lib/cloudinary"

export const dynamic = "force-dynamic"

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const items = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ data: items })
  } catch (error) {
    console.error("GET /api/admin/media error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data media" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      const body = await request.json().catch(() => ({}))
      const ids = body.ids

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: "ID atau ids wajib diisi" },
          { status: 400 }
        )
      }

      console.log("[Media API] Bulk delete:", ids.length, "items")

      for (const mediaId of ids) {
        const media = await prisma.media.findUnique({ where: { id: mediaId } })
        if (media?.publicId) {
          await deleteImage(media.publicId)
        }
      }

      await prisma.media.deleteMany({ where: { id: { in: ids } } })

      console.log("[Media API] Bulk delete success")
      return NextResponse.json({ success: true })
    }

    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) {
      return NextResponse.json({ error: "Media tidak ditemukan" }, { status: 404 })
    }

    if (media.publicId) {
      await deleteImage(media.publicId)
    }

    await prisma.media.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/media error:", error)
    return NextResponse.json(
      { error: "Gagal menghapus media" },
      { status: 500 }
    )
  }
}
