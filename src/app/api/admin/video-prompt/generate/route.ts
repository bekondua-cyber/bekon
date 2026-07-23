import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-admin"
import { rateLimit } from "@/lib/rate-limit"
import { generateCompletion } from "@/lib/ai"

export const dynamic = "force-dynamic"

const requestSchema = z.object({
  idea: z.string().min(3),
  aspectRatio: z.string().min(1),
  sceneCount: z.number().int().min(1).max(20),
  durationPerScene: z.number().int().min(1).max(120),
  structure: z.string().min(1),
  tone: z.string().min(1),
  platform: z.string().min(1),
  portfolioId: z.string().optional(),
})

const sceneSchema = z.object({
  visual: z.string(),
  cameraMovement: z.string(),
  voiceover: z.string(),
  textOverlay: z.string(),
})

const resultSchema = z.object({
  title: z.string(),
  scenes: z.array(sceneSchema).min(1),
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
      return NextResponse.json({ error: validation.error.issues[0]?.message || "Data tidak valid" }, { status: 400 })
    }

    const { idea, aspectRatio, sceneCount, durationPerScene, structure, tone, platform, portfolioId } = validation.data

    const raw = await generateCompletion({
      json: true,
      temperature: 0.8,
      maxTokens: 3000,
      messages: [
        {
          role: "system",
          content: `Kamu adalah sutradara & prompt engineer video untuk BEKON, kontraktor/arsitek di Serang, Banten sejak 2009. Buat prompt JSON terstruktur untuk AI video generator (seperti Google Flow) berdasarkan ide konten yang diberikan.

Kembalikan HANYA JSON valid dengan struktur persis:
{
  "title": "judul video singkat",
  "scenes": [
    { "visual": "deskripsi visual scene", "cameraMovement": "gerakan kamera", "voiceover": "narasi/voiceover", "textOverlay": "teks di layar" }
  ]
}

Buat tepat ${sceneCount} scene. Ikuti struktur "${structure}" (misalnya hook di scene awal, body di tengah, call-to-action di akhir). Gaya/tone: ${tone}. Target platform: ${platform}, aspect ratio ${aspectRatio}, durasi tiap scene sekitar ${durationPerScene} detik.`,
        },
        {
          role: "user",
          content: `Ide konten: ${idea}`,
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

    const result = resultSchema.safeParse(parsed)
    if (!result.success) {
      return NextResponse.json({ error: "Format hasil AI tidak sesuai, coba lagi" }, { status: 502 })
    }

    const item = await prisma.videoPromptHistory.create({
      data: {
        title: result.data.title,
        portfolioId: portfolioId || null,
        ideaPrompt: idea,
        aspectRatio,
        sceneCount,
        durationPerSec: durationPerScene,
        structure,
        tone,
        platform,
        resultJson: JSON.stringify(result.data),
      },
    })

    return NextResponse.json({ data: item })
  } catch (error) {
    console.error("POST /api/admin/video-prompt/generate error:", error)
    const message = error instanceof Error ? error.message : "Gagal generate prompt video"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
