import { revalidatePath } from "next/cache"

/**
 * Pembatalan cache setelah admin mengubah data.
 *
 * Seluruh situs publik dulu memakai `force-dynamic` tanpa satu pun invalidasi
 * cache. Itu memang aman — isinya tidak pernah basi — tapi berarti setiap
 * pengunjung memicu query database baru: satu kunjungan beranda saja
 * menjalankan tujuh query Neon, dan halaman artikel menjalankan DOMPurify
 * di server per request. Biayanya naik lurus dengan trafik iklan.
 *
 * Sekarang halaman memakai ISR dengan TTL pendek DITAMBAH pemanggilan di sini.
 * Kombinasinya disengaja:
 *
 * - `revalidatePath()` membuat perubahan admin muncul segera.
 * - TTL 60 detik adalah jaring pengaman. Kalau ada jalur tulis yang lupa
 *   memanggil fungsi ini, halamannya paling lama basi satu menit — TIDAK BISA
 *   membeku seperti dulu, saat beranda basi belasan jam tanpa satu pun tanda.
 *
 * Selalu dibungkus try/catch: kegagalan invalidasi tidak boleh membuat
 * penyimpanan yang sudah berhasil terlihat gagal di mata admin.
 */

/** Halaman yang menampilkan tiap jenis data. Beranda hampir selalu ikut. */
const PATHS = {
  portfolio: ["/", "/portfolio", "/portfolio/[slug]"],
  articles: ["/", "/informasi/blog", "/informasi/blog/[slug]"],
  videos: ["/", "/video"],
  testimonials: ["/"],
  team: ["/", "/tentang-kami"],
  hero: ["/"],
} as const

export type RevalidateScope = keyof typeof PATHS

export function revalidatePublic(scope: RevalidateScope): void {
  try {
    for (const path of PATHS[scope]) {
      revalidatePath(path, path.includes("[") ? "page" : undefined)
    }
  } catch (error) {
    console.error(`Gagal merevalidasi cache untuk ${scope}:`, error)
  }
}

/**
 * Settings muncul di Footer, dan Footer ada di SETIAP halaman — jadi satu
 * perubahan nomor WhatsApp atau alamat menyentuh seluruh situs, bukan satu rute.
 */
export function revalidateAllPublic(): void {
  try {
    revalidatePath("/", "layout")
  } catch (error) {
    console.error("Gagal merevalidasi seluruh cache publik:", error)
  }
}
