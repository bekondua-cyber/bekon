import type { PromptRecipe } from "@/lib/video-categories"
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

function stripTrailingDot(text: string): string {
  return text.trim().replace(/\.+$/, "")
}

/**
 * Sematkan kata depan hanya bila nilainya belum membawa sendiri.
 *
 * AI kerap mengembalikan scene "di sebuah rumah minimalis di Serang" meski
 * definisi field melarangnya, dan kompilator lama menempelkan "di" lagi di
 * depan — hasilnya "di di sebuah rumah minimalis".
 */
function withPreposition(value: string, preposition: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""
  const pattern = new RegExp(`^${preposition}\\s`, "i")
  return pattern.test(trimmed) ? lowerFirst(trimmed) : `${preposition} ${lowerFirst(trimmed)}`
}

/**
 * AI kadang mengembalikan nilai berkapital seperti "Sinar matahari pagi" yang
 * jadi janggal di tengah kalimat. Huruf pertama diturunkan kecuali kata itu
 * memang nama diri (kata kedua juga berkapital, mis. "Serang Timur").
 */
function lowerFirst(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ""
  const words = trimmed.split(/\s+/)
  if (words.length > 1 && /^[A-Z]/.test(words[1])) return trimmed
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1)
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

  const shotLine = joinNonEmpty(
    [part.shot.movement, part.shot.type, part.shot.lens, part.shot.framing].map(lowerFirst),
    ", "
  )

  // Field kosong kini mungkin (schema toleran), jadi setiap potongan kalimat
  // hanya ikut kalau ada isinya — mencegah "di , disinari ."
  //
  // Subjek dan aksi dipisah KOMA, bukan spasi. Aturannya meminta "action"
  // diawali kata kerja, tapi model sering mengirim klausa bersubjek sendiri
  // ("seorang desainer memilih warna"); tanpa koma keduanya menempel jadi
  // kalimat rusak: "ruangan kosong seorang desainer memilih warna".
  const focus = joinNonEmpty([lowerFirst(part.subject), lowerFirst(part.action)], ", ")
  const place = joinNonEmpty(
    [
      withPreposition(part.scene, "di"),
      withPreposition(part.lighting, "disinari"),
    ],
    ", "
  )
  const body = joinNonEmpty([`${identityLine}${focus}`, place], ", ")
  const opening = `${ingredientLine}${shotLine ? `${shotLine}: ` : ""}${body}.`

  const beats = part.timeline.map((b) => `[${b.time}] ${b.action}`).join("\n")

  const style = `Style: ${styleBible.visualStyle}, ${styleBible.colorPalette}.`

  // Dialog diberi penanda "(no subtitles)" karena Veo cenderung menempelkan
  // subtitle otomatis kalau tidak dilarang eksplisit. Ketiganya dipisah titik
  // supaya "SFX:" dan "Ambient noise:" tidak dempet jadi satu kalimat.
  const audio = joinNonEmpty(
    [
      part.audio.dialogue ? `${part.audio.dialogue} (no subtitles)` : "",
      stripTrailingDot(part.audio.sfx),
      stripTrailingDot(part.audio.ambient),
    ],
    ". "
  )
  const audioLine = audio ? `Audio: ${audio}.` : ""

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
 * Prompt untuk konten bergaya kreator: potongan cepat, ritme padat.
 *
 * Ditulis Bahasa Inggris seperti resep timelapse — Veo jauh lebih patuh.
 * Perbedaan pokok dari `compileNaturalPrompt`: setiap beat dinyatakan sebagai
 * POTONGAN BARU secara eksplisit, dan ada satu baris ritme di akhir. Tanpa
 * penegasan itu Veo cenderung merender satu shot panjang yang tenang.
 */
