export type DeliveryMode = "voiceover" | "onCameraDialogue"

/**
 * Bentuk prompt yang dipakai kategori ini.
 *
 * - `beatSequence`: 3 beat bertimestamp, ritme tenang. Cocok untuk konten yang
 *   perlu bernapas (testimoni, house tour, reveal before-after).
 * - `fastCutSequence`: banyak beat pendek (~2 detik) + potongan cepat + narasi
 *   padat. Ritme konten kreator media sosial. Ini yang bikin video terasa
 *   "hidup"; `beatSequence` dengan beat tengah 5 detik terasa lambat sekali.
 * - `continuousTransformation`: satu gerakan kamera menerus tanpa potongan,
 *   yang berubah adalah subjeknya. Wajib untuk timelapse konstruksi —
 *   memotong adegan justru merusak ilusi transformasi.
 */
export type PromptRecipe = "beatSequence" | "fastCutSequence" | "continuousTransformation"

/**
 * Domain artefak yang perlu ditutup negative prompt.
 *
 * Dulu semua kategori memakai negative prompt konstruksi — jadi video tips
 * interior ikut membawa "scaffolding melengkung, besi tulangan melayang, alat
 * berat berubah bentuk". Selain memboroskan token, menyebut alat berat di
 * video interior justru menarik perhatian model ke arah yang salah.
 */
export type NegativeDomain = "construction" | "interior"

export interface VideoCategory {
  id: string
  label: string
  description: string
  icon: string
  structures: string[]
  styles: string[]
  usesCharacter: "optional" | "recommended" | "rare"
  /**
   * Default cara penyampaian. Voiceover lebih aman karena lip-sync Bahasa
   * Indonesia di Veo masih lemah; admin tetap bisa menimpanya per generate.
   */
  defaultDelivery: DeliveryMode
  promptRecipe: PromptRecipe
  negativeDomain: NegativeDomain
  promptGuidance: string
}

