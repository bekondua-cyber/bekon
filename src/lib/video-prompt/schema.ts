import { z } from "zod"

/** Versi schema, disimpan di DB supaya hasil lama tetap bisa dibaca. */
export const PROMPT_VERSION = 4

/**
 * Schema di berkas ini sengaja TOLERAN.
 *
 * Model bahasa rutin menyimpang sedikit dari format yang diminta: angka
 * dikirim sebagai string, objek opsional dihilangkan, daftar ditulis sebagai
 * teks berkoma. Sebelumnya penyimpangan sekecil apa pun menggagalkan seluruh
 * generate dengan pesan "Format hasil AI tidak sesuai" — mahal dan
 * membingungkan. Sekarang penyimpangan yang tidak mengubah makna dinormalkan,
 * dan hanya kekurangan yang benar-benar fatal yang ditolak.
 */

/** Teks yang menerima nilai non-string dan null tanpa menggagalkan parse. */
const looseText = (fallback = "") =>
  z.preprocess(
    (v) => (typeof v === "string" ? v : v == null ? fallback : String(v)),
    z.string()
  )

/** Angka yang menerima "10" maupun 10, lalu dijepit ke rentang aman. */
const looseInt = (min: number, max: number, fallback: number) =>
  z.preprocess((v) => {
    const n = typeof v === "number" ? v : Number(v)
    if (!Number.isFinite(n)) return fallback
    return Math.min(max, Math.max(min, Math.round(n)))
  }, z.number().int())

/** Daftar yang menerima array maupun satu string berkoma. */
const looseList = z.preprocess((v) => {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean)
  if (typeof v === "string") return v.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
  return []
}, z.array(z.string()))

export const styleBibleSchema = z.object({
  visualStyle: looseText("cinematic, photorealistic"),
  colorPalette: looseText("natural colour grade"),
  lightingBase: looseText("natural daylight"),
  negativePrompt: looseText("on-screen text, watermark, distorted geometry"),
})

export const subjectSchema = z.object({
  id: looseText(),
  role: looseText(),
  identityAnchor: looseText(),
  referenceImages: looseList.default([]),
})

export const shotSchema = z.object({
  type: looseText(),
  lens: looseText(),
  framing: looseText(),
  movement: looseText(),
})

export const beatSchema = z.object({
  time: looseText(),
  action: looseText(),
})

export const audioSchema = z.object({
  dialogue: looseText().default(""),
  sfx: looseText().default(""),
  ambient: looseText().default(""),
})

export const editorNotesSchema = z.object({
  textOverlay: looseText().default(""),
  musicCue: looseText().default(""),
  transitionToNext: looseText().default(""),
})

/** Nilai continuity tak dikenal diperlakukan sebagai "new" — pilihan teraman. */
export const continuitySchema = z.preprocess(
  (v) => (v === "extend" || v === "firstLastFrame" ? v : "new"),
  z.enum(["new", "extend", "firstLastFrame"])
)

export const partSchema = z.object({
  index: looseInt(1, 99, 1),
  label: looseText("Part"),
  durationSec: looseInt(4, 10, 10),
  continuity: continuitySchema.default("new"),
  ingredients: looseList.default([]),
  shot: shotSchema.default({ type: "", lens: "", framing: "", movement: "" }),
  subject: looseText(),
  action: looseText(),
  scene: looseText(),
  lighting: looseText(),
  timeline: z.array(beatSchema).default([]),
  audio: audioSchema.default({ dialogue: "", sfx: "", ambient: "" }),
  editorNotes: editorNotesSchema.default({ textOverlay: "", musicCue: "", transitionToNext: "" }),

  /**
   * Naskah voiceover siap baca, Bahasa Indonesia. Hanya diisi pada mode
   * voiceover — Veo tidak mengucapkannya, jadi ini TIDAK ikut ke prompt Flow;
   * admin merekam/menempelkannya sendiri saat editing.
   */
  voiceoverScript: looseText().default(""),

  // --- Khusus resep `continuousTransformation` (timelapse) ---
  /** Enumerasi padat tahap konstruksi di dalam satu gerakan kamera menerus. */
  stages: looseList.default([]),
  /** Klimaks yang menjangkar hasil akhir ke gambar referensi. */
  finalReveal: looseText().default(""),
  /** Ringkasan gaya kamera untuk baris penutup prompt. */
  cameraSummary: looseText().default(""),
})

export const aiVideoPlanSchema = z.object({
  title: looseText("Video BEKON"),
  styleBible: styleBibleSchema.default({
    visualStyle: "cinematic, photorealistic",
    colorPalette: "natural colour grade",
    lightingBase: "natural daylight",
    negativePrompt: "on-screen text, watermark, distorted geometry",
  }),
  subjects: z.array(subjectSchema).default([]),
  // Satu-satunya syarat yang benar-benar fatal: harus ada minimal satu part
  // yang punya isi. Sisanya bisa dinormalkan.
  parts: z.array(partSchema).min(1, "AI tidak mengembalikan satu part pun"),
})

export type StyleBible = z.infer<typeof styleBibleSchema>
export type Subject = z.infer<typeof subjectSchema>
export type VideoPart = z.infer<typeof partSchema>
export type AiVideoPlan = z.infer<typeof aiVideoPlanSchema>

/** Part setelah ditambahi prompt siap-tempel hasil kompilasi kode. */
export interface CompiledPart extends VideoPart {
  naturalPrompt: string
  jsonPrompt: Record<string, unknown>
}

export interface VideoPromptResult {
  promptVersion: number
  project: {
    title: string
    category: string
    aspectRatio: string
    platform: string
    partCount: number
    totalDurationSec: number
  }
  styleBible: StyleBible
  subjects: Subject[]
  parts: CompiledPart[]
}