export function compileFastCutPrompt(
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

  const optics = joinNonEmpty([part.shot.type, part.shot.lens, part.shot.framing], ", ")
  const movement = part.shot.movement.trim() || "fast handheld follow"

  const focus = joinNonEmpty([part.subject, part.action], ", ")
  const place = joinNonEmpty(
    [part.scene ? `in ${part.scene}` : "", part.lighting ? `lit by ${part.lighting}` : ""],
    ", "
  )

  const opening = `${ingredientLine}Fast-paced social media style clip, ${part.durationSec} seconds. ${identityLine}${joinNonEmpty([focus, place], ", ")}.`
  const camera = `Camera: ${movement}${optics ? ` (${optics})` : ""}, energetic and precise.`

  // "Quick cut to" ditulis di depan tiap beat karena timestamp saja tidak cukup
  // menyuruh Veo memotong — model membacanya sebagai satu adegan berdurasi.
  const beats = part.timeline
    .map((b, i) => `[${b.time}] ${i === 0 ? "" : "Quick cut to: "}${b.action}`)
    .join("\n")

  const rhythm =
    part.timeline.length > 1
      ? `Editing rhythm: ${part.timeline.length} rapid cuts across ${part.durationSec} seconds, each cut changing angle or framing. No lingering shots.`
      : ""

  const style = `Style: ${styleBible.visualStyle}, ${styleBible.colorPalette}.`

  const audio = joinNonEmpty(
    [
      part.audio.dialogue ? `${part.audio.dialogue} (no subtitles)` : "",
      stripTrailingDot(part.audio.sfx),
      stripTrailingDot(part.audio.ambient),
    ],
    ". "
  )
  const audioLine = audio ? `Audio: ${audio}.` : ""

  const avoid = `Avoid: ${styleBible.negativePrompt}.`

  return joinNonEmpty([opening, camera, beats, rhythm, style, audioLine, avoid], "\n\n")
}

/**
 * Objek JSON bersih untuk ditempel ke Flow. Sengaja TIDAK memuat
 * `editorNotes` (itu untuk CapCut) maupun `naturalPrompt`.
 */
