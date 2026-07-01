import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, isPrismaErrorCode } from "@/lib/api-admin"

export const dynamic = "force-dynamic"

const heroSlideCreateSchema = z
  .object({
    image: z.string().optional().nullable(),
    title: z.string().optional().nullable(),
    subtitle: z.string().optional().nullable(),
    ctaText: z.string().optional().nullable(),
    ctaLink: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    sourceType: z.enum(["custom", "portfolio"]).optional(),
    portfolioId: z.string().optional().nullable(),
  })
  .refine((data) => !!data.image || data.sourceType === "portfolio", {
    message: "Image wajib diisi",
    path: ["image"],
  })

const heroSlideUpdateSchema = z.object({
  image: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  sourceType: z.enum(["custom", "portfolio"]).optional(),
  portfolioId: z.string().nullable().optional(),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  ctaText: z.string().optional().nullable(),
  ctaLink: z.string().optional().nullable(),
})

const reorderSchema = z.object({
  slides: z.array(z.object({ id: z.string(), order: z.number().int() })),
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

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const slide = await prisma.heroSlide.findUnique({
        where: { id },
        include: {
          portfolio: {
            select: { id: true, title: true, slug: true, coverImage: true },
          },
        },
      })
      if (!slide) {
        return NextResponse.json({ error: "Hero slide not found" }, { status: 404 })
      }
      return NextResponse.json({ data: slide })
    }

    const slides = await prisma.heroSlide.findMany({
      orderBy: { order: "asc" },
      include: {
        portfolio: {
          select: { id: true, title: true, slug: true, coverImage: true },
        },
      },
    })
    return NextResponse.json({ data: slides })
  } catch (error) {
    console.error("GET /api/admin/hero-slides error:", error)
    return NextResponse.json({ error: "Gagal memuat hero slides" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) {
    return unauthorized
  }

  try {
    const body = await request.json()
    const validation = heroSlideCreateSchema.safeParse(body)
    if (!validation.success) {
      console.error("[Hero API] Validation failed:", validation.error.issues)
      return validationErrorResponse(validation.error)
    }

    const { image, sourceType, portfolioId, isActive } = validation.data

    const maxOrder = await prisma.heroSlide.aggregate({ _max: { order: true } })
    const nextOrder = (maxOrder._max.order ?? -1) + 1

    const data = {
      image: image || "",
      order: nextOrder,
      isActive: isActive ?? true,
      sourceType: sourceType || "custom",
      portfolioId: portfolioId || null,
    }
    const slide = await prisma.heroSlide.create({
      data,
      include: {
        portfolio: {
          select: { id: true, title: true, slug: true, coverImage: true },
        },
      },
    })

    return NextResponse.json({ data: slide }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    const code = error instanceof Error && "code" in error ? (error as { code: string }).code : "UNKNOWN"
    console.error("[Hero API] ERROR caught:", { message, code })
    return NextResponse.json(
      {
        error: "Gagal membuat hero slide",
        details: message,
        code,
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    // Bulk reorder
    if (body.slides && Array.isArray(body.slides)) {
      const reorderValidation = reorderSchema.safeParse(body)
      if (!reorderValidation.success) {
        return validationErrorResponse(reorderValidation.error)
      }

      const updates = reorderValidation.data.slides.map((s) =>
        prisma.heroSlide.update({
          where: { id: s.id },
          data: { order: s.order },
        })
      )
      await prisma.$transaction(updates)
      return NextResponse.json({ success: true })
    }

    const { id, ...rest } = body
    if (!id) {
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 })
    }

    const validation = heroSlideUpdateSchema.safeParse(rest)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    const { image, order, isActive, sourceType, portfolioId } = validation.data

    const existing = await prisma.heroSlide.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 })
    }

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        ...(image !== undefined && { image }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
        ...(sourceType !== undefined && { sourceType }),
        ...(portfolioId !== undefined && { portfolioId }),
      },
      include: {
        portfolio: {
          select: { id: true, title: true, slug: true, coverImage: true },
        },
      },
    })

    return NextResponse.json({ data: slide })
  } catch (error) {
    console.error("PUT /api/admin/hero-slides error:", error)
    return NextResponse.json({ error: "Gagal mengupdate hero slide" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (id) {
      try {
        await prisma.heroSlide.delete({ where: { id } })
      } catch (deleteError) {
        if (isPrismaErrorCode(deleteError, "P2025")) {
          return NextResponse.json(
            { error: "Hero slide tidak ditemukan (kemungkinan sudah terhapus sebelumnya)" },
            { status: 404 }
          )
        }
        throw deleteError
      }
      return NextResponse.json({ success: true })
    }

    const body = await request.json().catch(() => ({}))
    const ids = body.ids
    if (ids && Array.isArray(ids) && ids.length > 0) {
      await prisma.heroSlide.deleteMany({ where: { id: { in: ids } } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "ID atau ids wajib diisi" }, { status: 400 })
  } catch (error) {
    console.error("DELETE /api/admin/hero-slides error:", error)
    return NextResponse.json({ error: "Gagal menghapus hero slide" }, { status: 500 })
  }
}
