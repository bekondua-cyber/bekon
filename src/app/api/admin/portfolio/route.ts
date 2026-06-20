import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-admin"

export const dynamic = "force-dynamic"

function isPrismaErrorCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === code
}

const portfolioCreateSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  category: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  areaSqm: z.number().optional().nullable(),
  year: z.number().int().optional().nullable(),
  description: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  coverImage: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  beforeImage: z.string().optional().nullable(),
  afterImage: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDesc: z.string().optional().nullable(),
})

const portfolioUpdateSchema = portfolioCreateSchema.partial()

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
      const item = await prisma.portfolio.findUnique({ where: { id } })
      if (!item) {
        return NextResponse.json(
          { error: "Portfolio tidak ditemukan" },
          { status: 404 }
        )
      }
      return NextResponse.json({ data: item })
    }

    const items = await prisma.portfolio.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ data: items })
  } catch (error) {
    console.error("GET /api/admin/portfolio error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data portfolio" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const validation = portfolioCreateSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    console.log("[Portfolio API] POST received:", JSON.stringify({ ...body, images: `${(body.images || []).length} images` }))
    const item = await prisma.portfolio.create({ data: validation.data })
    console.log("[Portfolio API] Created portfolio:", item.id)
    return NextResponse.json({ data: item })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2002")) {
      return NextResponse.json(
        { error: "Slug sudah digunakan, silakan pilih slug lain" },
        { status: 409 }
      )
    }
    console.error("POST /api/admin/portfolio error:", error)
    return NextResponse.json(
      { error: "Gagal membuat portfolio" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    console.log("[Portfolio API] PUT received, id:", body.id)
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID wajib diisi" },
        { status: 400 }
      )
    }

    const validation = portfolioUpdateSchema.safeParse(data)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    console.log("[Portfolio API] Updating portfolio:", id)
    const item = await prisma.portfolio.update({
      where: { id },
      data: validation.data,
    })
    console.log("[Portfolio API] Updated portfolio:", item.id)
    return NextResponse.json({ data: item })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2002")) {
      return NextResponse.json(
        { error: "Slug sudah digunakan, silakan pilih slug lain" },
        { status: 409 }
      )
    }
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json(
        { error: "Portfolio tidak ditemukan" },
        { status: 404 }
      )
    }
    console.error("PUT /api/admin/portfolio error:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate portfolio" },
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

    if (id) {
      await prisma.portfolio.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    const body = await request.json().catch(() => ({}))
    if (body.ids && Array.isArray(body.ids) && body.ids.length > 0) {
      await prisma.portfolio.deleteMany({ where: { id: { in: body.ids } } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "ID atau ids wajib diisi" },
      { status: 400 }
    )
  } catch (error) {
    console.error("DELETE /api/admin/portfolio error:", error)
    return NextResponse.json(
      { error: "Gagal menghapus portfolio" },
      { status: 500 }
    )
  }
}
