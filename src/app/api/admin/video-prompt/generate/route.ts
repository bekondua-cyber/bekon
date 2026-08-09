import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-admin"
import { rateLimit } from "@/lib/rate-limit"
import { generateCompletion } from "@/lib/ai"
import { resolveGeminiModel } from "@/lib/ai/model-setting"
import { parseAiJson, AiParseError } from "@/lib/ai/parse"
import { getCategory, ASPECT_RATIO_OPTIONS } from "@/lib/video-categories"
import { buildMasterPrompt } from "@/lib/video-prompt/master-prompt"
import { compilePart } from "@/lib/video-prompt/compile"
import { aiVideoPlanSchema, PROMPT_VERSION, type VideoPromptResult } from "@/lib/video-prompt/schema"

export const dynamic = "force-dynamic"

const requestSchema = z.object({
  category: z.string().min(1),
  idea: z.string().min(3),
  aspectRatio: z.enum(ASPECT_RATIO_OPTIONS as [string, ...string[]]),
  sceneCount: z.number().int().min(1).max(12),
  durationPerScene: z.number().int().min(4).max(10),
  structure: z.string().min(1),
  tone: z.string().min(1),
  platform: z.string().min(1),
  style: z.string().min(1),
  deliveryMode: z.enum(["voiceover", "onCameraDialogue"]).optional(),
  portfolioId: z.string().optional(),
  characterId: z.string().optional(),
  materialIds: z.array(z.string()).optional().default([]),
})

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const identifier = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    // Jatah terpisah dari pencarian ide — lihat catatan di route ideas.
    const limit = rateLimit(`ai-video-generate:${identifier}`, 10, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const body = await request.json()
    const validation = requestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message || "Data tidak valid" }, { status: 400 })
    }

    const {
      category, idea, aspectRatio, sceneCount, durationPerScene,
      structure, tone, platform, style, deliveryMode,
      portfolioId, characterId, materialIds,
    } = validation.data

    const categoryInfo = getCategory(category)

    const [portfolio, character, materials] = await Promise.all([
      portfolioId ? prisma.portfolio.findUnique({ where: { id: portfolioId } }) : null,
      characterId ? prisma.videoCharacter.findUnique({ where: { id: characterId } }) : null,
      materialIds.length > 0 ? prisma.videoMaterial.findMany({ where: { id: { in: materialIds } } }) : [],
    ])

    // Sebelumnya portfolioId divalidasi & disimpan tapi tidak pernah masuk prompt.
    const portfolioContext = portfolio
      ? `=== PROYEK REFERENSI ===\n${portfolio.title} (${portfolio.category || "umum"}, ${portfolio.location || "-"}). ${portfolio.description || ""}`
      : ""

    const subjectLines: string[] = []
    if (character) {
      subjectLines.push(
        `- id "karakter-utama": ${character.name}, ${character.gender || "gender tidak disebut"}, ${character.age ? `${character.age} tahun` : "usia tidak diketahui"}. Gunakan id ini di "ingredients" pada part yang menampilkan dia.`
      )
    }
    materials.forEach((m, i) => {
      subjectLines.push(
        `- id "bahan-${i + 1}": ${m.label}${m.description ? ` (${m.description})` : ""}. Referensi visual bahan/material.`
      )
    })
    const subjectsContext = subjectLines.length
      ? `=== SUBJEK & BAHAN REFERENSI ===\nFoto referensi akan dilampirkan admin di Flow lewat fitur Ingredients to Video.\n${subjectLines.join("\n")}`
      : "=== SUBJEK ===\nTidak ada karakter atau bahan referensi. Fokus pada bangunan, material, dan aktivitas proyek."

    const systemPrompt = buildMasterPrompt({
      categoryInfo,
      partCount: sceneCount,
      durationPerPart: durationPerScene,
      aspectRatio,
      platform,
      tone,
      style,
      structure,
      deliveryMode: deliveryMode || categoryInfo.defaultDelivery,
      portfolioContext,
      subjectsContext,
      hasAssets: subjectLines.length > 0,
    })

    // Timelapse memuat 12–18 tahap per part sehingga responsnya jauh lebih
    // panjang. Anggaran token dinaikkan seiring jumlah part, tapi tetap di
    // bawah batas keluaran gemini-2.0-flash (8192) agar tidak terpotong.
    const maxTokens = Math.min(8000, 2500 + sceneCount * 900)

    const raw = await generateCompletion({
      model: await resolveGeminiModel(),
      json: true,
      temperature: 0.7,
      maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Ide konten: ${idea}` },
      ],
    })

    const plan = parseAiJson(raw, aiVideoPlanSchema)

    // Lampirkan URL foto asli ke subjek supaya UI bisa menampilkan
    // gambar mana yang harus diupload ke Flow di part mana.
    const referenceUrls: Record<string, string[]> = {}
    const referenceRoles: Record<string, string> = {}
    if (character) {
      referenceUrls["karakter-utama"] = [character.photoUrl]
      referenceRoles["karakter-utama"] = character.name
    }
    materials.forEach((m, i) => {
      referenceUrls[`bahan-${i + 1}`] = [m.photoUrl]
      referenceRoles[`bahan-${i + 1}`] = m.label
    })

    const subjects = plan.subjects.map((s) => ({
      ...s,
      referenceImages: referenceUrls[s.id] || s.referenceImages,
    }))

    // AI kadang lupa mencantumkan aset yang dipilih admin. Tanpa ini, foto
    // yang sudah dipilih hilang diam-diam dan tidak bisa diunduh di mana pun.
    const known = new Set(subjects.map((s) => s.id))
    for (const [id, urls] of Object.entries(referenceUrls)) {
      if (known.has(id)) continue
      subjects.push({
        id,
        role: referenceRoles[id] || id,
        identityAnchor: "",
        referenceImages: urls,
      })
    }

    const parts = plan.parts.map((p) =>
      compilePart(p, plan.styleBible, subjects, aspectRatio, categoryInfo.promptRecipe, plan.parts.length)
    )

    const result: VideoPromptResult = {
      promptVersion: PROMPT_VERSION,
      project: {
        title: plan.title,
        category,
        aspectRatio,
        platform,
        partCount: parts.length,
        totalDurationSec: parts.reduce((sum, p) => sum + p.durationSec, 0),
      },
      styleBible: plan.styleBible,
      subjects,
      parts,
    }

    const item = await prisma.videoPromptHistory.create({
      data: {
        title: plan.title,
        category,
        portfolioId: portfolioId || null,
        characterId: characterId || null,
        materialIds,
        ideaPrompt: idea,
        aspectRatio,
        sceneCount: parts.length,
        durationPerSec: durationPerScene,
        structure,
        tone,
        platform,
        style,
        promptVersion: PROMPT_VERSION,
        resultJson: JSON.stringify(result),
      },
    })

    return NextResponse.json({ data: item })
  } catch (error) {
    // Sebab spesifik dicatat supaya kegagalan bisa didiagnosis dari log,
    // bukan cuma "Gagal generate prompt video".
    if (error instanceof AiParseError) {
      console.error("POST /api/admin/video-prompt/generate parse error:", {
        reason: error.reason,
        detail: error.detail,
      })
      return NextResponse.json({ error: error.message, reason: error.reason }, { status: 502 })
    }
    console.error("POST /api/admin/video-prompt/generate error:", error)
    const message = error instanceof Error ? error.message : "Gagal generate prompt video"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
