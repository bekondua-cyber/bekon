import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/request-ip"
import { generateCompletion } from "@/lib/ai"
import { resolveGeminiModelFromSettings } from "@/lib/ai/model-setting"
import { BEKON_BRAND_CONTEXT, BEKON_SERVICE_AREA } from "@/lib/ai/brand"
import { trustedHistory, turnNumber, resolveReply, FALLBACK_MARKER } from "@/lib/chat-history"
import { services } from "@/data/services"
import { siteConfig } from "@/data/site-config"
import { normalizeWA } from "@/lib/utils"

export const dynamic = "force-dynamic"

/** Lihat catatan di src/lib/ai/fetch-with-timeout.ts — harus lebih besar dari
 *  AI_CHAIN_DEADLINE_MS, kalau tidak rantai fallback dipotong platform. */
export const maxDuration = 60

const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        // Tanpa batas ini, sepuluh pesan riwayat bisa berisi teks sepanjang
        // apa pun — endpoint publik yang langsung jadi biaya token AI.
        content: z.string().max(1000),
      })
    )
    .max(10)
    .optional(),
})

/**
 * Satu-satunya tempat alamat situs dirakit di route ini. Pola `env ||
 * domain produksi` mengikuti yang sudah dipakai app/robots.ts.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bangunrumahbekon.com"

async function buildSystemPrompt(turn: number): Promise<{
  systemPrompt: string
  waLink: string
  model: string
}> {
  const [knowledgeEntries, settings] = await Promise.all([
    prisma.knowledgeEntry.findMany({
      where: { isPublished: true },
      // Tiebreaker `createdAt` bukan hiasan: SELURUH entri saat ini bernilai
      // sortOrder 0 (form admin tidak punya kolom urutan), dan Postgres tidak
      // menjamin urutan baris yang nilainya seri. Tanpa ini isi prompt bisa
      // berbeda antar-request, sehingga jawaban ikut berubah-ubah.
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { question: true, answer: true },
      // Dulu 30 — dan jumlah entri published memang PAS 30, jadi entri
      // berikutnya akan lenyap dari prompt tanpa peringatan apa pun di admin.
      take: 100,
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

  /**
   * Model tidak melihat balasannya sendiri (lihat trustedHistory), jadi tanpa
   * baris ini ia menyapa ulang dan menempelkan ajakan WhatsApp di SETIAP
   * giliran. Yang dikirim hanya angka giliran, bukan teks dari klien.
   */
  const turnNote =
    turn > 1
      ? `\n\nKONTEKS: ini giliran ke-${turn} dalam percakapan yang sedang berjalan. Kamu SUDAH menyapa dan SUDAH memberikan link WhatsApp di giliran sebelumnya — jangan diulang. Langsung jawab pertanyaannya.`
      : ""

  const systemPrompt = `Kamu adalah asisten AI resmi BEKON. ${BEKON_BRAND_CONTEXT} Wilayah layanan: ${BEKON_SERVICE_AREA}.

CARA MENJAWAB:
- Bahasa Indonesia yang ramah. Sapa calon klien dengan "Kak" — konsisten, jangan dicampur "Anda".
- MAKSIMAL 350 karakter (2-3 kalimat). Pertanyaan ya/tidak dijawab langsung, tanpa paragraf pengantar.
- Jangan mengulang salam, ajakan WhatsApp, atau disclaimer yang sudah kamu sampaikan sebelumnya.

ATURAN PENTING:
1. Angka harga HANYA boleh diambil dari DATA TANYA-JAWAB — jangan pernah mengarang tarif sendiri. Tarif per m² di sana adalah estimasi awal "mulai dari"; selalu sampaikan begitu, jangan sebagai harga pasti.
2. Kalau menghitung gambaran total dari luas bangunan, pakai HANYA tarif yang tertulis untuk jumlah lantai yang sesuai, dan sebut hasilnya sebagai gambaran awal yang masih menyesuaikan desain serta spesifikasi. Kalau ragu dengan hitungannya, jangan menebak — arahkan ke konsultasi WhatsApp.
3. Untuk yang tarifnya TIDAK tertulis di DATA TANYA-JAWAB — rumah 3 lantai ke atas, renovasi, dan permintaan RAB rinci — jangan sebut angka apa pun. Arahkan ke konsultasi WhatsApp.
4. Jangan menjanjikan durasi atau tanggal pengerjaan yang spesifik.
5. JANGAN pernah memutuskan sendiri apakah sebuah proyek bisa atau tidak bisa dikerjakan — berdasarkan lokasi, luas, kapasitas, maupun jadwal — kalau dasarnya tidak tertulis di DATA TANYA-JAWAB. Kalau ragu, arahkan ke WhatsApp. JANGAN menolak calon klien.
6. Kalau pertanyaannya tidak terjawab oleh DATA TANYA-JAWAB, balas HANYA dengan teks "${FALLBACK_MARKER}" tanpa tambahan apapun. Jangan merangkai jawaban dari entri yang topiknya berbeda.
7. Kalau pertanyaannya di luar topik bisnis BEKON, balas HANYA dengan teks "${FALLBACK_MARKER}".

LAYANAN BEKON:
${servicesText}

DATA TANYA-JAWAB (satu-satunya sumber fakta yang boleh kamu pakai):
${knowledgeText || "(belum ada data)"}

Halaman portfolio, bagikan kalau klien ingin melihat contoh hasil kerja: ${SITE_URL}/portfolio
Kontak WhatsApp untuk konsultasi lebih lanjut: ${waLink}${turnNote}`

  return {
    systemPrompt,
    waLink,
    // Tabel `setting` sudah ditarik di atas — dulu resolveGeminiModel()
    // menembaknya sekali lagi, dua round-trip berurutan untuk tiap pesan.
    model: resolveGeminiModelFromSettings(settingsMap),
  }
}

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIp(request)
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
    const { systemPrompt, waLink, model } = await buildSystemPrompt(turnNumber(history))
    const fallbackReply = `Maaf, untuk pertanyaan ini tim kami akan lebih membantu jika berbicara langsung. Silakan hubungi kami via WhatsApp: ${waLink}`

    const reply = await generateCompletion({
      model,
      // Bot FAQ yang harus setia pada knowledge base tidak butuh kreativitas;
      // 0.5 membuat jawaban untuk pertanyaan serupa berbeda-beda isinya.
      temperature: 0.3,
      // 500 token ≈ 375 kata — jauh di atas target 2-3 kalimat, dan headroom
      // sebesar itu sendiri yang mengundang jawaban bertele-tele.
      maxTokens: 220,
      messages: [
        { role: "system", content: systemPrompt },
        ...trustedHistory(history).map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: message },
      ],
    })

    const { reply: finalReply, usedFallback } = resolveReply(reply, fallbackReply)

    // Percakapan disimpan supaya token AI yang sudah dibayar menghasilkan data:
    // pertanyaan apa yang sering muncul, dan mana yang belum bisa dijawab
    // (usedFallback) sehingga layak ditambahkan ke Knowledge Base.
    // Kegagalan pencatatan tidak boleh menggagalkan balasan ke pengunjung.
    try {
      await prisma.chatConversation.create({
        data: {
          messages: JSON.stringify([
            ...history,
            { role: "user", content: message },
            { role: "assistant", content: finalReply },
          ]),
          usedFallback,
        },
      })
    } catch (logError) {
      console.error("Gagal mencatat percakapan chatbot:", logError)
    }

    return NextResponse.json({ reply: finalReply })
  } catch (error) {
    console.error("POST /api/chatbot error:", error)
    return NextResponse.json(
      { error: "Maaf, chatbot sedang mengalami gangguan. Silakan hubungi kami via WhatsApp." },
      { status: 502 }
    )
  }
}
