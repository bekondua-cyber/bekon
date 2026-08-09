/**
 * Pilihan model Gemini yang boleh dipakai.
 *
 * Daftar ini SENGAJA kurasi, bukan hasil query ke API Google, karena tidak
 * semua model yang terdaftar bisa dipakai:
 *
 * - `gemini-2.0-flash` (default lama) sudah rutin membalas 429 "quota exceeded".
 * - `gemini-2.5-flash` dan `gemini-2.5-flash-lite` membalas 404 "no longer
 *   available to new users" — banyak panduan di internet masih
 *   merekomendasikannya, tapi akun baru tidak bisa memakainya.
 *
 * Semua id di bawah sudah diuji langsung ke API dan terbukti membalas 200.
 *
 * Catatan kuota: Google berhenti menerbitkan angka batas harian per model di
 * dokumentasinya dan mengarahkan ke AI Studio. Yang konsisten dari pola
 * mereka, varian "lite" mendapat batas harian paling longgar dan paling cepat
 * merespons. Angka pastinya lihat https://aistudio.google.com/rate-limit
 */
export interface GeminiModelOption {
  id: string
  label: string
  note: string
}

export const GEMINI_MODEL_OPTIONS: GeminiModelOption[] = [
  {
    id: "gemini-flash-lite-latest",
    label: "Flash Lite — terbaru otomatis",
    note: "Paling ringan dan paling cepat (~0,8 detik saat diuji). Varian lite biasanya dapat jatah harian paling besar. Otomatis mengikuti versi lite terbaru Google.",
  },
  {
    id: "gemini-3.5-flash-lite",
    label: "Gemini 3.5 Flash Lite",
    note: "Seringan pilihan di atas, tapi versinya dikunci — hasilnya tidak berubah sendiri saat Google merilis versi baru.",
  },
  {
    id: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash Lite",
    note: "Versi lite sebelumnya. Pakai ini kalau 3.5 bermasalah.",
  },
  {
    id: "gemini-flash-latest",
    label: "Flash — terbaru otomatis",
    note: "Lebih pintar dari Lite, cocok untuk artikel panjang. Lebih lambat dan jatah hariannya lebih kecil.",
  },
  {
    id: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    note: "Flash penuh dengan versi dikunci. Pilihan paling seimbang untuk hasil rapi.",
  },
  {
    id: "gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
    note: "Paling baru. Paling lambat saat diuji (~3 detik) — pakai kalau kualitas lebih penting dari kecepatan.",
  },
  {
    id: "gemini-3-flash-preview",
    label: "Gemini 3 Flash (preview)",
    note: "Masih preview: Google bisa mengubah atau menghentikannya sewaktu-waktu.",
  },
]

/**
 * Default baru. Yang lama, `gemini-2.0-flash`, sudah rutin kena 429 sehingga
 * seluruh fitur AI gagal setiap kali jatahnya habis.
 */
export const DEFAULT_GEMINI_MODEL = "gemini-flash-lite-latest"

/** Kunci baris di tabel `setting` tempat pilihan admin disimpan. */
export const GEMINI_MODEL_SETTING_KEY = "ai_gemini_model"

export function isKnownGeminiModel(id: string): boolean {
  return GEMINI_MODEL_OPTIONS.some((m) => m.id === id)
}
