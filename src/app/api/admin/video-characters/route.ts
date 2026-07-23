import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, isPrismaErrorCode } from "@/lib/api-admin"

export const dynamic = "force-dynamic"

const characterCreateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  gender: z.string().optional().nullable(),
  age: z.number().int().min(0).max(120).optional().nullable(),
  photoUrl: z.string().min(1, "Foto wajib diupload"),
})

const characterUpdateSchema = characterCreateSchema.partial()

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const item = await prisma.videoCharacter.findUnique({ where: { id } })
      if (!item) {
        return NextResponse.json({ error: "Karakter tidak ditemukan" }, { status: 404 })
      }
      return NextResponse.json({ data: item })
    }

    const items = await prisma.videoCharacter.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json({ data: items })
  } catch (error) {
    console.error("GET /api/admin/video-characters error:", error)
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const validation = characterCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message || "Data tidak valid" }, { status: 400 })
    }

    const item = await prisma.videoCharacter.create({ data: validation.data })
    return NextResponse.json({ data: item })
  } catch (error) {
    console.error("POST /api/admin/video-characters error:", error)
    return NextResponse.json({ error: "Gagal membuat karakter" }, { status: 500 })
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

    const validation = characterUpdateSchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message || "Data tidak valid" }, { status: 400 })
    }

    const item = await prisma.videoCharacter.update({ where: { id }, data: validation.data })
    return NextResponse.json({ data: item })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json({ error: "Karakter tidak ditemukan" }, { status: 404 })
    }
    console.error("PUT /api/admin/video-characters error:", error)
    return NextResponse.json({ error: "Gagal mengupdate karakter" }, { status: 500 })
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

    await prisma.videoCharacter.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json({ error: "Karakter tidak ditemukan" }, { status: 404 })
    }
    console.error("DELETE /api/admin/video-characters error:", error)
    return NextResponse.json({ error: "Gagal menghapus karakter" }, { status: 500 })
  }
}
