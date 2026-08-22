import { prisma } from "@/lib/prisma"
import {
  DEFAULT_GEMINI_MODEL,
  GEMINI_MODEL_SETTING_KEY,
  isKnownGeminiModel,
} from "./gemini-models"

/**
 * Model Gemini yang sedang dipilih admin.
 *
 * Urutan sumber: pilihan di halaman Settings → env `GEMINI_MODEL` → default.
 *
 * Sengaja dipanggil dari route (bukan dari dalam `generateCompletion`) supaya
 * lapisan `lib/ai` tetap murni dan bisa diuji tanpa menyentuh database.
 *
 * Nilai yang tidak dikenal DIABAIKAN, bukan diteruskan — id model yang salah
 * ketik akan membuat Google membalas 404 dan seluruh fitur AI gagal.
 */
export async function resolveGeminiModel(): Promise<string> {
  try {
    const row = await prisma.setting.findUnique({
      where: { key: GEMINI_MODEL_SETTING_KEY },
    })
    if (row?.value && isKnownGeminiModel(row.value)) return row.value
  } catch (error) {
    // Database tidak terjangkau bukan alasan untuk menggagalkan generate.
    console.error("Gagal membaca setelan model AI, memakai default:", error)
  }

  const fromEnv = process.env.GEMINI_MODEL
  if (fromEnv) return fromEnv

  return DEFAULT_GEMINI_MODEL
}

/**
 * Versi tanpa database, untuk pemanggil yang SUDAH menarik tabel `setting`.
 *
 * Route chatbot dulu memanggil `resolveGeminiModel()` padahal `buildSystemPrompt()`
 * baru saja menarik seluruh tabel `setting` lewat findMany() — dua round-trip
 * berurutan ke tabel yang sama untuk setiap pesan pengunjung. Dan kunci
 * `ai_gemini_model` belum pernah ada isinya, jadi query kedua itu selalu pulang
 * kosong.
 *
 * Aturan prioritasnya sengaja dijaga identik dengan `resolveGeminiModel()`:
 * pilihan admin → env `GEMINI_MODEL` → default. Nilai yang tidak dikenal tetap
 * diabaikan, bukan diteruskan, karena id salah ketik membuat Google membalas
 * 404 dan seluruh fitur AI gagal.
 */
export function resolveGeminiModelFromSettings(
  settings: Record<string, string>
): string {
  const chosen = settings[GEMINI_MODEL_SETTING_KEY]
  if (chosen && isKnownGeminiModel(chosen)) return chosen

  return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL
}
