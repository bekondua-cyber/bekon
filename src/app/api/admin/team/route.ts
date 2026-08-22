import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, isPrismaErrorCode } from "@/lib/api-admin"
import { revalidatePublic } from "@/lib/revalidate"

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

/**
 * Penyusunan ulang lewat drag and drop mengirim SELURUH daftar id sesuai urutan
 * barunya, bukan satu id dengan sortOrder baru. Alasannya: memindahkan satu
 * kartu menggeser posisi semua kartu setelahnya, jadi mengirim satu per satu
 * berarti puluhan request yang bisa datang tidak berurutan dan meninggalkan
 * urutan setengah jadi. Batas 500 menjaga transaksi tetap wajar.
 */
const teamReorderSchema = z.object({
  order: z.array(z.string().min(1)).min(1).max(500),
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
    // createdAt jadi pemutus seri: sebelum admin pernah menyeret kartu, semua
    // sortOrder masih 0 dan urutan tanpa pemutus seri bisa berbeda antara panel
    // admin dan halaman publik — persis hal yang membuat drag terasa "tidak
    // tersimpan". Halaman publik memakai pemutus seri yang sama.
    const items = await prisma.teamMember.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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
    revalidatePublic("team")
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
    revalidatePublic("team")
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

export async function PATCH(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const validation = teamReorderSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const { order } = validation.data

    if (new Set(order).size !== order.length) {
      return NextResponse.json(
        { error: "Urutan memuat ID ganda" },
        { status: 400 }
      )
    }

    // Kalau ada anggota yang sudah dihapus di tab lain, urutan yang dikirim
    // sudah basi. Tolak seluruhnya daripada menulis sortOrder setengah jadi.
    const found = await prisma.teamMember.count({ where: { id: { in: order } } })
    if (found !== order.length) {
      return NextResponse.json(
        { error: "Sebagian anggota tim tidak ditemukan, muat ulang halaman" },
        { status: 409 }
      )
    }

    await prisma.$transaction(
      order.map((id, index) =>
        prisma.teamMember.update({ where: { id }, data: { sortOrder: index } })
      )
    )
    revalidatePublic("team")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PATCH /api/admin/team error:", error)
    return NextResponse.json(
      { error: "Gagal menyimpan urutan tim" },
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
    revalidatePublic("team")
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
