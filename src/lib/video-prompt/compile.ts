import type { CompiledPart, StyleBible, Subject, VideoPart } from "./schema"

/**
 * Batas ~175 kata datang dari panduan Veo: lebih dari itu model mulai
 * mengabaikan instruksi yang saling bersaing.
 */
const MAX_PROMPT_WORDS = 175

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function joinNonEmpty(parts: (string | undefined)[], separator: string): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(separator)
}

/**
 * Rakit prosa siap tempel ke Flow, mengikuti formula:
 * [Gerakan kamera + lensa]: [Subjek] [Aksi], di [Setting], disinari [Cahaya].
 * lalu beat bertimestamp, Style, Audio, dan Hindari.
 *
 * Dikompilasi di kode (bukan diminta ke AI) supaya styleBible terulang persis
 * di setiap part dan panjangnya terkendali.
 */
export function compileNaturalPrompt(
  part: VideoPart,
  styleBible: StyleBible,
  subjects: Subject[]
): string {
  const used = subjects.filter((s) => part.ingredients.includes(s.id))

  const ingredientLine = used.length
    ? `Using the provided images for ${used.map((s) => s.role).join(", ")}. `
    : ""

  const identityLine = used.length
    ? used.map((s) => `${s.role}: ${s.identityAnchor}`).join(". ") + ". "
    : ""

  const opening =
    `${ingredientLine}${part.shot.movement}, ${part.shot.type}, ${part.shot.lens}, ${part.shot.framing}: ` +
    `${identityLine}${part.subject} ${part.action}, di ${part.scene}, disinari ${part.lighting}.`

  const beats = part.timeline.map((b) => `[${b.time}] ${b.action}`).join("\n")

  const style = `Style: ${styleBible.visualStyle}, ${styleBible.colorPalette}.`

  // Dialog diberi penanda "(no subtitles)" karena Veo cenderung menempelkan
  // subtitle otomatis kalau tidak dilarang eksplisit.
  const audio = joinNonEmpty(
    [
      part.audio.dialogue ? `${part.audio.dialogue} (no subtitles)` : "",
      part.audio.sfx,
      part.audio.ambient,
    ],
    " "
  )
  const audioLine = audio ? `Audio: ${audio}` : ""

  const avoid = `Hindari: ${styleBible.negativePrompt}.`

  let prompt = joinNonEmpty([opening, beats, style, audioLine, avoid], "\n\n")

  // Pengaman: kalau tetap kepanjangan, buang baris Style (paling redundan
  // karena warnanya sudah tersirat di deskripsi cahaya) sebelum memotong beat.
  if (countWords(prompt) > MAX_PROMPT_WORDS) {
    prompt = joinNonEmpty([opening, beats, audioLine, avoid], "\n\n")
  }

  return prompt
}

/**
 * Objek JSON bersih untuk ditempel ke Flow. Sengaja TIDAK memuat
 * `editorNotes` (itu untuk CapCut) maupun `naturalPrompt`.
 */
export function compileJsonPrompt(
  part: VideoPart,
  styleBible: StyleBible,
  subjects: Subject[],
  aspectRatio: string
): Record<string, unknown> {
  const used = subjects.filter((s) => part.ingredients.includes(s.id))

  return {
    shot: part.shot,
    subject: used.length
      ? `${part.subject} — ${used.map((s) => `${s.role}: ${s.identityAnchor}`).join("; ")}`
      : part.subject,
    action: part.action,
    scene: part.scene,
    lighting: part.lighting,
    style: styleBible.visualStyle,
    color_palette: styleBible.colorPalette,
    timeline: part.timeline.map((b) => ({ time: b.time, action: b.action })),
    audio: {
      dialogue: part.audio.dialogue ? `${part.audio.dialogue} (no subtitles)` : "",
      sfx: part.audio.sfx,
      ambient: part.audio.ambient,
    },
    negative_prompt: styleBible.negativePrompt,
    technical: {
      aspect_ratio: aspectRatio,
      duration: `${part.durationSec}s`,
    },
  }
}

export function compilePart(
  part: VideoPart,
  styleBible: StyleBible,
  subjects: Subject[],
  aspectRatio: string
): CompiledPart {
  return {
    ...part,
    naturalPrompt: compileNaturalPrompt(part, styleBible, subjects),
    jsonPrompt: compileJsonPrompt(part, styleBible, subjects, aspectRatio),
  }
}
