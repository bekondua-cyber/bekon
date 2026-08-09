import { describe, expect, it } from "vitest"
import { aiVideoPlanSchema } from "@/lib/video-prompt/schema"
import { parseAiJson, AiParseError } from "@/lib/ai/parse"
import { compilePart } from "@/lib/video-prompt/compile"

/**
 * Audit menemukan schema lama menolak 21 dari 24 penyimpangan wajar dari AI,
 * semuanya dengan pesan generik yang sama. Berkas ini mengunci ketahanan
 * terhadap penyimpangan yang tidak mengubah makna.
 */

const minimalPlan = {
  title: "Timelapse",
  styleBible: { visualStyle: "a", colorPalette: "b", lightingBase: "c", negativePrompt: "d" },
  parts: [
    {
      index: 1,
      label: "Part 1",
      durationSec: 10,
      shot: { type: "wide shot", lens: "16mm", framing: "low angle", movement: "drone orbit" },
      subject: "lahan kosong",
      action: "berubah jadi rumah",
      scene: "Serang",
      lighting: "matahari pagi",
      timeline: [{ time: "00:00-00:02", action: "x" }],
    },
  ],
}

function parse(mutate: (plan: Record<string, unknown>) => void) {
  const plan = JSON.parse(JSON.stringify(minimalPlan))
  mutate(plan)
  return aiVideoPlanSchema.safeParse(plan)
}