export function compileJsonPrompt(
  part: VideoPart,
  styleBible: StyleBible,
  subjects: Subject[],
  aspectRatio: string,
  recipe: PromptRecipe = "beatSequence"
): Record<string, unknown> {
  const used = subjects.filter((s) => part.ingredients.includes(s.id))
  const isContinuous = recipe === "continuousTransformation"

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
    // Timelapse memakai daftar tahap dalam satu shot menerus; timestamp justru
    // menyuruh Veo memotong adegan dan merusak ilusi transformasi.
    ...(isContinuous
      ? {
          camera_continuity: "single uninterrupted camera move, no cuts",
          construction_stages: part.stages,
          final_reveal: part.finalReveal,
        }
      : {
          timeline: part.timeline.map((b) => ({ time: b.time, action: b.action })),
          // Timestamp saja tidak cukup menyuruh Veo memotong; ritmenya perlu
          // dinyatakan eksplisit seperti di prompt naturalnya.
          ...(recipe === "fastCutSequence"
            ? {
                editing_rhythm: `${part.timeline.length} rapid cuts across ${part.durationSec} seconds, each cut changes angle or framing`,
              }
            : {}),
        }),
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

/**
 * Prompt untuk timelapse konstruksi: SATU gerakan kamera menerus sepanjang
 * klip, yang berubah adalah bangunannya. Sengaja tanpa beat bertimestamp —
 * timestamp menyuruh Veo memotong adegan, dan potongan merusak ilusi
 * transformasi. Ditulis dalam bahasa Inggris karena Veo jauh lebih patuh
 * pada instruksi berbahasa Inggris.
 */
export function compileContinuousPrompt(
  part: VideoPart,
  styleBible: StyleBible,
  subjects: Subject[],
  isOnlyPart = false
): string {
  const used = subjects.filter((s) => part.ingredients.includes(s.id))
  const hasReference = used.length > 0

  const referenceClause = hasReference ? " based on the reference image" : ""
  const ingredientLine = hasReference
    ? `Using the provided images for ${used.map((s) => s.role).join(", ")}. `
    : ""

  const focus = joinNonEmpty([part.subject, part.action], " ") || part.label

  // Saat hanya ada satu part, klip itu harus menceritakan pembangunan penuh.
  // Frasa penegas dilewati bila isian AI sudah menyebut transformasi sendiri,
  // supaya tidak jadi "transformation of ... transforming into".
  const alreadySaysTransform = /transform/i.test(focus)
  const scope = isOnlyPart && !alreadySaysTransform ? "the complete transformation of " : ""
  const opening =
    `${ingredientLine}Create a cinematic ${part.durationSec}-second timelapse video showing ` +
    `${scope}${focus}${referenceClause}.`

  // Kamera dinyatakan menerus dua kali — di awal dan setelah daftar tahap —
  // karena inilah instruksi yang paling sering diabaikan model.
  // Kata "continuous" tidak ditambahkan bila nilai movement sudah memuatnya,
  // supaya tidak jadi "continuous slow continuous 360-degree orbit".
  // Schema kini toleran terhadap field kosong, jadi lensa/framing yang hilang
  // tidak boleh menghasilkan tanda kurung kosong "( , )".
  const movement = part.shot.movement.trim() || "slow continuous drone orbit"
  const alreadyContinuous = /continuous|uninterrupted|unbroken/i.test(movement)
  const optics = joinNonEmpty([part.shot.lens, part.shot.framing], ", ")
  const cameraBehavior =
    `The entire video is filmed with ${alreadyContinuous ? "a single" : "one smooth, continuous"} ` +
    `${movement}${optics ? ` (${optics})` : ""}. The camera never cuts.`

  const stagesLine = part.stages.length
    ? `During the shot, show realistic construction stages appearing naturally in order: ${part.stages.join(", ")}.`
    : part.timeline.map((b) => b.action).join(", ")

  const place = joinNonEmpty(
    [part.scene ? `in ${part.scene}` : "", part.lighting ? `lit by ${part.lighting}` : ""],
    ", "
  )
  const continuity =
    `The camera maintains the same path and perspective throughout the entire transformation ` +
    `while the building grows${place ? `, ${place}` : ""}.`

  const reveal = part.finalReveal
    ? hasReference
      ? `${part.finalReveal} Match the exact same architectural style as the reference image.`
      : part.finalReveal
    : ""

  const style = `${styleBible.visualStyle}, ${styleBible.colorPalette}, ultra realistic architectural visualization, 4K, highly detailed.`

  const audio = joinNonEmpty(
    [stripTrailingDot(part.audio.sfx), stripTrailingDot(part.audio.ambient)],
    ". "
  )
  const audioLine = audio ? `Audio: ${audio}.` : ""

  const cameraLine = part.cameraSummary ? `Camera: ${lowerFirst(part.cameraSummary)}.` : ""

  const avoid = `Avoid: ${styleBible.negativePrompt}.`

  return joinNonEmpty(
    [opening, cameraBehavior, stagesLine, continuity, reveal, style, audioLine, cameraLine, avoid],
    "\n\n"
  )
}

export function compilePart(
  part: VideoPart,
  styleBible: StyleBible,
  subjects: Subject[],
  aspectRatio: string,
  recipe: PromptRecipe = "beatSequence",
  totalParts = 1
): CompiledPart {
  const naturalPrompt =
    recipe === "continuousTransformation"
      ? compileContinuousPrompt(part, styleBible, subjects, totalParts === 1)
      : recipe === "fastCutSequence"
        ? compileFastCutPrompt(part, styleBible, subjects)
        : compileNaturalPrompt(part, styleBible, subjects)

  return {
    ...part,
    naturalPrompt,
    jsonPrompt: compileJsonPrompt(part, styleBible, subjects, aspectRatio, recipe),
  }
}
