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

/**
 * Negative prompt untuk video interior/properti (tips, house tour, testimoni,
 * before-after). Sebelumnya kategori-kategori ini memakai negative prompt
 * konstruksi, sehingga video tips desain interior ikut membawa "scaffolding
 * melengkung" dan "alat berat berubah bentuk" — tidak relevan, boros token,
 * dan justru mengarahkan perhatian model ke lokasi proyek.
 */
export const INTERIOR_NEGATIVE_PROMPT =
  "teks di layar, watermark, subtitle, logo, tangan atau jari cacat, jari berlebih, " +
  "wajah berubah antar frame, furnitur melayang, perabot meleleh atau berubah bentuk, " +
  "proporsi ruangan tidak wajar, garis dinding bengkok, gerakan bergetar, " +
  "kedipan cahaya, gambar buram, resolusi rendah"

/** Versi Inggris — dipakai resep fastCut yang seluruh field visualnya Inggris. */
export const INTERIOR_NEGATIVE_PROMPT_EN =
  "on-screen text, watermark, subtitle, logo, deformed hands, extra fingers, " +
  "face changing between frames, floating furniture, melting or morphing objects, " +
  "unnatural room proportions, warped wall lines, shaky footage, light flicker, " +
  "blurry image, low resolution"

export const CONSTRUCTION_NEGATIVE_PROMPT_EN =
  "on-screen text, watermark, subtitle, logo, warped scaffolding, " +
  "rebar floating without support, morphing heavy machinery, deformed worker hands, " +
  "extra limbs, face changing between frames, shaky footage, light flicker, " +
  "distorted building perspective, blurry image, low resolution"

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
 * Kosakata kamera untuk resep fastCut. Sengaja TIDAK memuat kata "slow".
 * Daftar lama diawali gerakan lambat dan contohnya menulis "slow dolly-in",
 * sehingga model menjangkar ke sana — hasilnya setiap part jadi "slow dolly-in",
 * "slow pan", "slow zoom-in": persis kebalikan dari ritme konten kreator.
 */
const FAST_CAMERA_VOCABULARY =
  "whip pan, snap zoom, crash zoom, quick push-in, handheld follow, " +
  "fast tracking shot, gimbal snap-turn, rack focus, top-down insert shot, " +
  "punch-in, arc around subject"

