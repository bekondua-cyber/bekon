/**
 * Aturan tunggal untuk `publishedAt` sebuah artikel.
 *
 * Tombol Draft/Published di halaman daftar artikel hanya mengirim
 * `{ id, isPublished }` — `publishedAt` tidak pernah ikut. Akibatnya artikel
 * bisa terbit dengan tanggal `null`, dan itu merusak tiga hal sekaligus tanpa
 * satu pun pesan kesalahan:
 *
 * 1. Daftar blog diurutkan `publishedAt desc, nulls last`, jadi artikel yang
 *    BARU diterbitkan justru tenggelam ke posisi paling bawah.
 * 2. Tanggal di kartu blog tampil kosong.
 * 3. `datePublished` di JSON-LD dan `publishedTime` di OpenGraph sama-sama
 *    `undefined` — Google kehilangan tanggal artikel.
 *
 * Aturannya ditaruh di sini, bukan di tombolnya, supaya jalur mana pun yang
 * mengubah `isPublished` ikut terjaga — form edit, tombol daftar, maupun
 * pemanggilan API langsung.
 */

export interface PublishedAtInput {
  /** Status terbit setelah operasi ini. `undefined` = tidak diubah. */
  isPublished?: boolean
  /** Nilai yang dikirim pemanggil. `undefined` = tidak dikirim sama sekali. */
  incoming?: string | null
  /** Nilai yang sudah tersimpan di database. `undefined` untuk artikel baru. */
  existing?: Date | string | null
}

/**
 * Mengembalikan nilai `publishedAt` yang harus ditulis, atau `undefined` kalau
 * kolomnya tidak perlu disentuh sama sekali.
 *
 * Dua keputusan yang disengaja:
 *
 * - Nilai eksplisit dari pemanggil selalu menang. Admin yang mengisi tanggal
 *   sendiri di form tidak boleh ditimpa.
 * - Fungsi ini TIDAK PERNAH mengosongkan tanggal. Menarik artikel dari
 *   publikasi harus mempertahankan tanggal aslinya: kalau dikosongkan, artikel
 *   yang diterbitkan ulang kehilangan posisinya di daftar dan tanggal aslinya
 *   hilang selamanya.
 */
export function resolvePublishedAt(input: PublishedAtInput): string | undefined {
  const { isPublished, incoming, existing } = input

  // Pemanggil mengirim tanggal betulan — hormati apa adanya.
  if (typeof incoming === "string" && incoming.length > 0) return incoming

  // Belum jadi terbit: jangan sentuh kolomnya. Ini juga yang mencegah
  // `publishedAt: null` dari form edit menghapus tanggal yang sudah ada.
  if (isPublished !== true) return undefined

  // Terbit dan sudah punya tanggal — biarkan.
  if (existing) return undefined

  // Terbit tapi belum bertanggal: inilah lubang yang ditutup.
  return new Date().toISOString()
}
