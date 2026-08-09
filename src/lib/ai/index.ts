import type { AiCompletionOptions, AiProvider } from "./types"
import { geminiProvider } from "./providers/gemini"
import { groqProvider } from "./providers/groq"
import { openrouterProvider } from "./providers/openrouter"

const ALL_PROVIDERS: Record<string, AiProvider> = {
  gemini: geminiProvider,
  groq: groqProvider,
  openrouter: openrouterProvider,
}

function getProviderOrder(): string[] {
  const configured = process.env.AI_PROVIDER_ORDER
  if (configured) return configured.split(",").map((p) => p.trim())
  return ["gemini", "groq", "openrouter"]
}

/**
 * Apakah kegagalan ini layak dicoba ke provider berikutnya?
 *
 * Ketiga provider melampirkan `status` HTTP ke error-nya, tapi dulu itu
 * diabaikan: SEMUA error memicu fallback. Untuk error 4xx — prompt cacat,
 * kunci API salah, permintaan terlalu besar — ketiga provider pasti gagal
 * dengan alasan yang sama, jadi mencobanya hanya membakar 3x biaya dan waktu.
 *
 * 429 (kena batas) dan 5xx (gangguan provider) memang khas satu provider,
 * jadi keduanya tetap di-fallback. Error tanpa status (jaringan putus,
 * timeout, respons kosong) juga di-fallback: sebabnya bukan permintaan kita.
 */
function shouldTryNextProvider(error: unknown): boolean {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status: unknown }).status)
      : NaN

  if (!Number.isFinite(status)) return true
  if (status === 429) return true
  return status >= 500
}

export async function generateCompletion(opts: AiCompletionOptions): Promise<string> {
  const order = getProviderOrder()
  const errors: string[] = []

  for (const name of order) {
    const provider = ALL_PROVIDERS[name]
    if (!provider) continue
    if (!process.env[provider.envKey]) continue

    try {
      return await provider.complete(opts)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`${name}: ${message}`)

      if (!shouldTryNextProvider(error)) {
        // Seluruh error yang sudah terkumpul ikut dilaporkan — kalau hanya
        // error terakhir yang disebut, kegagalan provider sebelumnya hilang
        // dan penyebab sebenarnya jadi tidak terlihat di log.
        throw new Error(
          `AI provider menolak permintaan dan provider lain tidak akan berbeda: ${errors.join(" | ")}`
        )
      }
    }
  }

  if (errors.length === 0) {
    throw new Error("Tidak ada AI provider yang dikonfigurasi (isi salah satu: GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY)")
  }
  throw new Error(`Semua AI provider gagal: ${errors.join(" | ")}`)
}
