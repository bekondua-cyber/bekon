import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-admin"

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
  console.log("[Hero API] === POST /api/admin/hero-slides ===")

  const unauthorized = await requireAdmin()
  if (unauthorized) {
    console.log("[Hero API] Unauthorized access")
    return unauthorized
  }

  try {
    const body = await request.json()
    console.log("[Hero API] Request body:", JSON.stringify({
      ...body,
      image: body.image ? `${body.image.slice(0, 60)}...` : "KOSONG",
    }))

    const { image, sourceType, portfolioId, isActive } = body

    if (!image && sourceType !== "portfolio") {
      console.error("[Hero API] Validation failed: image kosong")
      return NextResponse.json({ error: "Image wajib diisi" }, { status: 400 })
    }

    console.log("[Hero API] Validation passed, querying max order...")
    const maxOrder = await prisma.heroSlide.aggregate({ _max: { order: true } })
    const nextOrder = (maxOrder._max.order ?? -1) + 1
    console.log("[Hero API] Max order:", maxOrder._max.order, "next:", nextOrder)

    const data = {
      image: image || "",
      order: nextOrder,
      isActive: isActive ?? true,
      sourceType: sourceType || "custom",
      portfolioId: portfolioId || null,
    }
    console.log("[Hero API] Prisma create data:", { ...data, image: data.image ? `${data.image.slice(0, 60)}...` : "KOSONG" })

    console.log("[Hero API] Executing Prisma create...")
    const slide = await prisma.heroSlide.create({
      data,
      include: {
        portfolio: {
          select: { id: true, title: true, slug: true, coverImage: true },
        },
      },
    })

    console.log("[Hero API] Prisma create SUCCESS, slide ID:", slide.id)
    console.log("[Hero API] Return 201 to client")
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
    console.log("[Hero Slides API] PUT received:", JSON.stringify(body))

    // Bulk reorder
    if (body.slides && Array.isArray(body.slides)) {
      console.log("[Hero Slides API] Bulk reorder:", body.slides.length, "slides")
      const updates = body.slides.map((s: { id: string; order: number }) =>
        prisma.heroSlide.update({
          where: { id: s.id },
          data: { order: s.order },
        })
      )
      await prisma.$transaction(updates)
      return NextResponse.json({ success: true })
    }

    const { id, image, order, isActive, sourceType, portfolioId } = body
    if (!id) {
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 })
    }

    console.log("[Hero Slides API] Updating slide:", id)
    const existing = await prisma.heroSlide.findUnique({ where: { id } })
    if (!existing) {
      console.log("[Hero Slides API] Slide not found:", id)
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
    console.log("[Hero Slides API] DELETE received, id:", id)

    if (id) {
      console.log("[Hero Slides API] Deleting single slide:", id)
      await prisma.heroSlide.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    const body = await request.json().catch(() => ({}))
    const ids = body.ids
    console.log("[Hero Slides API] Bulk delete, ids:", ids)
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
