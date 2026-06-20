import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-admin"

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

    for (const [key, value] of Object.entries(validation.data)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate settings" },
      { status: 500 }
    )
  }
}
