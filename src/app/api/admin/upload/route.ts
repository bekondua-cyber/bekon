import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-admin"
import { rateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/request-ip"
import { uploadImage, deleteImage } from "@/lib/cloudinary"
import { findImageUsage } from "@/lib/media-usage"
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_SIZE_MB } from "@/lib/upload-limits"

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const identifier = getClientIp(request)
    const limit = rateLimit(`upload:${identifier}`, 30, 60000)
    if (!limit.allowed) {
      return NextResponse.json({ error: "Terlalu banyak upload. Coba lagi sebentar." }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    }

    // Batas ukuran & tipe sebelumnya HANYA ada di browser (upload-client.ts),
    // jadi POST langsung ke endpoint ini bisa melewatinya sepenuhnya.
    // Dicek sebelum arrayBuffer() supaya berkas raksasa tidak masuk memori.
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `File terlalu besar. Maksimal ${MAX_UPLOAD_SIZE_MB}MB.` },
        { status: 413 }
      )
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Hanya berkas gambar yang diterima." },
        { status: 415 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await uploadImage(buffer, "bekon")

    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url: result.url,
        publicId: result.public_id,
        sizeBytes: buffer.length,
        width: result.width,
        height: result.height,
      },
    })

    return NextResponse.json({ data: media })
  } catch (error) {
    console.error("POST /api/admin/upload error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    // Detail teknis hanya ke log server, bukan ke respons — pesannya bisa
    // memuat internal Cloudinary/infrastruktur.
    return NextResponse.json({ error: "Gagal mengupload file" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { public_id } = await request.json()

    if (!public_id || typeof public_id !== "string") {
      return NextResponse.json(
        { error: "public_id wajib diisi" },
        { status: 400 }
      )
    }

    // Baris Media dicari LEBIH DULU. Dulu `deleteImage()` dipanggil langsung
    // atas public_id apa pun yang dikirim, sehingga endpoint ini bisa menghapus
    // aset Cloudinary mana saja di akun — termasuk yang tidak pernah diunggah
    // lewat situs ini dan tidak ada catatannya di database.
    const media = await prisma.media.findFirst({ where: { publicId: public_id } })
    if (!media) {
      return NextResponse.json(
        { error: "Media tidak ditemukan" },
        { status: 404 }
      )
    }

    // Proteksi yang sama dengan route media. Halaman Media memakai endpoint ini
    // untuk hapus satuan, jadi tanpa pemeriksaan di sini celahnya tetap terbuka
    // lewat tombol hapus per gambar.
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

    await deleteImage(media.publicId)
    await prisma.media.delete({ where: { id: media.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/upload error:", error)
    return NextResponse.json(
      { error: "Gagal menghapus file" },
      { status: 500 }
    )
  }
}
