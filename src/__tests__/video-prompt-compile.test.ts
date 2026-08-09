import { describe, expect, it } from "vitest"
import { compileNaturalPrompt, compileJsonPrompt, compileContinuousPrompt } from "@/lib/video-prompt/compile"
import type { StyleBible, Subject, VideoPart } from "@/lib/video-prompt/schema"

const styleBible: StyleBible = {
  visualStyle: "photorealistic cinematic, 35mm, filmic contrast",
  colorPalette: "golden hour hangat, earth tone",
  lightingBase: "matahari sore sebagai key",
  negativePrompt: "teks di layar, watermark, besi melayang",
}

const subjects: Subject[] = [
  {
    id: "karakter-utama",
    role: "Arsitek BEKON",
    identityAnchor: "pria 30-an, helm proyek putih, kemeja putih",
    referenceImages: ["https://example.com/arsitek.jpg"],
  },
]

const part: VideoPart = {
  index: 1,
  label: "Establish lahan",
  durationSec: 10,
  continuity: "new",
  ingredients: ["karakter-utama"],
  shot: { type: "wide establishing", lens: "16mm", framing: "low angle", movement: "drone orbit naik" },
  subject: "arsitek berdiri di tepi lahan kosong",
  action: "membuka gulungan denah",
  scene: "lahan kosong berumput di pinggiran Serang",
  lighting: "sinar matahari sore dari sisi kiri sebagai key",
  timeline: [
    { time: "00:00-00:02", action: "drone menyapu lahan kosong" },
    { time: "00:02-00:07", action: "arsitek membuka denah" },
    { time: "00:07-00:10", action: "kamera naik memperlihatkan luas lahan" },
  ],
  audio: { dialogue: "", sfx: "SFX: angin terbuka", ambient: "Ambient noise: suara pedesaan" },
  editorNotes: { textOverlay: "Mulai dari nol", musicCue: "upbeat", transitionToNext: "match cut" },
  voiceoverScript: "",
  stages: [],
  finalReveal: "",
  cameraSummary: "",
}

describe("compileNaturalPrompt", () => {
  const prompt = compileNaturalPrompt(part, styleBible, subjects)

  it("menyertakan sintaks ingredients Flow saat ada subjek", () => {
    expect(prompt).toContain("Using the provided images for Arsitek BEKON")
  })

  it("mengulang identityAnchor supaya karakter konsisten antar part", () => {
    expect(prompt).toContain("pria 30-an, helm proyek putih")
  })

  it("menulis seluruh beat bertimestamp", () => {
    expect(prompt).toContain("[00:00-00:02]")
    expect(prompt).toContain("[00:02-00:07]")
    expect(prompt).toContain("[00:07-00:10]")
  })

  it("menyertakan negative prompt dari styleBible", () => {
    expect(prompt).toContain("Hindari:")
    expect(prompt).toContain("watermark")
  })

  it("tidak melebihi 175 kata", () => {
    expect(prompt.trim().split(/\s+/).length).toBeLessThanOrEqual(175)
  })

  it("tidak membocorkan catatan editing ke prompt Veo", () => {
    expect(prompt).not.toContain("Mulai dari nol")
    expect(prompt).not.toContain("match cut")
  })
})

describe("compileNaturalPrompt — kerapian kalimat", () => {
  it("memisahkan SFX dan Ambient noise dengan titik, tidak dempet", () => {
    const prompt = compileNaturalPrompt(part, styleBible, subjects)
    expect(prompt).toContain("SFX: angin terbuka. Ambient noise: suara pedesaan")
  })

  it("menurunkan kapital di tengah kalimat", () => {
    const capitalised: VideoPart = {
      ...part,
      subject: "Lahan kosong berumput liar",
      lighting: "Sinar matahari pagi dari sisi kanan",
      shot: { ...part.shot, movement: "Slow Dolly-in" },
    }
    const prompt = compileNaturalPrompt(capitalised, styleBible, subjects)
    expect(prompt).toContain("disinari sinar matahari pagi")
    expect(prompt).not.toContain("disinari Sinar matahari")
  })

  it("mempertahankan kapital pada nama diri", () => {
    const withPlace: VideoPart = { ...part, scene: "Serang Timur, langit cerah" }
    const prompt = compileNaturalPrompt(withPlace, styleBible, subjects)
    expect(prompt).toContain("di Serang Timur")
  })
})

describe("compileNaturalPrompt tanpa subjek", () => {
  it("tidak menulis baris ingredients", () => {
    const prompt = compileNaturalPrompt({ ...part, ingredients: [] }, styleBible, subjects)
    expect(prompt).not.toContain("Using the provided images")
  })
})

