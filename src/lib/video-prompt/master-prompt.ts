import { BEKON_BRAND_CONTEXT } from "@/lib/ai/brand"
import type { VideoCategory } from "@/lib/video-categories"

/**
 * Negative prompt dasar khas video konstruksi. Ditulis deskriptif (bukan
 * "no X") sesuai panduan Veo, dan menutup artefak yang paling sering muncul
 * pada adegan proyek: struktur melengkung, besi melayang, alat berat morphing.
 */
/**
 * Negative prompt khusus timelapse. Selain artefak umum, menutup kegagalan
 * paling merusak pada video transformasi: desain rumah berubah di tengah klip.
 */
export const TIMELAPSE_NEGATIVE_PROMPT =
  "cartoon style, unrealistic construction, changing house design mid-shot, " +
  "wrong architecture, extra floors appearing, distorted building, floating objects, " +
  "unrealistic workers, bad anatomy, deformed hands, shaky drone movement, " +
  "camera cuts, warped windows, blurry details, low resolution, on-screen text, watermark"

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

/**
 * Aturan tambahan untuk timelapse. Menggantikan struktur beat dengan satu
 * gerakan kamera menerus, dan meminta isi prompt dalam bahasa Inggris karena
 * Veo jauh lebih patuh pada instruksi berbahasa Inggris.
 */
