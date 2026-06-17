import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-admin"
import { uploadImage, deleteImage } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Cloudinary menangani resize & konversi webp
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
    return NextResponse.json(
      { 
        error: "Gagal mengupload file",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { public_id } = await request.json()

    if (!public_id) {
      return NextResponse.json(
        { error: "public_id wajib diisi" },
        { status: 400 }
      )
    }

    await deleteImage(public_id)

    const media = await prisma.media.findFirst({ where: { publicId: public_id } })
    if (media) {
      await prisma.media.delete({ where: { id: media.id } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/upload error:", error)
    return NextResponse.json(
      { error: "Gagal menghapus file" },
      { status: 500 }
    )
  }
}
