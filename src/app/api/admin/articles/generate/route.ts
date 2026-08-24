import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/api-admin"
import { rateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/request-ip"
import { generateCompletion } from "@/lib/ai"
import { resolveGeminiModel } from "@/lib/ai/model-setting"
import { parseAiJson } from "@/lib/ai/parse"
import { BEKON_BRAND_CONTEXT, BEKON_SERVICE_AREA } from "@/lib/ai/brand"
import { auditInternalLinks, countWords, linkableTargets } from "@/lib/ai/article-links-guard"

export const dynamic = "force-dynamic"

/**
 * WAJIB ADA. Tanpa deklarasi ini rute memakai batas bawaan platform, yang jauh
 * lebih pendek daripada waktu yang dibutuhkan menulis artikel 800-1200 kata —
 * fungsinya dimatikan di tengah jalan dan admin melihat error 5xx tanpa
 * penjelasan. 60 adalah maksimum yang boleh diminta di paket Hobby, dan harus
 * lebih besar dari AI_CHAIN_DEADLINE_MS (50 detik).
 */
export const maxDuration = 60

/**
 * Panjang minimum yang dianggap layak terbit.
 *
 * Ke-13 artikel yang sudah ada di produksi rata-rata cuma 71 kata — ditulis
 * manual sebagai postingan foto, bukan lewat generator ini. Konten setipis itu
 * praktis tidak meraih peringkat, jadi tautan internal sebagus apa pun tidak
 * punya trafik untuk disalurkan. Ambang ini mencegah artikel baru mengulangi
 * pola yang sama.
 */
const MIN_WORDS = 600

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
      // Artikel 800-1200 kata plus struktur JSON butuh ruang jauh lebih besar
      // daripada 3000 token. Kekurangan token membuat respons terpotong di
      // tengah dan seluruh generate gagal di parser.
      maxTokens: 8000,
      messages: [
        {
          role: "system",
          content: `Kamu adalah penulis konten SEO profesional. ${BEKON_BRAND_CONTEXT} Wilayah layanan: ${BEKON_SERVICE_AREA}. Tulis dalam Bahasa Indonesia yang natural, informatif, dan SEO-friendly.

PANJANG DAN STRUKTUR (wajib):
- Minimal ${MIN_WORDS} kata, idealnya 800-1200 kata. Artikel pendek tidak akan diterima.
- Bagi dengan 4-6 subjudul <h2> yang menjawab pertanyaan nyata calon klien.
- Sertakan minimal satu <ul> berisi poin praktis (misal daftar material, langkah, atau kisaran pertimbangan).
- Tutup dengan satu <h2> berisi ringkasan atau langkah selanjutnya.
- Sebut konteks lokal (iklim, kebiasaan bangunan, harga material di Banten) supaya tidak terasa generik.

TAUTAN INTERNAL (wajib, 2-4 buah):
Sisipkan tautan yang relevan secara alami di dalam kalimat, memakai anchor text
deskriptif — BUKAN "klik di sini". Hanya boleh menaut ke alamat berikut, jangan
mengarang alamat lain:
${linkableTargets().map((t) => `- ${t}`).join("\n")}

Contoh yang benar: <a href="/layanan/bangun-rumah-renovasi">jasa renovasi rumah di Serang</a>

JANGAN mengarang harga pasti, janji waktu pengerjaan, atau testimoni.
Untuk angka biaya, gunakan kisaran dan sebutkan bahwa perlu survei.

Kembalikan HANYA JSON valid dengan struktur persis berikut, tanpa markdown code fence:
{
  "title": "judul artikel menarik dan SEO-friendly",
  "slug": "url-slug-format-kebab-case",
  "excerpt": "ringkasan singkat 1-2 kalimat",
  "contentHtml": "konten artikel lengkap dalam HTML (<h2>, <p>, <ul>, <li>, <a>)",
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

    // Hasil AI TIDAK dipercaya begitu saja. Model rutin mengarang alamat yang
    // terdengar masuk akal — `/layanan/desain-taman` misalnya — dan tautan
    // internal yang mati lebih merugikan daripada tidak ada tautan sama sekali.
    const audit = auditInternalLinks(result.contentHtml)
    const words = countWords(audit.html)

    if (audit.removed.length > 0) {
      console.warn("Tautan karangan dilucuti dari artikel AI:", audit.removed)
    }

    // Ditolak, bukan diam-diam diterima: artikel tipis persis masalah yang
    // sedang kita hindari, dan admin lebih baik menekan generate sekali lagi
    // daripada menerbitkan sesuatu yang tidak akan pernah meraih peringkat.
    if (words < MIN_WORDS) {
      return NextResponse.json(
        {
          error: `Artikel yang dihasilkan hanya ${words} kata, di bawah minimal ${MIN_WORDS}. Coba generate ulang atau persempit topiknya.`,
          words,
        },
        { status: 422 }
      )
    }

    return NextResponse.json({
      data: {
        ...result,
        contentHtml: audit.html,
        slug: slugify(result.slug || result.title),
      },
      meta: {
        words,
        internalLinks: audit.kept.filter((h) => h.startsWith("/")).length,
        removedLinks: audit.removed.length,
      },
    })
  } catch (error) {
    console.error("POST /api/admin/articles/generate error:", error)
    const message = error instanceof Error ? error.message : "Gagal generate artikel"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
