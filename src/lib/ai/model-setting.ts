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
