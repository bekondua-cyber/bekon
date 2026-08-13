/**
 * Satu-satunya tempat tipe skrip tracking pihak ketiga dideklarasikan.
 *
 * Sebelumnya `Window` diperluas terpisah di `track-client.ts` dan
 * `TrackingScripts.tsx`. Begitu salah satunya menambah method (`ttq.identify`
 * untuk Advanced Matching TikTok), TypeScript langsung menolak: dua deklarasi
 * untuk properti yang sama harus bertipe identik. Menyatukannya di sini
 * membuat penyimpangan itu tidak mungkin terjadi lagi.
 */

export {}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
    ttq?: {
      page: () => void
      track: (...args: unknown[]) => void
      /** Advanced Matching TikTok. Opsional: hanya ada setelah pixel termuat. */
      identify?: (data: Record<string, string>) => void
    }
  }
}
