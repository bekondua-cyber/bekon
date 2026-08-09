export type TextSegment =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string }

/**
 * Hanya `https:` yang diizinkan. Sengaja tanpa `http:` (situs ini HTTPS penuh)
 * dan tentu tanpa `javascript:` / `data:`, yang keduanya adalah vektor XSS
 * kalau nilainya sempat masuk ke atribut href.
 */
const URL_PATTERN = /https:\/\/[^\s<>"']+/g

/** Tanda baca di ujung kalimat jangan ikut tertelan ke dalam URL. */
const TRAILING_PUNCTUATION = /[.,;:!?)\]}]+$/

/**
 * Pecah teks bebas jadi potongan teks biasa dan tautan.
 *
 * Balasan chatbot ditulis oleh AI dan bisa memuat tautan WhatsApp — persis di
 * momen konversi paling penting. Sebelumnya balasan dirender sebagai teks
 * polos sehingga tautannya mati dan pengunjung harus menyalin URL manual.
 *
 * Sengaja bukan pustaka markdown: menghindari dependensi baru sekaligus
 * mempersempit permukaan XSS — di sini tidak ada HTML yang pernah diurai.
 */
export function linkify(text: string): TextSegment[] {
  const segments: TextSegment[] = []
  let lastIndex = 0

  // Array.from() dipakai karena target tsconfig proyek ini belum mendukung
  // iterasi langsung atas hasil matchAll().
  for (const match of Array.from(text.matchAll(URL_PATTERN))) {
    const raw = match[0]
    const start = match.index ?? 0

    // Buang tanda baca penutup, lalu pastikan URL-nya benar-benar sah.
    const href = raw.replace(TRAILING_PUNCTUATION, "")
    let parsed: URL
    try {
      parsed = new URL(href)
    } catch {
      continue
    }
    if (parsed.protocol !== "https:") continue

    if (start > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, start) })
    }
    segments.push({ type: "link", value: href, href })
    lastIndex = start + href.length
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) })
  }

  return segments
}

/** Apakah tautan ini mengarah ke WhatsApp (untuk pelacakan konversi). */
export function isWhatsAppUrl(href: string): boolean {
  try {
    const { hostname } = new URL(href)
    return hostname === "wa.me" || hostname.endsWith(".whatsapp.com")
  } catch {
    return false
  }
}
