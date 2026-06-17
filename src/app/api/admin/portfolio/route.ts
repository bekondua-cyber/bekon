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
    const item = await prisma.portfolio.create({ data: body })
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
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID wajib diisi" },
        { status: 400 }
      )
    }

    const item = await prisma.portfolio.update({
      where: { id },
      data,
    })
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

    if (!id) {
      return NextResponse.json(
        { error: "ID wajib diisi" },
        { status: 400 }
      )
    }

    await prisma.portfolio.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/portfolio error:", error)
    return NextResponse.json(
      { error: "Gagal menghapus portfolio" },
      { status: 500 }
    )
  }
}
