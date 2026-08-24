import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, isPrismaErrorCode } from "@/lib/api-admin"
import { revalidatePublic } from "@/lib/revalidate"
import { cleanupUnusedImages } from "@/lib/media-usage"
import { resolvePublishedAt } from "@/lib/article-published-at"

export const dynamic = "force-dynamic"

const articleCreateSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  category: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDesc: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
})

const articleUpdateSchema = articleCreateSchema.partial()

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
      const item = await prisma.article.findUnique({ where: { id } })
      if (!item) {
        return NextResponse.json(
          { error: "Artikel tidak ditemukan" },
          { status: 404 }
        )
      }
      return NextResponse.json({ data: item })
    }

    const items = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ data: items })
  } catch (error) {
    console.error("GET /api/admin/articles error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data artikel" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const validation = articleCreateSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    // Artikel yang langsung terbit tanpa tanggal akan tenggelam ke dasar
    // daftar blog dan kehilangan datePublished — lihat lib/article-published-at.
    const publishedAt = resolvePublishedAt({
      isPublished: validation.data.isPublished,
      incoming: validation.data.publishedAt,
    })

    const item = await prisma.article.create({
      data: { ...validation.data, ...(publishedAt ? { publishedAt } : {}) },
    })
    revalidatePublic("articles")
    return NextResponse.json({ data: item })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2002")) {
      return NextResponse.json(
        { error: "Slug sudah digunakan, silakan pilih slug lain" },
        { status: 409 }
      )
    }
    console.error("POST /api/admin/articles error:", error)
    return NextResponse.json(
      { error: "Gagal membuat artikel" },
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

    const validation = articleUpdateSchema.safeParse(data)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    // Tombol Draft/Published di halaman daftar hanya mengirim
    // `{ id, isPublished }`, jadi tanggal yang tersimpan harus dibaca dari
    // database — tidak bisa diandalkan datang dari pemanggil.
    const current = await prisma.article.findUnique({
      where: { id },
      select: { publishedAt: true },
    })
    if (!current) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 })
    }

    // `publishedAt` dikeluarkan dari data mentah lalu dipasang ulang HANYA
    // kalau aturannya memutuskan begitu. Tanpa pemisahan ini, `publishedAt:
    // null` yang dikirim pemanggil tetap lolos dan menghapus tanggal asli.
    const { publishedAt: dikirim, ...sisanya } = validation.data

    const publishedAt = resolvePublishedAt({
      isPublished: validation.data.isPublished,
      incoming: dikirim,
      existing: current.publishedAt,
    })

    const item = await prisma.article.update({
      where: { id },
      data: { ...sisanya, ...(publishedAt ? { publishedAt } : {}) },
    })
    revalidatePublic("articles")
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
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      )
    }
    console.error("PUT /api/admin/articles error:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate artikel" },
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

    // Dikumpulkan sebelum dihapus — lihat catatan di route portfolio.
    const item = await prisma.article.findUnique({
      where: { id },
      select: { thumbnail: true, ogImage: true },
    })

    await prisma.article.delete({ where: { id } })

    if (item) {
      await cleanupUnusedImages([item.thumbnail, item.ogImage])
    }

    revalidatePublic("articles")

    return NextResponse.json({ success: true })
  } catch (error) {
    if (isPrismaErrorCode(error, "P2025")) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      )
    }
    console.error("DELETE /api/admin/articles error:", error)
    return NextResponse.json(
      { error: "Gagal menghapus artikel" },
      { status: 500 }
    )
  }
}
