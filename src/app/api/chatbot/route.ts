import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"
import { generateCompletion } from "@/lib/ai"
import { services } from "@/data/services"
import { siteConfig } from "@/data/site-config"
import { normalizeWA } from "@/lib/utils"

export const dynamic = "force-dynamic"

const FALLBACK_MARKER = "[TIDAK_YAKIN]"

const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(10)
    .optional(),
})

async function buildSystemPrompt(): Promise<string> {
  const [knowledgeEntries, portfolios, testimonials, settings] = await Promise.all([
    prisma.knowledgeEntry.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
      select: { question: true, answer: true, category: true },
    }),
    prisma.portfolio.findMany({
      where: { isPublished: true },
      select: { title: true, category: true, location: true },
      take: 20,
    }),
    prisma.testimonial.findMany({
      where: { isPublished: true },
      select: { clientName: true, content: true, projectType: true },
      take: 10,
    }),
    prisma.setting.findMany(),
  ])

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value || ""]))
  const waNumber = normalizeWA(settingsMap.wa_admin_1 || siteConfig.whatsapp1)
  const waLink = `https://wa.me/${waNumber}`

  const knowledgeText = knowledgeEntries
    .map((k) => `Q: ${k.question}\nA: ${k.answer}`)
    .join("\n\n")

  const servicesText = services
    .map((s) => `- ${s.title}: ${s.short_desc}`)
    .join("\n")

  const portfolioText = portfolios
    .map((p) => `- ${p.title} (${p.category || "umum"}, ${p.location || "-"})`)
    .join("\n")

  const testimonialText = testimonials
    .map((t) => `- ${t.clientName} (${t.projectType || "-"}): "${t.content}"`)
    .join("\n")

  return `Kamu adalah asisten AI resmi BEKON (Bangun Eka Konstruksi), kontraktor dan arsitek profesional di Serang, Cilegon, Banten sejak 2009. Jawab pertanyaan calon klien dengan ramah, singkat, dan informatif dalam Bahasa Indonesia.

ATURAN PENTING:
1. JANGAN mengarang harga, estimasi biaya, atau janji waktu pengerjaan spesifik. Untuk pertanyaan harga/RAB, arahkan ke konsultasi WhatsApp.
2. Jika pertanyaan di luar topik bisnis BEKON, atau kamu tidak yakin dengan jawabannya, balas HANYA dengan teks "${FALLBACK_MARKER}" tanpa tambahan apapun.
3. Jawaban singkat dan padat (maksimal 4-5 kalimat).

LAYANAN BEKON:
${servicesText}

DATA TANYA-JAWAB (gunakan sebagai referensi utama):
${knowledgeText || "(belum ada data)"}

CONTOH PORTFOLIO:
${portfolioText || "(belum ada data)"}

TESTIMONI KLIEN:
${testimonialText || "(belum ada data)"}

Kontak WhatsApp untuk konsultasi lebih lanjut: ${waLink}`
}

export async function POST(request: NextRequest) {
  try {
    const identifier = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const limit = rateLimit(`chatbot:${identifier}`, 10, 60000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak pertanyaan. Silakan coba lagi sebentar." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validation = chatSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Pesan tidak valid" }, { status: 400 })
    }

    const { message, history = [] } = validation.data
    const systemPrompt = await buildSystemPrompt()

    const settings = await prisma.setting.findMany()
    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value || ""]))
    const waNumber = normalizeWA(settingsMap.wa_admin_1 || siteConfig.whatsapp1)
    const fallbackReply = `Maaf, untuk pertanyaan ini tim kami akan lebih membantu jika berbicara langsung. Silakan hubungi kami via WhatsApp: https://wa.me/${waNumber}`

    const reply = await generateCompletion({
      temperature: 0.5,
      maxTokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: message },
      ],
    })

    const finalReply = reply.includes(FALLBACK_MARKER) ? fallbackReply : reply.trim()

    return NextResponse.json({ reply: finalReply })
  } catch (error) {
    console.error("POST /api/chatbot error:", error)
    return NextResponse.json(
      { error: "Maaf, chatbot sedang mengalami gangguan. Silakan hubungi kami via WhatsApp." },
      { status: 502 }
    )
  }
}
