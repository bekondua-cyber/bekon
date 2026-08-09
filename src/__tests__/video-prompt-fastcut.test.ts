import { describe, expect, it } from "vitest"
import {
  compileFastCutPrompt,
  compileNaturalPrompt,
  compileJsonPrompt,
} from "@/lib/video-prompt/compile"
import { fastCutBeatPlan, buildMasterPrompt } from "@/lib/video-prompt/master-prompt"
import { getCategory } from "@/lib/video-categories"
import type { StyleBible, Subject, VideoPart } from "@/lib/video-prompt/schema"

const styleBible: StyleBible = {
  visualStyle: "high-energy social media vlog, crisp handheld, photorealistic",
  colorPalette: "neutral whites, warm oak, soft grey",
  lightingBase: "afternoon window light",
  negativePrompt: "on-screen text, watermark, deformed hands",
}

const subjects: Subject[] = [
  {
    id: "karakter-utama",
    role: "Desainer Interior",
    identityAnchor: "wanita 20-an, kaos putih, celana jeans",
    referenceImages: ["https://example.com/ani.jpg"],
  },
]

function makePart(overrides: Partial<VideoPart> = {}): VideoPart {
  return {
    index: 1,
    label: "Pilih warna dinding",
    durationSec: 10,
    continuity: "new",
    ingredients: ["karakter-utama"],
    shot: { type: "medium shot", lens: "35mm", framing: "eye level", movement: "whip pan" },
    subject: "a bare white living room wall",
    action: "being tested with grey paint swatches",
    scene: "a minimalist house in Serang",
    lighting: "morning window light as key",
    timeline: [
      { time: "00:00-00:02", action: "hand slapping a grey swatch onto the wall, close-up" },
      { time: "00:02-00:04", action: "designer stepping back, tilting head to judge the tone" },
      { time: "00:04-00:06", action: "roller loading paint, dripping" },
      { time: "00:06-00:08", action: "roller sweeping a clean stripe across the wall" },
      { time: "00:08-00:10", action: "finished wall catching window light" },
    ],
    audio: { dialogue: "", sfx: "SFX: roller on wall", ambient: "Ambient noise: quiet room tone" },
    editorNotes: { textOverlay: "", musicCue: "upbeat", transitionToNext: "whip pan cut" },
    voiceoverScript: "",
    stages: [],
    finalReveal: "",
    cameraSummary: "",
    ...overrides,
  }
}

describe("fastCutBeatPlan", () => {
  it("memecah 10 detik jadi 5 beat ~2 detik, bukan 3 beat dengan tengah 5 detik", () => {
    const beats = fastCutBeatPlan(10)
    expect(beats).toHaveLength(5)
    expect(beats[0].time).toBe("00:00-00:02")
    expect(beats[4].time).toBe("00:08-00:10")
  })

  it("menutup penuh durasi tanpa celah maupun tumpang tindih", () => {
    for (const duration of [5, 8, 10]) {
      const beats = fastCutBeatPlan(duration)
      expect(beats[0].time.startsWith("00:00")).toBe(true)
      expect(beats.at(-1)!.time.endsWith(`00:${String(duration).padStart(2, "0")}`)).toBe(true)

      for (let i = 1; i < beats.length; i++) {
        const prevEnd = beats[i - 1].time.split("-")[1]
        const currentStart = beats[i].time.split("-")[0]
        expect(currentStart).toBe(prevEnd)
      }
    }
  })

  it("selalu memberi minimal 3 beat walau durasinya pendek", () => {
    expect(fastCutBeatPlan(5).length).toBeGreaterThanOrEqual(3)
  })

  it("menandai beat pertama sebagai HOOK dan terakhir sebagai PAYOFF", () => {
    const beats = fastCutBeatPlan(10)
    expect(beats[0].purpose).toContain("HOOK")
    expect(beats.at(-1)!.purpose).toContain("PAYOFF")
  })
})

describe("compileFastCutPrompt", () => {
  const prompt = compileFastCutPrompt(makePart(), styleBible, subjects)

  it("menyatakan potongan cepat secara eksplisit — timestamp saja tidak menyuruh Veo memotong", () => {
    expect(prompt).toContain("Quick cut to:")
    expect(prompt).toContain("rapid cuts")
  })

  it("tidak menandai beat pertama sebagai potongan (tidak ada yang dipotong sebelumnya)", () => {
    const firstBeatLine = prompt.split("\n").find((l) => l.startsWith("[00:00-00:02]"))!
    expect(firstBeatLine).not.toContain("Quick cut to:")
  })

  it("melampirkan gambar referensi dan jangkar identitas karakter", () => {
    expect(prompt).toContain("Using the provided images for Desainer Interior")
    expect(prompt).toContain("wanita 20-an")
  })

  it("membawa negative prompt dari styleBible", () => {
    expect(prompt).toContain("Avoid: on-screen text, watermark, deformed hands.")
  })

  it("tidak menyisipkan penanda ritme kalau cuma ada satu beat", () => {
    const single = compileFastCutPrompt(
      makePart({ timeline: [{ time: "00:00-00:10", action: "one shot" }] }),
      styleBible,
      subjects
    )
    expect(single).not.toContain("rapid cuts")
  })
})

