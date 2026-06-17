import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const items = await prisma.testimonial.findMany({
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json({ data: items })
  } catch (error) {
    console.error("GET /api/admin/testimonials error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data testimoni" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const item = await prisma.testimonial.create({ data: body })
    return NextResponse.json({ data: item })
  } catch (error) {
    console.error("POST /api/admin/testimonials error:", error)
    return NextResponse.json(
      { error: "Gagal membuat testimoni" },
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

    const item = await prisma.testimonial.update({
      where: { id },
      data,
    })
    return NextResponse.json({ data: item })
  } catch (error) {
    console.error("PUT /api/admin/testimonials error:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate testimoni" },
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

    await prisma.testimonial.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/testimonials error:", error)
    return NextResponse.json(
      { error: "Gagal menghapus testimoni" },
      { status: 500 }
    )
  }
}