describe("compileNaturalPrompt dengan dialog", () => {
  it("menambahkan penanda no subtitles", () => {
    const withDialogue: VideoPart = {
      ...part,
      audio: { ...part.audio, dialogue: 'Arsitek berkata: "Kita mulai hari ini."' },
    }
    const prompt = compileNaturalPrompt(withDialogue, styleBible, subjects)
    expect(prompt).toContain("(no subtitles)")
  })
})

describe("compileJsonPrompt", () => {
  const json = compileJsonPrompt(part, styleBible, subjects, "9:16")

  it("memuat field teknis sesuai schema Veo", () => {
    expect(json.technical).toEqual({ aspect_ratio: "9:16", duration: "10s" })
  })

  it("memindahkan negative prompt ke field terpisah", () => {
    expect(json.negative_prompt).toBe(styleBible.negativePrompt)
  })

  it("tidak menyertakan editorNotes yang bukan untuk Flow", () => {
    expect(json).not.toHaveProperty("editorNotes")
  })

  it("mempertahankan timeline beat", () => {
    expect(json.timeline).toHaveLength(3)
  })
})

describe("compileContinuousPrompt (timelapse)", () => {
  const timelapsePart: VideoPart = {
    ...part,
    shot: { ...part.shot, movement: "slow continuous 360-degree drone orbit" },
    subject: "an empty plot of land",
    action: "transforming into a luxury two-storey house",
    scene: "the outskirts of Serang, clear sky",
    lighting: "natural sunlight shifting from morning to golden hour",
    stages: [
      "empty land preparation",
      "survey workers marking the area",
      "excavators digging foundations",
      "pouring concrete foundation",
      "building brick walls",
      "installing roof structures",
      "exterior stone finishing",
      "landscaping",
    ],
    finalReveal: "The drone rises higher while still orbiting, revealing the completed house, then a slow cinematic pull-back.",
    cameraSummary: "cinematic drone FPV, slow 360-degree orbit, rising reveal shot",
  }

  const prompt = compileContinuousPrompt(timelapsePart, styleBible, subjects)

  it("menyatakan kamera tidak pernah memotong", () => {
    expect(prompt).toContain("The camera never cuts")
  })

  it("menegaskan jalur kamera tetap sama sepanjang transformasi", () => {
    expect(prompt).toContain("maintains the same path and perspective")
  })

  it("memuat seluruh tahap konstruksi berurutan", () => {
    expect(prompt).toContain("empty land preparation")
    expect(prompt).toContain("landscaping")
  })

  it("tidak memakai beat bertimestamp yang memicu potongan adegan", () => {
    expect(prompt).not.toContain("[00:00-00:02]")
  })

  it("menjangkar hasil akhir ke gambar referensi saat ada ingredients", () => {
    expect(prompt).toContain("based on the reference image")
    expect(prompt).toContain("exact same architectural style as the reference image")
  })

  it("tidak menyebut gambar referensi kalau tidak ada yang dilampirkan", () => {
    const noRef = compileContinuousPrompt({ ...timelapsePart, ingredients: [] }, styleBible, subjects)
    expect(noRef).not.toContain("reference image")
  })

  it("menutup dengan negative prompt", () => {
    expect(prompt).toContain("Avoid:")
  })
})

describe("compileJsonPrompt untuk resep menerus", () => {
  const json = compileJsonPrompt(
    { ...part, stages: ["digging foundations"], finalReveal: "drone rises" },
    styleBible,
    subjects,
    "16:9",
    "continuousTransformation"
  )

  it("mengganti timeline dengan daftar tahap konstruksi", () => {
    expect(json).not.toHaveProperty("timeline")
    expect(json.construction_stages).toEqual(["digging foundations"])
  })

  it("menyatakan kontinuitas kamera secara eksplisit", () => {
    expect(json.camera_continuity).toBe("single uninterrupted camera move, no cuts")
  })
})

describe("compileContinuousPrompt — kerapian kamera", () => {
  const base: VideoPart = { ...part, stages: ["digging"], finalReveal: "reveal", cameraSummary: "drone orbit" }

  it("tidak menduplikasi kata continuous", () => {
    const p = compileContinuousPrompt(
      { ...base, shot: { ...part.shot, movement: "slow continuous 360-degree drone orbit" } },
      styleBible, subjects
    )
    expect(p).not.toMatch(/continuous\s+slow\s+continuous/i)
    expect(p).toContain("a single slow continuous 360-degree drone orbit")
  })

  it("menambahkan penegasan menerus saat movement belum menyebutnya", () => {
    const p = compileContinuousPrompt(
      { ...base, shot: { ...part.shot, movement: "360-degree drone orbit" } },
      styleBible, subjects
    )
    expect(p).toContain("one smooth, continuous 360-degree drone orbit")
  })
})
