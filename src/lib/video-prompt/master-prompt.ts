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

=== DEFINISI FIELD (patuhi persis, ini penyebab prompt jelek kalau dilanggar) ===
"subject" = WUJUD FISIK yang jadi fokus. Kata benda + ciri konkret, minimal 6 kata.
  BENAR: "hamparan lahan kosong berumput liar seluas 200 meter persegi"
  SALAH: "Lahan Kosong"  ← terlalu pendek, itu label bukan deskripsi

"action" = APA YANG TERJADI. Harus diawali kata kerja, minimal 6 kata.
  BENAR: "dibersihkan dua pekerja yang memasang patok bowplank kayu"
  SALAH: "Transformasi Lahan"  ← kata benda, bukan aksi

"scene" = LOKASI & SUASANA FISIK. JANGAN mengulang isi "label".
  BENAR: "pinggiran kota Serang, langit cerah, deretan pohon kelapa di kejauhan"
  SALAH: "Lahan Kosong hingga Pembangunan Pondasi"  ← itu label part, bukan lokasi

"shot.type" = jenis shot saja. Pilih satu: establishing shot / wide shot / medium shot / close-up / extreme close-up
"shot.lens" = panjang fokal saja. Pilih satu: 16mm / 24mm / 35mm / 50mm / 85mm. JANGAN tulis "Wide Angle".
"shot.framing" = sudut kamera saja. Pilih satu: eye level / low angle / high angle / bird's eye view / over-the-shoulder
"shot.movement" = SATU gerakan saja, jangan digabung.
  BENAR: "slow dolly-in"     SALAH: "Slow Dolly-in, Drone Orbit"  ← dua gerakan

Tulis semua nilai dengan huruf kecil, kecuali nama tempat/orang.
Jangan mengulang kata yang sama di "subject", "scene", dan "label".

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

Field "continuity" per part — pilih dengan hati-hati, salah pilih bikin hasil di Flow kacau:
- "new" = DEFAULT. Pakai ini bila lokasi, waktu, tahap konstruksi, atau sudut kamera berubah. Timelapse yang melompat antar tahap (pondasi → atap) SELALU "new".
- "extend" = HANYA bila part ini benar-benar melanjutkan shot yang sama persis: lokasi sama, pencahayaan sama, subjek sama, kamera bergerak tanpa terputus. Kalau ragu, pakai "new".
- "firstLastFrame" = transisi before→after dalam satu bingkai yang sama (sangat cocok untuk renovasi).

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
