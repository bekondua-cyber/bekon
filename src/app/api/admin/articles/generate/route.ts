import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/api-admin"
import { rateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/request-ip"
import { generateCompletion } from "@/lib/ai"
import { resolveGeminiModel } from "@/lib/ai/model-setting"
import { parseAiJson } from "@/lib/ai/parse"
import { BEKON_BRAND_CONTEXT, BEKON_SERVICE_AREA } from "@/lib/ai/brand"

export const dynamic = "force-dynamic"

const requestSchema = z.object({
  topic: z.string().min(3, "Topik minimal 3 karakter").max(200),
  category: z.string().optional(),
  keywords: z.string().optional(),
})

const resultSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  contentHtml: z.string(),
  metaTitle: z.string(),
  metaDesc: z.string(),
})

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const identifier = getClientIp(request)
    const limit = rateLimit(`ai-article:${identifier}`, 5, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan generate AI. Coba lagi nanti." }, { status: 429 })
    }

    const body = await request.json()
    const validation = requestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message || "Data tidak valid" }, { status: 400 })
    }

    const { topic, category, keywords } = validation.data

    const raw = await generateCompletion({
      model: await resolveGeminiModel(),
      json: true,
      temperature: 0.8,
      maxTokens: 3000,
      messages: [
        {
          role: "system",
          content: `Kamu adalah penulis konten SEO profesional. ${BEKON_BRAND_CONTEXT} Wilayah layanan: ${BEKON_SERVICE_AREA}. Tulis dalam Bahasa Indonesia yang natural, informatif, dan SEO-friendly.

Kembalikan HANYA JSON valid dengan struktur persis berikut, tanpa markdown code fence:
{
  "title": "judul artikel menarik dan SEO-friendly",
  "slug": "url-slug-format-kebab-case",
  "excerpt": "ringkasan singkat 1-2 kalimat",
  "contentHtml": "konten artikel lengkap dalam format HTML (gunakan <h2>, <p>, <ul> dsb), minimal 400 kata",
  "metaTitle": "meta title untuk SEO, maks 60 karakter",
  "metaDesc": "meta description untuk SEO, maks 160 karakter"
}`,
        },
        {
          role: "user",
          content: `Topik: ${topic}${category ? `\nKategori: ${category}` : ""}${keywords ? `\nKata kunci: ${keywords}` : ""}`,
        },
      ],
    })

    const result = parseAiJson(raw, resultSchema)

    return NextResponse.json({
      data: {
        ...result,
        slug: slugify(result.slug || result.title),
      },
    })
  } catch (error) {
    console.error("POST /api/admin/articles/generate error:", error)
    const message = error instanceof Error ? error.message : "Gagal generate artikel"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
