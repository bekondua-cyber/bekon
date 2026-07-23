import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, isPrismaErrorCode } from "@/lib/api-admin"

export const dynamic = "force-dynamic"

const knowledgeCreateSchema = z.object({
  question: z.string().min(1, "Pertanyaan wajib diisi"),
  answer: z.string().min(1, "Jawaban wajib diisi"),
  category: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

const knowledgeUpdateSchema = knowledgeCreateSchema.partial()

function validationErrorResponse(error: z.ZodError) {
  return NextResponse.json(
    {
      error: "Validasi gagal",
      details: error.issues.map((e) => ({ field: e.path.join("."), message: e.message })),
    },
    { status: 400 }
  )
}

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const item = await prisma.knowledgeEntry.findUnique({ where: { id } })
      if (!item) {
        return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
      }
      return NextResponse.json({ data: item })
    }

    const items = await prisma.knowledgeEntry.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    })
    return NextResponse.json({ data: items })
  } catch (error) {
    console.error("GET /api/admin/knowledge-base error:", error)
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const validation = knowledgeCreateSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const item = await prisma.knowledgeEntry.create({ data: validation.data })
    return NextResponse.json({ data: item })
  } catch (error) {
    console.error("POST /api/admin/knowledge-base error:", error)
    return NextResponse.json({ error: "Gagal membuat data" }, { status: 500 })
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

    const validation = knowledgeUpdateSchema.safeParse(data)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const item = await prisma.knowledgeEntry.update({
      where: { id },
      data: validation.data,
    })
    return NextResponse.json({ data: item })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
    }
    console.error("PUT /api/admin/knowledge-base error:", error)
    return NextResponse.json({ error: "Gagal mengupdate data" }, { status: 500 })
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

    await prisma.knowledgeEntry.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
    }
    console.error("DELETE /api/admin/knowledge-base error:", error)
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 })
  }
}
