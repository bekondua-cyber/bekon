import type { z } from "zod"

/**
 * Ambil JSON dari respons AI dan validasi dengan Zod.
 *
 * Model kadang membungkus JSON dengan code fence atau teks pengantar meski
 * sudah diminta JSON murni, jadi ada fallback mencari blok `{...}` terluar.
 * Sebelumnya logika ini diduplikasi identik di 3 route.
 */
export function parseAiJson<T>(raw: string, schema: z.ZodType<T>): T {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error("AI tidak mengembalikan JSON valid")
    parsed = JSON.parse(match[0])
  }

  const result = schema.safeParse(parsed)
  if (!result.success) {
    throw new Error("Format hasil AI tidak sesuai, coba lagi")
  }
  return result.data
}