describe("schema tahan penyimpangan wajar dari AI", () => {
  it("menerima angka yang dikirim sebagai string", () => {
    const r = parse((p) => {
      const parts = p.parts as Record<string, unknown>[]
      parts[0].durationSec = "10"
      parts[0].index = "1"
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.parts[0].durationSec).toBe(10)
  })

  it("menjepit durasi di luar rentang alih-alih menolak", () => {
    const r = parse((p) => { (p.parts as Record<string, unknown>[])[0].durationSec = 15 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.parts[0].durationSec).toBe(10)
  })

  it("menerima stages berupa string berkoma, bukan hanya array", () => {
    const r = parse((p) => {
      (p.parts as Record<string, unknown>[])[0].stages = "galian pondasi, pengecoran, atap"
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.parts[0].stages).toEqual(["galian pondasi", "pengecoran", "atap"])
  })

  it("menerima part tanpa audio, editorNotes, dan shot", () => {
    const r = parse((p) => {
      const part = (p.parts as Record<string, unknown>[])[0]
      delete part.audio
      delete part.editorNotes
      delete part.shot
    })
    expect(r.success).toBe(true)
  })

  it("menerima timeline kosong atau hilang", () => {
    expect(parse((p) => { (p.parts as Record<string, unknown>[])[0].timeline = [] }).success).toBe(true)
    expect(parse((p) => { delete (p.parts as Record<string, unknown>[])[0].timeline }).success).toBe(true)
  })

  it("menormalkan continuity tak dikenal menjadi new", () => {
    const r = parse((p) => { (p.parts as Record<string, unknown>[])[0].continuity = "extend_shot" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.parts[0].continuity).toBe("new")
  })

  it("tetap menolak bila tidak ada part sama sekali", () => {
    expect(parse((p) => { p.parts = [] }).success).toBe(false)
  })
})

describe("parseAiJson melaporkan sebab yang spesifik", () => {
  it("menandai respons kosong", () => {
    expect(() => parseAiJson("", aiVideoPlanSchema)).toThrowError(
      expect.objectContaining({ reason: "empty" })
    )
  })

  it("menandai respons terpotong di tengah JSON", () => {
    const cut = '{"title":"T","parts":[{"index":1,"label":"a"'
    try {
      parseAiJson(cut, aiVideoPlanSchema)
      throw new Error("seharusnya gagal")
    } catch (e) {
      expect((e as AiParseError).reason).toBe("truncated")
    }
  })

  it("menandai teks yang sama sekali bukan JSON", () => {
    try {
      parseAiJson("Maaf, saya tidak bisa membantu.", aiVideoPlanSchema)
      throw new Error("seharusnya gagal")
    } catch (e) {
      expect((e as AiParseError).reason).toBe("notJson")
    }
  })

  it("menyebut field mana yang bermasalah saat schema gagal", () => {
    try {
      parseAiJson('{"title":"T","parts":[]}', aiVideoPlanSchema)
      throw new Error("seharusnya gagal")
    } catch (e) {
      expect((e as AiParseError).reason).toBe("schema")
      expect((e as AiParseError).message).toContain("parts")
    }
  })

  it("memulihkan JSON yang dibungkus code fence", () => {
    const fenced = "```json\n" + JSON.stringify(minimalPlan) + "\n```"
    expect(parseAiJson(fenced, aiVideoPlanSchema).parts).toHaveLength(1)
  })
})

describe("compiler tidak menghasilkan kalimat rusak saat field kosong", () => {
  const bare = aiVideoPlanSchema.parse({
    title: "T",
    parts: [{ index: 1, label: "Part 1", durationSec: 10 }],
  })

  it("tidak meninggalkan tanda baca menggantung pada resep beat", () => {
    const p = compilePart(bare.parts[0], bare.styleBible, [], "9:16", "beatSequence")
    expect(p.naturalPrompt).not.toMatch(/di\s*,/)
    expect(p.naturalPrompt).not.toMatch(/disinari\s*\./)
  })

  it("tidak meninggalkan kurung kosong pada resep menerus", () => {
    const p = compilePart(bare.parts[0], bare.styleBible, [], "9:16", "continuousTransformation")
    expect(p.naturalPrompt).not.toContain("( ,")
    expect(p.naturalPrompt).not.toContain("()")
    expect(p.naturalPrompt).toContain("The camera never cuts")
  })
})

describe("timelapse satu part harus menceritakan pembangunan penuh", () => {
  const plan = aiVideoPlanSchema.parse({
    title: "T",
    parts: [{
      index: 1, label: "Pembangunan", durationSec: 10,
      subject: "an empty 200 square metre plot",
      action: "transforming into a completed luxury two-storey house",
      shot: { type: "wide", lens: "24mm", framing: "eye level", movement: "slow continuous 360-degree drone orbit" },
      stages: ["empty land preparation", "landscaping"],
      finalReveal: "The drone rises higher revealing the finished house.",
    }],
  })

  it("menegaskan transformasi lengkap saat hanya ada satu part", () => {
    const p = compilePart(plan.parts[0], plan.styleBible, [], "9:16", "continuousTransformation", 1)
    expect(p.naturalPrompt).toContain("the complete transformation of")
  })

  it("tidak menegaskan itu saat part-nya lebih dari satu", () => {
    const p = compilePart(plan.parts[0], plan.styleBible, [], "9:16", "continuousTransformation", 3)
    expect(p.naturalPrompt).not.toContain("the complete transformation of")
  })
})

describe("master prompt menyesuaikan cakupan dengan jumlah part", () => {
  it("mewajibkan busur penuh saat satu part", async () => {
    const { buildMasterPrompt } = await import("@/lib/video-prompt/master-prompt")
    const { getCategory } = await import("@/lib/video-categories")
    const p = buildMasterPrompt({
      categoryInfo: getCategory("timelapse"), partCount: 1, durationPerPart: 10,
      aspectRatio: "9:16", platform: "TikTok", tone: "Profesional", style: "Cinematic Timelapse",
      structure: "Progres Bertahap", deliveryMode: "voiceover",
      portfolioContext: "", subjectsContext: "", hasAssets: false,
    })
    expect(p).toContain("HANYA ADA 1 PART")
    expect(p).toContain("sampai rumah JADI")
    expect(p).toContain("DILARANG berhenti di tahap pondasi")
  })

  it("meminta pembagian rentang saat banyak part, dengan part terakhir rumah jadi", async () => {
    const { buildMasterPrompt } = await import("@/lib/video-prompt/master-prompt")
    const { getCategory } = await import("@/lib/video-categories")
    const p = buildMasterPrompt({
      categoryInfo: getCategory("timelapse"), partCount: 3, durationPerPart: 10,
      aspectRatio: "9:16", platform: "TikTok", tone: "Profesional", style: "Cinematic Timelapse",
      structure: "Progres Bertahap", deliveryMode: "voiceover",
      portfolioContext: "", subjectsContext: "", hasAssets: false,
    })
    expect(p).not.toContain("HANYA ADA 1 PART")
    expect(p).toContain("Part TERAKHIR wajib berakhir pada")
  })
})