function continuousRecipeRules(partCount: number, durationPerPart: number): string {
  // Cakupan cerita per part. Untuk 1 part, klip itu harus menceritakan
  // keseluruhan pembangunan — sebelumnya tidak ada aturan sama sekali untuk
  // kasus ini sehingga AI berhenti di tahap pondasi.
  const arcRule =
    partCount === 1
      ? `=== CAKUPAN (WAJIB) ===
HANYA ADA 1 PART. Part tunggal ini WAJIB menceritakan SELURUH pembangunan dari
lahan kosong sampai rumah JADI dan siap huni, dipadatkan pas ${durationPerPart} detik.
DILARANG berhenti di tahap pondasi, dinding, atau atap. Akhir klip HARUS
memperlihatkan rumah yang sudah selesai sepenuhnya beserta taman/landscaping.
"subject" dan "action" harus menyatakan BUSUR PERUBAHAN itu, bukan tahap awal saja.
  BENAR: subject "an empty 200 square metre plot of overgrown land",
         action "transforming into a completed luxury two-storey modern house"
  SALAH: action "being cleared by two workers installing wooden bowplank stakes"
         ← itu cuma tahap pertama, bukan busur perubahan`
      : `=== CAKUPAN (WAJIB) ===
Ada ${partCount} part. Bagi keseluruhan progres konstruksi menjadi ${partCount} rentang
tahap yang berurutan dan TIDAK tumpang tindih. Part TERAKHIR wajib berakhir pada
rumah yang sudah JADI sepenuhnya beserta landscaping.
"subject" dan "action" tiap part menyatakan busur perubahan part itu, bukan satu tahap saja.`

  return `
=== RESEP KHUSUS: TRANSFORMASI MENERUS (paling penting, baca dulu) ===
Video ini BUKAN rangkaian potongan adegan. Setiap part adalah SATU gerakan kamera
menerus selama ${durationPerPart} detik tanpa cut sama sekali. Yang berubah adalah
BANGUNANNYA, bukan shot-nya.

${arcRule}

1. "shot.movement" harus satu gerakan menerus yang bisa berjalan penuh ${durationPerPart} detik.
   BENAR: "slow continuous 360-degree drone orbit", "steady rising crane shot"
   SALAH: "cut to close-up", "slow dolly-in lalu pindah ke wide"

2. Isi "stages" sebagai ARRAY JSON berisi MINIMAL 12 dan maksimal 18 tahap konstruksi
   berurutan yang muncul SELAMA gerakan kamera itu. Kurang dari 12 membuat transformasi
   terasa melompat dan tidak meyakinkan — hitung dulu sebelum mengirim.
   ${partCount === 1 ? "Karena hanya ada 1 part, daftar ini WAJIB membentang dari persiapan lahan sampai landscaping rumah jadi." : ""}
   Tiap elemen array ditulis singkat. Contoh persis bentuknya:
   "stages": ["empty land preparation", "survey workers marking the area", "excavators digging foundations"]
   Contoh isi tahap: "empty land preparation", "survey workers marking the area",
   "excavators digging foundations", "workers installing steel reinforcement",
   "pouring concrete foundation", "building brick walls", "constructing columns and beams",
   "installing roof structures", "workers on scaffolding", "plastering", "painting",
   "installing windows", "exterior stone finishing", "lighting installation", "landscaping"

3. Isi "finalReveal" dengan klimaks yang KAYA, minimal 25 kata, bukan sekadar status.
   Wajib memuat: kamera naik lebih tinggi sambil tetap mengorbit, rumah jadi terungkap
   dengan rincian arsitekturnya, lalu pull-back sinematik gaya iklan properti premium.
   BENAR: "As the timelapse completes, the drone gradually rises higher while continuing
          the orbit, revealing the finished two-storey house with elegant white facade,
          large windows, stone accents, balcony and manicured garden, ending with a slow
          cinematic pull-back showcasing the entire property."
   SALAH: "Lahan yang sudah dipersiapkan untuk pembangunan"  ← status, bukan klimaks

4. Isi "cameraSummary" dengan ringkasan gaya kamera, huruf kecil semua.
   Contoh: "cinematic drone FPV, slow 360-degree orbit, smooth aerial tracking, parallax movement, rising reveal shot"

4b. Isi "lighting" dengan pencahayaan yang BERUBAH seiring waktu, bukan statis —
   itu ciri khas timelapse. Contoh: "natural sunlight progressing from early morning
   through midday to golden hour as the build advances".

5. "timeline" TETAP WAJIB diisi 3 beat sebagai ringkasan progres untuk dibaca admin.
   Isinya ringkas saja; yang menentukan kualitas video adalah "stages".

6. BAHASA INGGRIS WAJIB untuk field yang dikirim ke Veo. Ini paling sering dilanggar —
   panduan di atas berbahasa Indonesia, tapi ISI JAWABANMU untuk field berikut harus
   Inggris seluruhnya: "subject", "action", "scene", "lighting", "stages",
   "finalReveal", "cameraSummary", "shot.*", "audio.sfx", "audio.ambient",
   dan SEMUA field di "styleBible".
   BENAR: scene "the outskirts of Serang, clear sky, coconut palms in the distance"
   SALAH: scene "pinggiran kota Serang, langit cerah, deretan pohon kelapa di kejauhan"
   BENAR: lighting "morning sunlight from the right as key, sky bounce as fill"
   SALAH: lighting "sinar matahari pagi dari sisi kanan sebagai key"
   BENAR: styleBible.visualStyle "cinematic construction timelapse, photorealistic"
   SALAH: styleBible.visualStyle "Cinematic Timelapse, Palet warna netral"
   Nilai gaya/tone/struktur yang diberikan padamu berbahasa Indonesia —
   TERJEMAHKAN dulu ke Inggris, jangan disalin apa adanya.

${partCount > 1 ? `Karena ada ${partCount} part, bagi keseluruhan progres konstruksi menjadi ${partCount} rentang tahap yang berurutan dan tidak tumpang tindih. Tiap part tetap satu gerakan kamera menerus sendiri.` : ""}
`
}

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
  /** True bila admin memilih karakter atau bahan referensi. */
  hasAssets: boolean
}

