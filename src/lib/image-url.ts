/**
 * Pemeriksaan URL gambar sebelum disisipkan ke isi artikel.
 *
 * Tombol gambar di editor dulu menyisipkan APA PUN yang diketik, tanpa satu pun
 * pemeriksaan. Akibatnya di produksi:
 *
 * - Tiga "gambar" di satu artikel ternyata alamat HALAMAN artikel orang lain
 *   (blog.knauf.com, kawanlama.com, lemkra.co.id). Browser diminta menampilkan
 *   HTML sebagai gambar, hasilnya ikon rusak.
 * - Tiga puluh empat gambar lain masih menunjuk ke situs WordPress lama
 *   (`/wp-content/uploads/...`) yang sudah tidak ada, membalas 403.
 *
 * Ada jebakan ketiga yang lebih halus: CSP situs membatasi `img-src`. Alamat
 * gambar yang SUDAH benar pun tetap diblokir browser kalau host-nya di luar
 * daftar — dan admin akan mengira dirinya salah ketik padahal tidak.
 */

/**
 * Host yang diizinkan CSP `img-src` di next.config.mjs.
 *
 * WAJIB sinkron dengan berkas itu; dikunci oleh src/__tests__/image-url.test.ts
 * supaya keduanya tidak bisa berbeda diam-diam.
 */
export const HOST_GAMBAR_DIIZINKAN = [
  "res.cloudinary.com",
  "img.youtube.com",
  "images.unsplash.com",
] as const

const EKSTENSI_GAMBAR = /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i

export type HasilPeriksaUrl =
  | { ok: true; url: string }
  | { ok: false; alasan: string }

/**
 * @param mentah  Teks yang diketik admin.
 * @param hostSitus Host halaman saat ini, untuk mengenali `'self'` di CSP.
 */
export function periksaUrlGambar(mentah: string, hostSitus?: string): HasilPeriksaUrl {
  const teks = mentah.trim()
  if (!teks) return { ok: false, alasan: "Alamat gambar masih kosong." }

  // Path relatif dan data URI dua-duanya diizinkan CSP ('self' dan data:).
  if (teks.startsWith("/")) return { ok: true, url: teks }
  if (teks.startsWith("data:image/")) return { ok: true, url: teks }

  let url: URL
  try {
    url = new URL(teks)
  } catch {
    return {
      ok: false,
      alasan: 'Itu bukan alamat yang sah. Tempel alamat lengkap yang diawali "https://".',
    }
  }

  if (url.protocol === "http:") {
    return {
      ok: false,
      alasan: 'Alamat "http://" akan diblokir browser di situs https. Ganti jadi "https://".',
    }
  }
  if (url.protocol !== "https:") {
    return { ok: false, alasan: `Alamat ${url.protocol} tidak bisa dipakai untuk gambar.` }
  }

  const sendiri = !!hostSitus && url.host === hostSitus
  const diizinkan = (HOST_GAMBAR_DIIZINKAN as readonly string[]).includes(url.hostname)

  if (!sendiri && !diizinkan) {
    return {
      ok: false,
      alasan:
        `Gambar dari ${url.hostname} akan diblokir oleh keamanan situs (CSP), ` +
        `jadi tetap tidak akan tampil. Pakai tombol Upload supaya gambarnya ` +
        `tersimpan di server sendiri.`,
    }
  }

  if (!EKSTENSI_GAMBAR.test(url.pathname)) {
    return {
      ok: false,
      alasan:
        "Alamat itu sepertinya halaman web, bukan berkas gambar. Alamat gambar " +
        "biasanya berakhiran .jpg, .png, atau .webp — klik kanan pada gambarnya " +
        'lalu pilih "Salin alamat gambar".',
    }
  }

  return { ok: true, url: url.toString() }
}

/** Apakah URL ini menunjuk ke situs WordPress lama yang sudah mati. */
export function urlWordPressLama(url: string): boolean {
  return /\/wp-content\/uploads\//i.test(url)
}