/** Format detik jadi cap waktu MM:SS. */
function stamp(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.round(totalSeconds % 60)
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/**
 * Rencana beat untuk resep fastCut.
 *
 * Resep lama mengunci 3 beat dengan beat tengah selebar 5 detik — satu aksi
 * ditahan setengah durasi klip, yang membuat video terasa lambat. Di sini beat
 * dibuat ~2 detik supaya ritmenya mendekati potongan konten pendek.
 */
export function fastCutBeatPlan(durationSec: number): { time: string; purpose: string }[] {
  const count = Math.max(3, Math.round(durationSec / 2))
  const step = durationSec / count

  return Array.from({ length: count }, (_, i) => {
    const from = stamp(i * step)
    const to = stamp((i + 1) * step)

    let purpose: string
    if (i === 0) {
      purpose = "HOOK — visual paling menarik, langsung ke inti, tanpa pembukaan"
    } else if (i === count - 1) {
      purpose = "PAYOFF — hasil akhir yang memuaskan mata, jadi penutup"
    } else {
      purpose = `langkah ${i} — satu aksi/detail konkret yang baru`
    }

    return { time: `${from}-${to}`, purpose }
  })
}

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

/**
 * Aturan resep fastCut: ritme konten kreator.
 *
 * Tiga hal yang paling menentukan dan paling sering dilanggar model:
 * potongan cepat, gerakan kamera yang TIDAK lambat, dan narasi yang benar-benar
 * mengisi durasi (bukan 5 kata untuk 10 detik).
 */
function fastCutRecipeRules(partCount: number, durationPerPart: number): string {
  const beats = fastCutBeatPlan(durationPerPart)
  const beatLines = beats.map((b) => `   - [${b.time}] ${b.purpose}`).join("\n")

  const singlePartRule =
    partCount === 1
      ? `
=== HANYA 1 PART (WAJIB) ===
Klip tunggal ini harus terasa seperti satu potong konten utuh yang selesai di
${durationPerPart} detik: hook di detik pertama, isi yang padat, dan penutup yang memuaskan.
DILARANG menyisakan kesan "bersambung" — tidak ada part berikutnya.
Karena semuanya harus muat di ${durationPerPart} detik, ${beats.length} beat itu WAJIB terisi penuh;
jangan menahan satu aksi lebih dari ${Math.round((durationPerPart / beats.length) * 10) / 10} detik.`
      : `
=== ${partCount} PART ===
Tiap part membahas SATU poin/tips berbeda dan berdiri sendiri, tapi lokasi, karakter,
dan waktu hari HARUS konsisten di semua part — klip-klip ini akan digabung jadi satu
video. DILARANG berpindah kota antar part (mis. part 1 di Serang lalu part 2 di Cilegon)
dan DILARANG berpindah waktu (pagi → siang → sore). Pilih SATU kota dan SATU waktu di
"styleBible.lightingBase", lalu patuhi di seluruh part.`

  return `
=== RESEP KHUSUS: POTONGAN CEPAT ALA KONTEN KREATOR (paling penting, baca dulu) ===
Video ini HARUS terasa seperti konten TikTok/Reels berkualitas tinggi: cepat, padat,
tidak ada detik yang terbuang. BUKAN video korporat yang tenang.
${singlePartRule}

1. "timeline" WAJIB berisi TEPAT ${beats.length} beat dengan cap waktu PERSIS berikut:
${beatLines}
   Tiap beat adalah POTONGAN BARU — sudut, jarak, atau fokus berubah. Jangan
   menahan satu komposisi lebih dari satu beat.

2. Isi tiap "timeline[].action" sebagai DESKRIPSI VISUAL yang bisa dilihat, bukan
   arahan editing. Ini paling sering salah.
   BENAR: "tangan menempelkan swatch cat abu-abu ke dinding, close-up"
   SALAH: "menampilkan ruangan kosong"   ← itu instruksi ke editor, bukan gambar
   SALAH: "menampilkan hasil akhir"      ← tidak ada wujud yang bisa dirender

3. "shot.movement" WAJIB gerakan cepat/energetik. DILARANG memakai kata "slow".
   Pilih dari: ${FAST_CAMERA_VOCABULARY}.
   BENAR: "whip pan", "snap zoom", "handheld follow"
   SALAH: "slow dolly-in", "slow pan", "slow zoom-in"

4. Isi "editorNotes.transitionToNext" dengan transisi cepat yang konkret
   (contoh: "whip pan cut", "match cut pada tangan", "speed ramp 2x").

5. Beat pertama adalah HOOK. Mulai dari aksi atau visual yang sudah menarik —
   JANGAN membuka dengan ruangan kosong, papan nama, atau establishing shot yang
   tenang. Penonton memutuskan lanjut/tidak di 1,5 detik pertama.

6. BAHASA INGGRIS WAJIB untuk field visual yang dikirim ke Veo — model jauh lebih
   patuh pada instruksi berbahasa Inggris. Yang WAJIB Inggris: "subject", "action",
   "scene", "lighting", "shot.*", "timeline[].action", "audio.sfx", "audio.ambient",
   dan SEMUA field di "styleBible".
   BENAR: subject "a bare white living room wall with afternoon light"
   SALAH: subject "sebuah ruangan kosong dengan dinding putih"
   BENAR: styleBible.visualStyle "high-energy social media vlog, crisp handheld, photorealistic"
   SALAH: styleBible.visualStyle "Vlog Biasa"  ← "Biasa" berarti biasa-biasa saja; jangan pernah meminta hasil biasa
   Nilai gaya/tone/struktur yang diberikan padamu berbahasa Indonesia —
   TERJEMAHKAN dulu ke Inggris, jangan disalin apa adanya.
   PENGECUALIAN: "audio.dialogue", "voiceoverScript", "title", "label", dan
   "editorNotes.*" tetap Bahasa Indonesia (itu untuk penonton dan admin Indonesia).
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
  const isFastCut = categoryInfo.promptRecipe === "fastCutSequence"

  // Satu aturan bahasa saja. Sebelumnya resep menerus meminta Bahasa Inggris
  // sementara baris penutup meminta Bahasa Indonesia — model menerima dua
  // perintah yang bertabrakan.
  const languageRule = isContinuous
    ? `=== BAHASA ===
Tulis isi field "subject", "action", "scene", "lighting", "stages", "finalReveal", "cameraSummary", dan seluruh "styleBible" dalam BAHASA INGGRIS — Veo jauh lebih patuh pada instruksi berbahasa Inggris.
Tulis "title", "label", "editorNotes", dan "timeline[].action" dalam Bahasa Indonesia (itu untuk dibaca admin, tidak dikirim ke Veo).`
    : isFastCut
      ? `=== BAHASA ===
Tulis field visual dalam BAHASA INGGRIS: "subject", "action", "scene", "lighting", "shot.*", "timeline[].action", "audio.sfx", "audio.ambient", dan seluruh "styleBible".
Tulis dalam Bahasa Indonesia: "audio.dialogue", "voiceoverScript", "title", "label", dan "editorNotes.*".`
      : `=== BAHASA ===
Tulis seluruh isi dalam Bahasa Indonesia, KECUALI istilah sinematografi dan awalan "SFX:"/"Ambient noise:" yang tetap dalam bahasa Inggris.`

  // Negative prompt dipilih per resep DAN per domain kategori. Dulu semua
  // kategori non-timelapse memakai daftar artefak konstruksi, sehingga video
  // tips interior ikut membawa "scaffolding" dan "alat berat".
  const isConstructionDomain = categoryInfo.negativeDomain === "construction"
  const negativePrompt = isContinuous
    ? TIMELAPSE_NEGATIVE_PROMPT
    : isFastCut
      ? isConstructionDomain
        ? CONSTRUCTION_NEGATIVE_PROMPT_EN
        : INTERIOR_NEGATIVE_PROMPT_EN
      : isConstructionDomain
        ? CONSTRUCTION_NEGATIVE_PROMPT
        : INTERIOR_NEGATIVE_PROMPT

  const negativePromptRule = `Untuk "styleBible.negativePrompt", gunakan PERSIS teks ini:
"${negativePrompt}"`

  // Contoh audio harus sebahasa dengan output yang diminta — model menyalin
  // contoh apa adanya, sehingga contoh Indonesia membuat audio ikut Indonesia
  // meski field ini seharusnya berbahasa Inggris.
  const audioExamples =
    isContinuous || isFastCut
      ? `Isi "audio.sfx" dengan awalan "SFX: " DALAM BAHASA INGGRIS (contoh: "SFX: ${isContinuous ? "heavy machinery rumble, shovels scraping gravel, concrete mixer churning" : "brush strokes on wall, furniture sliding on tile, quick fabric rustle"}").
Isi "audio.ambient" dengan awalan "Ambient noise: " DALAM BAHASA INGGRIS (contoh: "Ambient noise: ${isContinuous ? "open wind across the site, distant construction clatter" : "quiet room tone, soft street hum through an open window"}").`
      : `Isi "audio.sfx" dengan awalan "SFX: " (contoh: "SFX: dentum alat berat, gesekan sekop").
Isi "audio.ambient" dengan awalan "Ambient noise: " (contoh: "Ambient noise: angin terbuka, derik proyek di kejauhan").`

  // Bicara cepat Bahasa Indonesia kira-kira 2–2,5 kata per detik. Batas lama
  // "maksimal 12 kata" menghasilkan 5 kata untuk klip 10 detik — sekitar 8 detik
  // hening, yang justru membuat video terasa lambat dan kosong.
  const minWords = Math.round(durationPerPart * 2.0)
  const maxWords = Math.round(durationPerPart * 2.5)

  const deliveryRule =
    deliveryMode === "onCameraDialogue"
      ? isFastCut
        ? `Karakter BERBICARA langsung ke kamera dengan tempo CEPAT dan energik, seperti kreator konten — bukan presenter formal.

Format "audio.dialogue" HARUS persis: Karakter berkata: "isi kalimat"
Awalannya SELALU kata "Karakter" — jangan diganti "Kamu", "Dia", atau nama lain,
karena itu label pembicara, bukan lawan bicara.

PANJANG KALIMAT: WAJIB ${minWords}–${maxWords} kata untuk klip ${durationPerPart} detik.
Ini syarat keras, bukan saran. Hitung katanya satu per satu sebelum mengirim.
Kalimat pendek menyisakan detik hening dan justru membuat video terasa lambat —
inilah kesalahan yang paling sering terjadi.
  BENAR (${durationPerPart === 10 ? "23" : minWords} kata): Karakter berkata: "Budget renovasi dapur sering bengkak di tiga hal: keramik, kitchen set, dan instalasi air. Kunci ketiganya di awal, jangan di tengah jalan."
  SALAH (5 kata): Karakter berkata: "Pilih warna dinding yang tepat"  ← terlalu pendek, 8 detik hening

Gunakan Bahasa Indonesia percakapan sehari-hari dan boleh menyapa penonton di
DALAM kalimatnya ("kamu", "kalian"). Sebutkan hal spesifik — warna, bahan, ukuran,
angka — jangan saran umum.
Salin kalimat yang sama ke "voiceoverScript" supaya admin punya naskahnya.`
        : `Karakter BERBICARA langsung ke kamera. Isi "audio.dialogue" dengan format: Karakter berkata: "kalimat pendek". Maksimal 12 kata per part supaya pas dengan durasi dan lip-sync tetap wajar. Gunakan Bahasa Indonesia sehari-hari.`
      : isFastCut
        ? `JANGAN gunakan dialog on-camera — kosongkan "audio.dialogue". Narasinya berupa voiceover cepat yang direkam admin saat editing.

Isi "voiceoverScript" dengan naskah siap baca dalam Bahasa Indonesia.
PANJANG: WAJIB ${minWords}–${maxWords} kata untuk klip ${durationPerPart} detik. Syarat keras, bukan saran —
hitung katanya satu per satu sebelum mengirim. Naskah pendek menyisakan detik hening
dan membuat video terasa lambat.
  BENAR (${durationPerPart === 10 ? "23" : minWords} kata): "Budget renovasi dapur sering bengkak di tiga hal: keramik, kitchen set, dan instalasi air. Kunci ketiganya di awal, jangan di tengah jalan."
  SALAH (5 kata): "Pilih warna dinding yang tepat"  ← terlalu pendek

Bertempo cepat dan langsung ke inti. Kalimat pertama adalah hook yang menahan
penonton; kalimat terakhir menutup tuntas. Sebutkan hal spesifik — warna, bahan,
ukuran, angka.
Rancang visual B-roll yang kuat supaya narasi punya gambar pendukung di setiap beat.`
        : `JANGAN gunakan dialog on-camera. Kosongkan "audio.dialogue". Narasi disampaikan lewat voiceover saat editing, jadi cukup rancang visual B-roll yang kuat. Tulis kalimat voiceover yang disarankan di "editorNotes.textOverlay" bila perlu.`

  return `Kamu adalah sutradara sekaligus prompt engineer video untuk Google Flow (model Veo). ${BEKON_BRAND_CONTEXT}

TUGAS: susun rencana video menjadi ${partCount} part. Satu part = satu generate di Flow = ${durationPerPart} detik.

${isContinuous ? continuousRecipeRules(partCount, durationPerPart) : ""}${isFastCut ? fastCutRecipeRules(partCount, durationPerPart) : ""}
=== ATURAN KERAS VEO (wajib dipatuhi) ===
1. Satu part hanya boleh punya SATU aksi utama. Beberapa aksi bersamaan membuat video tidak stabil.
${
  isFastCut
    ? `2. Struktur beat mengikuti RESEP POTONGAN CEPAT di atas — jangan pakai pola 3 beat.`
    : `2. Setiap part harus dipecah menjadi 3 beat bertimestamp yang menutup penuh 0–${durationPerPart} detik:
   - [00:00-00:02] establish: perkenalkan subjek & setting
   - [00:02-00:0${Math.max(4, durationPerPart - 3)}] aksi utama yang jelas
   - [00:0${Math.max(4, durationPerPart - 3)}-00:${String(durationPerPart).padStart(2, "0")}] payoff: reveal, reaksi, atau pose akhir`
}
3. Gunakan istilah sinematografi film, bukan bahasa awam. Contoh gerakan kamera: ${isFastCut ? FAST_CAMERA_VOCABULARY : CAMERA_VOCABULARY}. ${isFastCut ? 'Tulis "whip pan", jangan "kamera bergerak cepat" — dan jangan pernah memakai kata "slow".' : 'Tulis "slow dolly-in", jangan "kamera mendekat".'}
4. Setiap part WAJIB menyebut sumber cahaya fisik yang konkret di field "lighting" (contoh: "sinar matahari sore dari sisi kiri sebagai key, pantulan langit sebagai fill").
5. JANGAN meminta teks apa pun muncul di dalam video. Teks ditambahkan saat editing.
6. Aspect ratio ${aspectRatio}, platform ${platform}, tone ${tone}, gaya visual ${style}, struktur naratif "${structure}".

=== DEFINISI FIELD (patuhi persis, ini penyebab prompt jelek kalau dilanggar) ===
"subject" = WUJUD FISIK yang jadi fokus. Kata benda + ciri konkret, minimal 6 kata.
  BENAR: "hamparan lahan kosong berumput liar seluas 200 meter persegi"
  SALAH: "Lahan Kosong"  ← terlalu pendek, itu label bukan deskripsi

"action" = APA YANG TERJADI PADA SUBJEK ITU. Harus diawali kata kerja, minimal 6 kata.
  JANGAN memulai dengan subjek baru — "subject" dan "action" disambung jadi satu
  kalimat, jadi dua subjek berturut-turut menghasilkan kalimat rusak.
  BENAR: "dibersihkan dua pekerja yang memasang patok bowplank kayu"
  SALAH: "seorang desainer interior memilih warna cat"  ← subjek baru, bukan kata kerja
  SALAH: "Transformasi Lahan"  ← kata benda, bukan aksi

"scene" = LOKASI & SUASANA FISIK. JANGAN mengulang isi "label".
  JANGAN diawali kata depan ("di", "pada", "in", "at") — kompilator sudah
  menambahkannya sendiri, sehingga "di rumah minimalis" menghasilkan "di di rumah minimalis".
  BENAR: "pinggiran kota Serang, langit cerah, deretan pohon kelapa di kejauhan"
  SALAH: "di sebuah rumah minimalis di Serang"      ← diawali kata depan
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

${
  isConstructionDomain
    ? `=== DOMAIN KONSTRUKSI ===
Bila video menampilkan progres pembangunan, ikuti urutan yang logis dan realistis:
${CONSTRUCTION_SEQUENCE}
Jangan melompati tahap. Bangunan tidak boleh muncul instan tanpa proses.
Gunakan detail nyata: excavator, truk molen, vibrator beton, bekisting kayu, tukang mengaduk semen, mandor membaca denah, perancah bambu/besi.
`
    : `=== DOMAIN INTERIOR & PROPERTI ===
Video ini berlatar ruangan/properti jadi, BUKAN lokasi proyek. Jangan memunculkan
perancah, alat berat, atau puing kecuali memang diminta.
Gunakan detail nyata yang bisa dilihat: tekstur cat, sambungan lantai, gorden tertiup
angin, pantulan cahaya di permukaan, tanaman dalam pot, tekstur kayu dan kain.
`
}
=== AUDIO ===
${deliveryRule}
${audioExamples}

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
${
  isFastCut
    ? fastCutBeatPlan(durationPerPart)
        .map((b) => `        { "time": "${b.time}", "action": "..." }`)
        .join(",\n")
    : `        { "time": "00:00-00:02", "action": "..." },
        { "time": "00:02-00:07", "action": "..." },
        { "time": "00:07-00:10", "action": "..." }`
}
      ],
      "audio": { "dialogue": "", "sfx": "SFX: ...", "ambient": "Ambient noise: ..." },
      "editorNotes": { "textOverlay": "...", "musicCue": "...", "transitionToNext": "..." }${
        isFastCut
          ? `,
      "voiceoverScript": "naskah Bahasa Indonesia, ${minWords}-${maxWords} kata"`
          : ""
      }${
        isContinuous
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
