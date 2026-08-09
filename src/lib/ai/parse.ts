import type { z } from "zod"

/** Error dengan detail supaya kegagalan bisa didiagnosis, bukan cuma "gagal". */
export class AiParseError extends Error {
  constructor(
    message: string,
    readonly reason: "empty" | "notJson" | "truncated" | "schema",
    readonly detail: string
  ) {
    super(message)
    this.name = "AiParseError"
  }
}

/** Potong teks panjang agar aman ditulis ke log. */
function preview(raw: string, max = 400): string {
  const flat = raw.replace(/\s+/g, " ").trim()
  return flat.length > max ? `${flat.slice(0, max)}…` : flat
}

/**
 * Tanda respons terpotong di tengah jalan (biasanya kena batas maxTokens):
 * kurung buka lebih banyak daripada kurung tutup.
 */
function looksTruncated(raw: string): boolean {
  const open = (raw.match(/[{[]/g) || []).length
  const close = (raw.match(/[}\]]/g) || []).length
  return open > close
}

/**
 * Ambil JSON dari respons AI dan validasi dengan Zod.
 *
 * Model kadang membungkus JSON dengan code fence atau teks pengantar meski
 * sudah diminta JSON murni, jadi ada fallback mencari blok `{...}` terluar.
 *
 * Kegagalan dilempar sebagai AiParseError berisi sebab spesifik — sebelumnya
 * semua kegagalan memakai pesan yang sama sehingga mustahil didiagnosis.
 */
export function parseAiJson<T>(raw: string, schema: z.ZodType<T>): T {
  if (!raw || !raw.trim()) {
    throw new AiParseError("AI mengembalikan respons kosong", "empty", "")
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) {
      const reason = looksTruncated(raw) ? "truncated" : "notJson"
      throw new AiParseError(
        reason === "truncated"
          ? "Respons AI terpotong sebelum selesai. Coba kurangi jumlah part."
          : "AI tidak mengembalikan JSON valid",
        reason,
        preview(raw)
      )
    }
    try {
      parsed = JSON.parse(match[0])
    } catch {
      throw new AiParseError(
        "Respons AI terpotong sebelum selesai. Coba kurangi jumlah part.",
        "truncated",
        preview(raw)
      )
    }
  }

  const result = schema.safeParse(parsed)
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ")
    throw new AiParseError(`Struktur hasil AI tidak sesuai — ${issues}`, "schema", issues)
  }
  return result.data
}
