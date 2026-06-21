import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, isPrismaErrorCode } from "@/lib/api-admin"

export const dynamic = "force-dynamic"

const teamCreateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  role: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

const teamUpdateSchema = teamCreateSchema.partial()

function validationErrorResponse(error: z.ZodError) {
  return NextResponse.json(
    {
      error: "Validasi gagal",
      details: error.issues.map((e) => ({ field: e.path.join("."), message: e.message })),
    },
    { status: 400 }
  )
}

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const items = await prisma.teamMember.findMany({
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json({ data: items })
  } catch (error) {
    console.error("GET /api/admin/team error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data tim" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const validation = teamCreateSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const item = await prisma.teamMember.create({ data: validation.data })
    return NextResponse.json({ data: item })
  } catch (error) {
    console.error("POST /api/admin/team error:", error)
    return NextResponse.json(
      { error: "Gagal membuat anggota tim" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID wajib diisi" },
        { status: 400 }
      )
    }

    const validation = teamUpdateSchema.safeParse(data)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const item = await prisma.teamMember.update({
      where: { id },
      data: validation.data,
    })
    return NextResponse.json({ data: item })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json(
        { error: "Anggota tim tidak ditemukan" },
        { status: 404 }
      )
    }
    console.error("PUT /api/admin/team error:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate anggota tim" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID wajib diisi" },
        { status: 400 }
      )
    }

    await prisma.teamMember.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json(
        { error: "Anggota tim tidak ditemukan" },
        { status: 404 }
      )
    }
    console.error("DELETE /api/admin/team error:", error)
    return NextResponse.json(
      { error: "Gagal menghapus anggota tim" },
      { status: 500 }
    )
  }
}
