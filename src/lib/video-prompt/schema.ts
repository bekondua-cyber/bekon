import { z } from "zod"

/** Versi schema, disimpan di DB supaya hasil lama tetap bisa dibaca. */
export const PROMPT_VERSION = 3

/**
 * Gaya global yang diulang VERBATIM ke setiap part. Ini kunci supaya beberapa
 * klip 10 detik yang digenerate terpisah di Flow terlihat seperti satu video.
 */
export const styleBibleSchema = z.object({
  visualStyle: z.string(),
  colorPalette: z.string(),
  lightingBase: z.string(),
  negativePrompt: z.string(),
})

/** Subjek/karakter dengan deskripsi fisik yang dipakai ulang di tiap part. */
export const subjectSchema = z.object({
  id: z.string(),
  role: z.string(),
  identityAnchor: z.string(),
  referenceImages: z.array(z.string()).default([]),
})

export const shotSchema = z.object({
  type: z.string(),
  lens: z.string(),
  framing: z.string(),
  movement: z.string(),
})

/** Satu beat bertimestamp di dalam part. */
export const beatSchema = z.object({
  time: z.string(),
  action: z.string(),
})

export const audioSchema = z.object({
  dialogue: z.string().default(""),
  sfx: z.string().default(""),
  ambient: z.string().default(""),
})

export const editorNotesSchema = z.object({
  textOverlay: z.string().default(""),
  musicCue: z.string().default(""),
  transitionToNext: z.string().default(""),
})

/** Bagaimana part ini disambung ke part sebelumnya di Flow. */
export const continuitySchema = z.enum(["new", "extend", "firstLastFrame"])

/** Satu part = satu generate di Flow. */
export const partSchema = z.object({
  index: z.number().int().min(1),
  label: z.string(),
  durationSec: z.number().int().min(4).max(10),
  continuity: continuitySchema.default("new"),
  ingredients: z.array(z.string()).default([]),
  shot: shotSchema,
  subject: z.string(),
  action: z.string(),
  scene: z.string(),
  lighting: z.string(),
  timeline: z.array(beatSchema).min(1),
  audio: audioSchema,
  editorNotes: editorNotesSchema,

  // --- Khusus resep `continuousTransformation` (timelapse) ---
  // Opsional supaya hasil lama (promptVersion 2) tetap bisa diparse.

  /**
   * Enumerasi padat tahap konstruksi yang muncul di dalam SATU gerakan kamera
   * menerus. Makin rapat tahapnya, makin meyakinkan transformasinya.
   */
  stages: z.array(z.string()).optional().default([]),
  /** Klimaks yang menjangkar hasil akhir ke gambar referensi. */
  finalReveal: z.string().optional().default(""),
  /** Ringkasan gaya kamera, ditaruh di baris penutup prompt. */
  cameraSummary: z.string().optional().default(""),
})

/** Apa yang diminta DARI AI (tanpa prompt terkompilasi). */
export const aiVideoPlanSchema = z.object({
  title: z.string(),
  styleBible: styleBibleSchema,
  subjects: z.array(subjectSchema).default([]),
  parts: z.array(partSchema).min(1),
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
