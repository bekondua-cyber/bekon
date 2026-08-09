import { BEKON_BRAND_CONTEXT } from "@/lib/ai/brand"
import type { VideoCategory } from "@/lib/video-categories"

/**
 * Negative prompt dasar khas video konstruksi. Ditulis deskriptif (bukan
 * "no X") sesuai panduan Veo, dan menutup artefak yang paling sering muncul
 * pada adegan proyek: struktur melengkung, besi melayang, alat berat morphing.
 */
export const CONSTRUCTION_NEGATIVE_PROMPT =
  "teks di layar, watermark, subtitle, logo, scaffolding melengkung tidak wajar, " +
  "besi tulangan melayang tanpa penopang, alat berat berubah bentuk, " +
  "tangan atau jari pekerja cacat, anggota badan berlebih, wajah berubah antar frame, " +
  "gerakan bergetar, kedipan cahaya, distorsi perspektif bangunan"

/** Urutan konstruksi wajib logis — mencegah AI memunculkan bangunan instan. */
const CONSTRUCTION_SEQUENCE =
  "lahan kosong → pembersihan & pengukuran (bowplank) → galian pondasi (excavator) → " +
  "pembesian & bekisting → pengecoran (truk molen, vibrator beton) → pasangan dinding bata → " +
  "struktur atap → plester & aci → finishing cat → hasil akhir"

const CAMERA_VOCABULARY =
  "drone orbit, drone pull-back, crane rise, slow dolly-in, tracking shot, " +
  "push-in, hyperlapse locked-off, low angle hero shot, over-the-shoulder, " +
  "gimbal walkthrough, rack focus"

export interface MasterPromptInput {
  categoryInfo: VideoCategory
  partCount: number
  durationPerPart: number
  aspectRatio: string
  platform: string
  tone: string
  style: string
  structure: string
  deliveryMode: "voiceover" | "onCameraDialogue"
  portfolioContext: string
  subjectsContext: string
}

