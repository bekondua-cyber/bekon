import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-admin"
import { rateLimit } from "@/lib/rate-limit"
import { generateCompletion } from "@/lib/ai"
import { getCategory } from "@/lib/video-categories"

export const dynamic = "force-dynamic"

const requestSchema = z.object({
  category: z.string().min(1),
  portfolioId: z.string().optional(),
  characterId: z.string().optional(),
  seedTopic: z.string().max(300).optional(),
})

const ideasSchema = z.object({
  ideas: z.array(z.string()).min(1),
})

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const identifier = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const limit = rateLimit(`ai-video:${identifier}`, 10, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const body = await request.json()
    const validation = requestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 })
    }

    const { category, portfolioId, characterId, seedTopic } = validation.data
    const categoryInfo = getCategory(category)

    let portfolioContext = ""
    if (portfolioId) {
      const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } })
      if (portfolio) {
        portfolioContext = `Proyek referensi: ${portfolio.title} (${portfolio.category || "umum"}, ${portfolio.location || "-"}). ${portfolio.description || ""}`
      }
    }

    let characterContext = ""
    if (characterId) {
      const character = await prisma.videoCharacter.findUnique({ where: { id: characterId } })
      if (character) {
        characterContext = `Karakter yang akan tampil: ${character.name} (${character.gender || "-"}, ${character.age ? `${character.age} tahun` : "usia tidak diketahui"}).`
      }
    }

    const raw = await generateCompletion({
      json: true,
      temperature: 0.9,
      maxTokens: 800,
      messages: [
        {
          role: "system",
          content: `Kamu adalah sutradara konten & prompt engineer untuk BEKON, kontraktor dan arsitek di Serang, Banten sejak 2009, spesialis desain eksterior, interior, bangun rumah, renovasi, kost & ruko.

Kategori video yang diminta: "${categoryInfo.label}" — ${categoryInfo.description}
Panduan konsep kategori ini: ${categoryInfo.promptGuidance}

Kembalikan HANYA JSON valid: { "ideas": ["ide 1", "ide 2", "ide 3", "ide 4", "ide 5"] }
Setiap ide singkat (1 kalimat), spesifik, sesuai kategori di atas, dan menarik untuk audiens yang tertarik bangun/renovasi rumah.`,
        },
        {
          role: "user",
          content: `${portfolioContext}\n${characterContext}\n${seedTopic ? `Topik/arahan: ${seedTopic}` : "Berikan ide konten video sesuai kategori di atas."}`,
        },
      ],
    })

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error("AI tidak mengembalikan JSON valid")
      parsed = JSON.parse(match[0])
    }

    const result = ideasSchema.safeParse(parsed)
    if (!result.success) {
      return NextResponse.json({ error: "Format hasil AI tidak sesuai, coba lagi" }, { status: 502 })
    }

    return NextResponse.json({ data: result.data.ideas })
  } catch (error) {
    console.error("POST /api/admin/video-prompt/ideas error:", error)
    const message = error instanceof Error ? error.message : "Gagal generate ide"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
