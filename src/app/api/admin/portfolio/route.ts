import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-admin"

export const dynamic = "force-dynamic"

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
    console.log("[Portfolio API] POST received:", JSON.stringify({ ...body, images: `${(body.images || []).length} images` }))
    const item = await prisma.portfolio.create({ data: body })
    console.log("[Portfolio API] Created portfolio:", item.id)
    return NextResponse.json({ data: item })
  } catch (error) {
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

    console.log("[Portfolio API] Updating portfolio:", id)
    const item = await prisma.portfolio.update({
      where: { id },
      data,
    })
    console.log("[Portfolio API] Updated portfolio:", item.id)
    return NextResponse.json({ data: item })
  } catch (error) {
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