export function buildMasterPrompt(input: MasterPromptInput): string {
  const {
    categoryInfo, partCount, durationPerPart, aspectRatio, platform,
    tone, style, structure, deliveryMode, portfolioContext, subjectsContext, hasAssets,
  } = input

  // Panduan kategori seperti Timelapse berbunyi "jangan pakai talent kecuali
  // diminta eksplisit". Memilih aset di UI ADALAH permintaan eksplisit itu,
  // jadi presedennya perlu dinyatakan supaya AI tidak mengabaikan pilihan admin.
  const assetPrecedence = hasAssets
    ? `
=== PRIORITAS INSTRUKSI (penting) ===
Admin SUDAH memilih karakter/bahan referensi (lihat bagian SUBJEK & BAHAN REFERENSI di bawah). Itu permintaan EKSPLISIT dan MENGALAHKAN panduan kategori yang menyarankan tanpa talent.
Setiap aset yang dipilih WAJIB dipakai di minimal satu part, dan id-nya dicantumkan di "ingredients" part tersebut.
Untuk video konstruksi, pakai bahan referensi sebagai acuan tampilan bangunan JADI — lampirkan di part akhir yang menampilkan hasil finishing. Karakter cocok ditempatkan sebagai arsitek/mandor yang meninjau proyek, bukan presenter yang berbicara ke kamera.
`
    : ""

  const isContinuous = categoryInfo.promptRecipe === "continuousTransformation"

  // Satu aturan bahasa saja. Sebelumnya resep menerus meminta Bahasa Inggris
  // sementara baris penutup meminta Bahasa Indonesia — model menerima dua
  // perintah yang bertabrakan.
  const languageRule = isContinuous
    ? `=== BAHASA ===
Tulis isi field "subject", "action", "scene", "lighting", "stages", "finalReveal", "cameraSummary", dan seluruh "styleBible" dalam BAHASA INGGRIS — Veo jauh lebih patuh pada instruksi berbahasa Inggris.
Tulis "title", "label", "editorNotes", dan "timeline[].action" dalam Bahasa Indonesia (itu untuk dibaca admin, tidak dikirim ke Veo).`
    : `=== BAHASA ===
Tulis seluruh isi dalam Bahasa Indonesia, KECUALI istilah sinematografi dan awalan "SFX:"/"Ambient noise:" yang tetap dalam bahasa Inggris.`

  // Satu instruksi negativePrompt saja, sesuai resep.
  const negativePromptRule = `Untuk "styleBible.negativePrompt", gunakan PERSIS teks ini:
"${isContinuous ? TIMELAPSE_NEGATIVE_PROMPT : CONSTRUCTION_NEGATIVE_PROMPT}"`

  const deliveryRule =
    deliveryMode === "onCameraDialogue"
      ? `Karakter BERBICARA langsung ke kamera. Isi "audio.dialogue" dengan format: Karakter berkata: "kalimat pendek". Maksimal 12 kata per part supaya pas dengan durasi dan lip-sync tetap wajar. Gunakan Bahasa Indonesia sehari-hari.`
      : `JANGAN gunakan dialog on-camera. Kosongkan "audio.dialogue". Narasi disampaikan lewat voiceover saat editing, jadi cukup rancang visual B-roll yang kuat. Tulis kalimat voiceover yang disarankan di "editorNotes.textOverlay" bila perlu.`

  return `Kamu adalah sutradara sekaligus prompt engineer video untuk Google Flow (model Veo). ${BEKON_BRAND_CONTEXT}

TUGAS: susun rencana video menjadi ${partCount} part. Satu part = satu generate di Flow = ${durationPerPart} detik.

${categoryInfo.promptRecipe === "continuousTransformation" ? continuousRecipeRules(partCount, durationPerPart) : ""}
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
${assetPrecedence}

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
${negativePromptRule}

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
      "editorNotes": { "textOverlay": "...", "musicCue": "...", "transitionToNext": "..." }${
        categoryInfo.promptRecipe === "continuousTransformation"
          ? `,
      "stages": ["empty land preparation", "survey workers marking the area", "..."],
      "finalReveal": "...",
      "cameraSummary": "..."`
          : ""
      }
    }
  ]
}

${languageRule}

Buat tepat ${partCount} part. SELURUH field di atas wajib ada di setiap part — jangan hilangkan satu pun, termasuk "shot", "audio", "editorNotes", dan "timeline".`
}