export const VIDEO_CATEGORIES: VideoCategory[] = [
  {
    id: "timelapse",
    label: "Timelapse Konstruksi",
    description: "Tanah kosong berubah jadi rumah mewah, aktivitas proyek bergerak cepat",
    icon: "Building2",
    structures: ["Progres Bertahap (lahan → pondasi → struktur → finishing)"],
    styles: ["Cinematic Timelapse", "Drone Aerial", "Time-blur Pekerja"],
    usesCharacter: "rare",
    defaultDelivery: "voiceover",
    promptRecipe: "continuousTransformation",
    negativeDomain: "construction",
    promptGuidance: `Buat video timelapse progres konstruksi. Tunjukkan tahapan berurutan: (1) lahan kosong, (2) pengukuran & pembersihan lahan, (3) penggalian pondasi dengan backhoe, (4) pengecoran pondasi dengan truk molen dan pekerja, (5) pembangunan struktur/dinding, (6) pemasangan atap, (7) finishing eksterior, (8) hasil akhir rumah mewah dengan pencahayaan golden hour. Gunakan elemen visual: pekerja proyek beraktivitas cepat (time-blur), alat berat (backhoe, truk molen/concrete mixer), material bangunan. Gerakan kamera dinamis: drone orbit, push-in, crane shot naik dari level tanah ke atas menunjukkan skala bangunan. Jangan gunakan karakter/talent presenter kecuali diminta eksplisit — fokus ke progres visual bangunan itu sendiri.`,
  },
  {
    id: "tips",
    label: "Tips & Edukasi",
    description: "Karakter menjelaskan tips seputar renovasi, desain, atau bangun rumah",
    icon: "Mic2",
    structures: ["Hook - Body - CTA", "Problem - Solution - CTA"],
    styles: ["Vlog Biasa (kamera statis/tripod)", "Vlog Tongsis (selfie stick, talking to camera)", "Cinematic B-roll + Voiceover"],
    usesCharacter: "recommended",
    defaultDelivery: "onCameraDialogue",
    promptRecipe: "fastCutSequence",
    negativeDomain: "interior",
    promptGuidance: `Buat video edukasi/tips singkat bergaya konten kreator media sosial: cepat, padat, tanpa basa-basi. Karakter (jika dipilih) menjelaskan langsung ke kamera atau lewat voiceover dengan B-roll pendukung. Gaya vlog tongsis: karakter memegang kamera sendiri (selfie stick), talking head close-up, natural dan personal. Gaya vlog biasa: kamera statis/tripod, karakter di frame lebih formal. Sertakan tips konkret dan actionable seputar bisnis konstruksi/renovasi BEKON — sebutkan angka, bahan, atau ukuran spesifik, bukan saran umum.`,
  },
  {
    id: "before-after",
    label: "Before–After Renovasi",
    description: "Transisi dramatis kondisi lama vs hasil renovasi",
    icon: "RefreshCw",
    structures: ["Before - After - CTA", "Hook - Body - CTA"],
    styles: ["Cinematic Reveal", "Split-screen Comparison", "Vlog Walkthrough"],
    usesCharacter: "optional",
    defaultDelivery: "voiceover",
    promptRecipe: "beatSequence",
    negativeDomain: "interior",
    promptGuidance: `Tunjukkan transisi dramatis dari kondisi ruangan/bangunan sebelum renovasi ke hasil akhir setelah renovasi oleh BEKON. Gunakan teknik reveal sinematik (wipe transition, match cut, atau split-screen). Kalau ada karakter, posisikan sebagai pemilik rumah yang takjub melihat hasil, atau sebagai narator yang menjelaskan proses.`,
  },
  {
    id: "house-tour",
    label: "House Tour / Showcase",
    description: "Walkthrough sinematik properti hasil kerja BEKON",
    icon: "Home",
    structures: ["Hook - Body - CTA"],
    styles: ["Cinematic Walkthrough", "Drone Aerial Establishing + Interior Walkthrough", "Vlog Tongsis Tour"],
    usesCharacter: "optional",
    defaultDelivery: "voiceover",
    promptRecipe: "beatSequence",
    negativeDomain: "interior",
    promptGuidance: `Buat video tur properti (rumah/kost/ruko) hasil kerja BEKON, dimulai dari establishing shot eksterior (bisa drone aerial), lalu masuk ke dalam menunjukkan ruangan demi ruangan dengan gerakan kamera smooth (gimbal/steadicam feel). Highlight detail desain interior/eksterior yang jadi nilai jual.`,
  },
  {
    id: "testimoni",
    label: "Testimoni Klien",
    description: "Dramatisasi ulasan/testimoni klien jadi adegan video",
    icon: "MessageCircleHeart",
    structures: ["Hook - Body - CTA"],
    styles: ["Talking Head Interview Style", "Vlog Natural"],
    usesCharacter: "recommended",
    defaultDelivery: "onCameraDialogue",
    promptRecipe: "beatSequence",
    negativeDomain: "interior",
    promptGuidance: `Buat video testimoni klien yang dramatis dan meyakinkan. Karakter (jika dipilih) berperan sebagai klien yang bercerita pengalaman menggunakan jasa BEKON, dipadukan dengan B-roll hasil proyek. Gaya interview/talking head yang hangat dan personal, bukan seperti iklan formal.`,
  },
  {
    id: "bts",
    label: "Behind The Scenes",
    description: "Aktivitas proyek sehari-hari, tim kerja BEKON",
    icon: "Users",
    structures: ["Hook - Body - CTA", "Progres Bertahap (lahan → pondasi → struktur → finishing)"],
    styles: ["Vlog Tongsis Dokumenter", "Cinematic Observational", "Fast-cut Montage"],
    usesCharacter: "optional",
    defaultDelivery: "voiceover",
    promptRecipe: "fastCutSequence",
    negativeDomain: "construction",
    promptGuidance: `Tunjukkan aktivitas harian tim BEKON di lapangan/proyek — diskusi tim, pengukuran, koordinasi dengan klien, momen kerja sama tim. Gaya dokumenter natural yang dipotong cepat seperti montase konten kreator, terasa autentik bukan staged. Bisa gunakan karakter sebagai salah satu anggota tim yang memandu penonton.`,
  },
]

export function getCategory(id: string): VideoCategory {
  return VIDEO_CATEGORIES.find((c) => c.id === id) || VIDEO_CATEGORIES[0]
}

export const DURATION_OPTIONS = [5, 8, 10]
export const DEFAULT_DURATION = 10

/**
 * Veo hanya mendukung dua aspect ratio ini. Sebelumnya daftar ini juga memuat
 * "1:1" dan "4:5" yang akan ditolak Flow saat generate.
 */
export const ASPECT_RATIO_OPTIONS = ["9:16", "16:9"]
export const TONE_OPTIONS = ["Profesional", "Santai & Ramah", "Inspiratif", "Edukatif"]
export const PLATFORM_OPTIONS = ["TikTok", "Instagram Reels", "YouTube Shorts"]
