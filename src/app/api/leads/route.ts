import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, service, budget, location, message } = body

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Nama dan nomor telepon wajib diisi" },
        { status: 400 }
      )
    }

    await prisma.lead.create({
      data: {
        name,
        phone,
        service: service || null,
        budget: budget || null,
        location: location || null,
        message: message || null,
        status: "new",
      },
    })

    return NextResponse.json({ success: true, message: "Pesan berhasil dikirim" })
  } catch (error) {
    console.error("POST /api/leads error:", error)
    return NextResponse.json(
      { error: "Gagal mengirim pesan" },
      { status: 500 }
    )
  }
}
