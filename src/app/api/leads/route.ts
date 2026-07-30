import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"

const leadSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Format nomor telepon tidak valid"),
  email: z.string().email("Format email tidak valid").max(200).optional().or(z.literal("")),
  service: z.string().max(100).optional().default(""),
  budget: z.string().max(100).optional().default(""),
  location: z.string().max(200).optional().default(""),
  message: z.string().min(10, "Pesan minimal 10 karakter").max(1000, "Pesan maksimal 1000 karakter"),
  company_website: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const identifier = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const limit = rateLimit(identifier, 5, 60000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validation = leadSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((e: { message: string }) => e.message)
      return NextResponse.json(
        { error: errors[0] },
        { status: 400 }
      )
    }

    const { name, phone, email, service, budget, location, message, company_website } = validation.data

    if (company_website) {
      // Honeypot triggered — pretend success so the bot doesn't know it was blocked
      return NextResponse.json({ success: true, message: "Pesan berhasil dikirim" })
    }

    await prisma.lead.create({
      data: {
        name,
        phone,
        email: email || null,
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
