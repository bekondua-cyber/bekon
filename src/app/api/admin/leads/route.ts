import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, isPrismaErrorCode } from "@/lib/api-admin"

export const dynamic = "force-dynamic"

const leadUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  service: z.string().optional().nullable(),
  budget: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  status: z.enum(["new", "contacted", "survey", "proposal", "closing", "cancelled"]).optional(),
  notes: z.string().optional().nullable(),
})

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
    const items = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ data: items })
  } catch (error) {
    console.error("GET /api/admin/leads error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data leads" },
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

    const validation = leadUpdateSchema.safeParse(data)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const item = await prisma.lead.update({
      where: { id },
      data: validation.data,
    })
    return NextResponse.json({ data: item })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json(
        { error: "Lead tidak ditemukan" },
        { status: 404 }
      )
    }
    console.error("PUT /api/admin/leads error:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate lead" },
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

    await prisma.lead.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json(
        { error: "Lead tidak ditemukan" },
        { status: 404 }
      )
    }
    console.error("DELETE /api/admin/leads error:", error)
    return NextResponse.json(
      { error: "Gagal menghapus lead" },
      { status: 500 }
    )
  }
}
