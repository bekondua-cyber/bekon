import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-admin"
import { revalidateAllPublic } from "@/lib/revalidate"

const settingsSchema = z.record(z.string(), z.string())

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const validation = settingsSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: validation.error.issues.map((e) => e.message) },
        { status: 400 }
      )
    }

    // Dulu ini `await` di dalam loop: dengan 27 kunci pengaturan di produksi,
    // satu klik simpan berarti 27 perjalanan bolak-balik berurutan ke Neon.
    // Satu transaksi juga membuat penyimpanan bersifat semua-atau-tidak.
    await prisma.$transaction(
      Object.entries(validation.data).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    )

    // Seluruh situs, bukan satu rute: settings mengisi Footer, dan Footer ada
    // di setiap halaman. Mengganti satu nomor WhatsApp atau alamat kantor
    // menyentuh semuanya sekaligus.
    revalidateAllPublic()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate settings" },
      { status: 500 }
    )
  }
}
