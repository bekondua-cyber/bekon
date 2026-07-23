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
    }
  }

  if (errors.length === 0) {
    throw new Error("Tidak ada AI provider yang dikonfigurasi (isi salah satu: GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY)")
  }
  throw new Error(`Semua AI provider gagal: ${errors.join(" | ")}`)
}
