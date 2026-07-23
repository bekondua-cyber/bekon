import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, isPrismaErrorCode } from "@/lib/api-admin"

export const dynamic = "force-dynamic"

const materialCreateSchema = z.object({
  label: z.string().min(1, "Label wajib diisi"),
  description: z.string().optional().nullable(),
  photoUrl: z.string().min(1, "Foto wajib diupload"),
})

const materialUpdateSchema = materialCreateSchema.partial()

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const item = await prisma.videoMaterial.findUnique({ where: { id } })
      if (!item) {
        return NextResponse.json({ error: "Bahan tidak ditemukan" }, { status: 404 })
      }
      return NextResponse.json({ data: item })
    }

    const items = await prisma.videoMaterial.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json({ data: items })
  } catch (error) {
    console.error("GET /api/admin/video-materials error:", error)
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const validation = materialCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message || "Data tidak valid" }, { status: 400 })
    }

    const item = await prisma.videoMaterial.create({ data: validation.data })
    return NextResponse.json({ data: item })
  } catch (error) {
    console.error("POST /api/admin/video-materials error:", error)
    return NextResponse.json({ error: "Gagal membuat bahan" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 })
    }

    const validation = materialUpdateSchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message || "Data tidak valid" }, { status: 400 })
    }

    const item = await prisma.videoMaterial.update({ where: { id }, data: validation.data })
    return NextResponse.json({ data: item })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json({ error: "Bahan tidak ditemukan" }, { status: 404 })
    }
    console.error("PUT /api/admin/video-materials error:", error)
    return NextResponse.json({ error: "Gagal mengupdate bahan" }, { status: 500 })
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

    await prisma.videoMaterial.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json({ error: "Bahan tidak ditemukan" }, { status: 404 })
    }
    console.error("DELETE /api/admin/video-materials error:", error)
    return NextResponse.json({ error: "Gagal menghapus bahan" }, { status: 500 })
  }
}
