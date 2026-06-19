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
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const { image, sourceType, portfolioId, isActive } = body

    if (!image && sourceType !== "portfolio") {
      return NextResponse.json({ error: "Image wajib diisi" }, { status: 400 })
    }

    const maxOrder = await prisma.heroSlide.aggregate({ _max: { order: true } })
    const nextOrder = (maxOrder._max.order ?? -1) + 1

    const slide = await prisma.heroSlide.create({
      data: {
        image: sourceType === "portfolio" ? "" : image,
        order: nextOrder,
        isActive: isActive ?? true,
        sourceType: sourceType || "custom",
        portfolioId: portfolioId || null,
      },
      include: {
        portfolio: {
          select: { id: true, title: true, slug: true, coverImage: true },
        },
      },
    })

    return NextResponse.json({ data: slide }, { status: 201 })
  } catch (error) {
    console.error("POST /api/admin/hero-slides error:", error)
    return NextResponse.json({ error: "Gagal membuat hero slide" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()

    // Bulk reorder
    if (body.slides && Array.isArray(body.slides)) {
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
      await prisma.heroSlide.delete({ where: { id } })
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