describe("bug kompiler yang pernah lolos ke hasil", () => {
  it('tidak menghasilkan "di di" saat scene sudah diawali kata depan', () => {
    const prompt = compileNaturalPrompt(
      makePart({ scene: "di sebuah rumah minimalis di Serang" }),
      styleBible,
      subjects
    )
    expect(prompt).not.toContain("di di ")
    expect(prompt).toContain("di sebuah rumah minimalis di Serang")
  })

  it('tidak menghasilkan "disinari disinari" saat lighting sudah membawa kata depannya', () => {
    const prompt = compileNaturalPrompt(
      makePart({ lighting: "disinari lampu LED hangat" }),
      styleBible,
      subjects
    )
    expect(prompt).not.toContain("disinari disinari")
  })

  it("memisahkan subjek dan aksi dengan koma, bukan menempelkannya jadi kalimat rusak", () => {
    const prompt = compileNaturalPrompt(
      makePart({
        subject: "sebuah ruangan kosong dengan dinding putih",
        action: "seorang desainer interior memilih warna cat dinding",
      }),
      styleBible,
      subjects
    )
    expect(prompt).toContain("dinding putih, seorang desainer interior")
    expect(prompt).not.toContain("dinding putih seorang desainer")
  })
})

describe("compileJsonPrompt untuk fastCut", () => {
  it("menyertakan editing_rhythm supaya JSON pun menyuruh memotong", () => {
    const json = compileJsonPrompt(makePart(), styleBible, subjects, "9:16", "fastCutSequence")
    expect(json.editing_rhythm).toContain("5 rapid cuts")
  })

  it("tidak menyertakan editing_rhythm pada resep beatSequence biasa", () => {
    const json = compileJsonPrompt(makePart(), styleBible, subjects, "9:16", "beatSequence")
    expect(json.editing_rhythm).toBeUndefined()
  })
})

describe("master prompt kategori Tips & Edukasi", () => {
  const prompt = buildMasterPrompt({
    categoryInfo: getCategory("tips"),
    partCount: 1,
    durationPerPart: 10,
    aspectRatio: "9:16",
    platform: "TikTok",
    tone: "Santai & Ramah",
    style: "Vlog Biasa",
    structure: "Hook - Body - CTA",
    deliveryMode: "onCameraDialogue",
    portfolioContext: "",
    subjectsContext: "",
    hasAssets: false,
  })

  it("melarang gerakan kamera lambat — penyebab semua part jadi 'slow dolly-in'", () => {
    expect(prompt).toContain('jangan pernah memakai kata "slow"')
    expect(prompt).toContain("whip pan")
  })

  it("meminta narasi yang benar-benar mengisi 10 detik, bukan 5 kata", () => {
    // 10 detik x 2,0-2,5 kata/detik = 20-25 kata.
    expect(prompt).toContain("20–25 kata")
    expect(prompt).not.toContain("Maksimal 12 kata")
  })

  it("memakai negative prompt interior, bukan artefak konstruksi", () => {
    expect(prompt).toContain("floating furniture")
    expect(prompt).not.toContain("scaffolding melengkung")
  })

  it("tidak menyertakan urutan konstruksi untuk video interior", () => {
    expect(prompt).not.toContain("galian pondasi")
    expect(prompt).toContain("DOMAIN INTERIOR")
  })

  it("meminta field visual dalam Bahasa Inggris", () => {
    expect(prompt).toContain("BAHASA INGGRIS")
  })

  it("menolak gaya 'Vlog Biasa' disalin mentah ke styleBible", () => {
    expect(prompt).toContain('SALAH: styleBible.visualStyle "Vlog Biasa"')
  })

  it("mewajibkan 5 beat untuk klip 10 detik", () => {
    expect(prompt).toContain("WAJIB berisi TEPAT 5 beat")
  })
})

describe("master prompt Timelapse tidak boleh ikut berubah", () => {
  const prompt = buildMasterPrompt({
    categoryInfo: getCategory("timelapse"),
    partCount: 1,
    durationPerPart: 10,
    aspectRatio: "9:16",
    platform: "TikTok",
    tone: "Inspiratif",
    style: "Cinematic Timelapse",
    structure: "Progres Bertahap",
    deliveryMode: "voiceover",
    portfolioContext: "",
    subjectsContext: "",
    hasAssets: false,
  })

  it("tetap memakai resep transformasi menerus", () => {
    expect(prompt).toContain("TRANSFORMASI MENERUS")
    expect(prompt).not.toContain("POTONGAN CEPAT")
  })

  it("tetap memakai urutan konstruksi dan negative prompt timelapse", () => {
    expect(prompt).toContain("galian pondasi")
    expect(prompt).toContain("changing house design mid-shot")
  })
})
