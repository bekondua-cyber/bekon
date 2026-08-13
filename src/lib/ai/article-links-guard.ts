import { services } from "@/data/services"

/**
 * Memeriksa tautan internal yang ditulis AI, dan menghitung kedalaman artikel.
 *
 * Meminta AI menyisipkan tautan ke halaman layanan itu mudah; masalahnya AI
 * mengarang alamat. `/layanan/desain-taman` terdengar masuk akal padahal
 * halamannya tidak ada, dan tautan internal yang mati lebih merugikan daripada
 * tidak ada tautan sama sekali — pembaca mentok di 404, dan Google membaca
 * situs ini sebagai situs yang tidak terawat.
 *
 * Karena itu hasil AI tidak dipercaya begitu saja: tautan ke alamat yang tidak
 * dikenal dilucuti jadi teks biasa (kalimatnya tetap utuh, cuma kehilangan
 * tautannya), sementara tautan yang sah dibiarkan.
 */

/** Halaman statis yang memang ada di situs ini. */
const STATIC_PATHS = new Set([
  "/",
  "/tentang-kami",
  "/layanan",
  "/portfolio",
  "/video",
  "/informasi/blog",
  "/kontak",
])

function isKnownInternalPath(href: string): boolean {
  // Buang query dan anchor sebelum dicocokkan.
  const path = href.split(/[?#]/)[0].replace(/\/$/, "") || "/"

  if (STATIC_PATHS.has(path)) return true

  const layanan = path.match(/^\/layanan\/([a-z0-9-]+)$/)
  if (layanan) return services.some((s) => s.slug === layanan[1])

  // Artikel dan portfolio lain tidak bisa diverifikasi tanpa menyentuh
  // database, dan slug karangan di sini akan jadi 404. Ditolak.
  return false
}

export interface LinkAudit {
  html: string
  kept: string[]
  removed: string[]
}

/**
 * Lucuti tautan yang mengarah ke halaman yang tidak ada.
 *
 * Tautan eksternal (http/https ke domain lain) dibiarkan — DOMPurify di
 * `sanitizeArticleHtml` yang menangani keamanannya saat dirender.
 */
export function auditInternalLinks(html: string): LinkAudit {
  const kept: string[] = []
  const removed: string[] = []

  const result = html.replace(
    /<a\b[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (full, href: string, inner: string) => {
      const target = href.trim()

      // Tautan eksternal dan mailto/tel bukan urusan penjaga ini.
      if (/^(https?:)?\/\//i.test(target) || /^(mailto|tel):/i.test(target)) {
        kept.push(target)
        return full
      }

      if (target.startsWith("/") && isKnownInternalPath(target)) {
        kept.push(target)
        return full
      }

      removed.push(target)
      return inner
    }
  )

  return { html: result, kept, removed }
}

/** Jumlah kata sebenarnya, tag HTML tidak ikut dihitung. */
export function countWords(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
  return text ? text.split(" ").length : 0
}

/** Daftar alamat yang boleh ditaut, untuk disodorkan ke AI di dalam prompt. */
export function linkableTargets(): string[] {
  return [
    ...services.map((s) => `/layanan/${s.slug} — ${s.title}`),
    "/portfolio — galeri proyek yang sudah dikerjakan",
    "/kontak — form konsultasi dan penawaran",
    "/tentang-kami — profil perusahaan",
  ]
}
