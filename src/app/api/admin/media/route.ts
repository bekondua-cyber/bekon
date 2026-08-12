import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-admin"
import { deleteImage } from "@/lib/cloudinary"
import { findImageUsage } from "@/lib/media-usage"

export const dynamic = "force-dynamic"

/** Rangkum pemakaian per berkas supaya admin tahu persis apa yang harus dilepas. */
function describeUsage(
  items: { url: string; filename: string }[],
  usage: Map<string, string[]>
) {
  return items
    .filter((m) => usage.has(m.url))
    .map((m) => ({ filename: m.filename, usedIn: usage.get(m.url) ?? [] }))
}

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

      // Satu query untuk semua, bukan findUnique berurutan di dalam loop.
      const items = await prisma.media.findMany({
        where: { id: { in: ids } },
        select: { publicId: true, url: true, filename: true },
      })

      const blocked = await findImageUsage(items.map((m) => m.url))
      if (blocked.size > 0) {
        return NextResponse.json(
          { error: "Sebagian gambar masih dipakai", inUse: describeUsage(items, blocked) },
          { status: 409 }
        )
      }

      await Promise.all(
        items.filter((m) => m.publicId).map((m) => deleteImage(m.publicId))
      )

      await prisma.media.deleteMany({ where: { id: { in: ids } } })

      return NextResponse.json({ success: true })
    }

    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) {
      return NextResponse.json({ error: "Media tidak ditemukan" }, { status: 404 })
    }

    // Dulu penghapusan langsung dijalankan tanpa memeriksa apakah gambarnya
    // masih terpasang di suatu tempat. Akibatnya admin yang merapikan halaman
    // Media bisa merusak gambar di halaman publik tanpa peringatan apa pun.
    const usage = await findImageUsage([media.url])
    const usedIn = usage.get(media.url)
    if (usedIn?.length) {
      return NextResponse.json(
        {
          error: `Gambar masih dipakai di ${usedIn.length} tempat. Lepas dulu sebelum menghapus.`,
          inUse: [{ filename: media.filename, usedIn }],
        },
        { status: 409 }
      )
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