export function buildMasterPrompt(input: MasterPromptInput): string {
  const {
    categoryInfo, partCount, durationPerPart, aspectRatio, platform,
    tone, style, structure, deliveryMode, portfolioContext, subjectsContext,
  } = input

  const deliveryRule =
    deliveryMode === "onCameraDialogue"
      ? `Karakter BERBICARA langsung ke kamera. Isi "audio.dialogue" dengan format: Karakter berkata: "kalimat pendek". Maksimal 12 kata per part supaya pas dengan durasi dan lip-sync tetap wajar. Gunakan Bahasa Indonesia sehari-hari.`
      : `JANGAN gunakan dialog on-camera. Kosongkan "audio.dialogue". Narasi disampaikan lewat voiceover saat editing, jadi cukup rancang visual B-roll yang kuat. Tulis kalimat voiceover yang disarankan di "editorNotes.textOverlay" bila perlu.`

  return `Kamu adalah sutradara sekaligus prompt engineer video untuk Google Flow (model Veo). ${BEKON_BRAND_CONTEXT}

TUGAS: susun rencana video menjadi ${partCount} part. Satu part = satu generate di Flow = ${durationPerPart} detik.

=== ATURAN KERAS VEO (wajib dipatuhi) ===
1. Satu part hanya boleh punya SATU aksi utama. Beberapa aksi bersamaan membuat video tidak stabil.
2. Setiap part harus dipecah menjadi 3 beat bertimestamp yang menutup penuh 0–${durationPerPart} detik:
   - [00:00-00:02] establish: perkenalkan subjek & setting
   - [00:02-00:0${Math.max(4, durationPerPart - 3)}] aksi utama yang jelas
   - [00:0${Math.max(4, durationPerPart - 3)}-00:${String(durationPerPart).padStart(2, "0")}] payoff: reveal, reaksi, atau pose akhir
3. Gunakan istilah sinematografi film, bukan bahasa awam. Contoh gerakan kamera: ${CAMERA_VOCABULARY}. Tulis "slow dolly-in", jangan "kamera mendekat".
4. Setiap part WAJIB menyebut sumber cahaya fisik yang konkret di field "lighting" (contoh: "sinar matahari sore dari sisi kiri sebagai key, pantulan langit sebagai fill").
5. JANGAN meminta teks apa pun muncul di dalam video. Teks ditambahkan saat editing.
6. Aspect ratio ${aspectRatio}, platform ${platform}, tone ${tone}, gaya visual ${style}, struktur naratif "${structure}".

=== KATEGORI: ${categoryInfo.label} ===
${categoryInfo.promptGuidance}

=== DOMAIN KONSTRUKSI ===
Bila video menampilkan progres pembangunan, ikuti urutan yang logis dan realistis:
${CONSTRUCTION_SEQUENCE}
Jangan melompati tahap. Bangunan tidak boleh muncul instan tanpa proses.
Gunakan detail nyata: excavator, truk molen, vibrator beton, bekisting kayu, tukang mengaduk semen, mandor membaca denah, perancah bambu/besi.

=== AUDIO ===
${deliveryRule}
Isi "audio.sfx" dengan awalan "SFX: " (contoh: "SFX: dentum alat berat, gesekan sekop").
Isi "audio.ambient" dengan awalan "Ambient noise: " (contoh: "Ambient noise: angin terbuka, derik proyek di kejauhan").

=== KONSISTENSI ANTAR PART ===
Isi "styleBible" SEKALI dan buat seluruh part patuh padanya — gaya visual, palet warna, dan dasar pencahayaan yang sama, supaya ${partCount} klip terpisah terlihat sebagai satu video utuh.
Untuk "styleBible.negativePrompt", gunakan persis: "${CONSTRUCTION_NEGATIVE_PROMPT}"

Untuk setiap subjek/karakter yang tampil, tulis "identityAnchor" berisi ciri fisik konkret (usia, rambut, pakaian, atribut) dan ULANGI subjek yang sama di part manapun dia muncul. Cantumkan id subjek tersebut di "ingredients" part terkait.

Field "continuity" per part:
- "new" untuk part pembuka atau ganti lokasi/waktu
- "extend" bila part ini kelanjutan mulus dari part sebelumnya (kamera & pencahayaan sama)
- "firstLastFrame" bila part ini transisi before→after (sangat cocok untuk renovasi)

${portfolioContext}
${subjectsContext}

=== FORMAT OUTPUT ===
Kembalikan HANYA JSON valid, tanpa markdown code fence, dengan struktur persis:
{
  "title": "judul video singkat",
  "styleBible": {
    "visualStyle": "...", "colorPalette": "...", "lightingBase": "...", "negativePrompt": "..."
  },
  "subjects": [
    { "id": "kode-singkat", "role": "peran", "identityAnchor": "ciri fisik konkret", "referenceImages": [] }
  ],
  "parts": [
    {
      "index": 1,
      "label": "nama singkat part",
      "durationSec": ${durationPerPart},
      "continuity": "new",
      "ingredients": [],
      "shot": { "type": "...", "lens": "...", "framing": "...", "movement": "..." },
      "subject": "...",
      "action": "...",
      "scene": "...",
      "lighting": "...",
      "timeline": [
        { "time": "00:00-00:02", "action": "..." },
        { "time": "00:02-00:07", "action": "..." },
        { "time": "00:07-00:10", "action": "..." }
      ],
      "audio": { "dialogue": "", "sfx": "SFX: ...", "ambient": "Ambient noise: ..." },
      "editorNotes": { "textOverlay": "...", "musicCue": "...", "transitionToNext": "..." }
    }
  ]
}

Buat tepat ${partCount} part. Tulis seluruh isi dalam Bahasa Indonesia, KECUALI istilah sinematografi dan awalan "SFX:"/"Ambient noise:" yang tetap dalam bahasa Inggris.`
}
