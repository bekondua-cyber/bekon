import { describe, expect, it } from "vitest"
import { resolvePublishedAt } from "@/lib/article-published-at"

/**
 * Tombol Draft/Published di halaman daftar artikel hanya mengirim
 * `{ id, isPublished }`. Tanpa aturan di server, artikel terbit dengan
 * `publishedAt` null — dan itu membuatnya tenggelam ke DASAR daftar blog
 * (urutannya `publishedAt desc, nulls last`), tanggalnya kosong, serta
 * `datePublished` JSON-LD dan `publishedTime` OpenGraph ikut hilang.
 *
 * Tidak ada satu pun pesan kesalahan yang muncul kalau ini rusak lagi, jadi
 * berkas ini yang menjaganya.
 */
describe("resolvePublishedAt", () => {
  it("mengisi tanggal saat artikel terbit tanpa tanggal — kasus tombol daftar", () => {
    const hasil = resolvePublishedAt({ isPublished: true })
    expect(hasil).toBeTypeOf("string")
    expect(new Date(hasil!).toISOString()).toBe(hasil)
  })

  it("mengisi tanggal saat artikel lama diterbitkan padahal existing null", () => {
    const hasil = resolvePublishedAt({ isPublished: true, existing: null })
    expect(hasil).toBeTypeOf("string")
  })

  it("tidak menimpa tanggal yang sudah tersimpan", () => {
    const hasil = resolvePublishedAt({
      isPublished: true,
      existing: new Date("2026-01-15T00:00:00.000Z"),
    })
    expect(hasil).toBeUndefined()
  })

  it("menghormati tanggal eksplisit dari admin", () => {
    const dipilih = "2026-03-01T08:00:00.000Z"
    expect(resolvePublishedAt({ isPublished: true, incoming: dipilih })).toBe(dipilih)
  })

  it("tanggal eksplisit menang bahkan atas nilai yang sudah tersimpan", () => {
    const dipilih = "2026-03-01T08:00:00.000Z"
    const hasil = resolvePublishedAt({
      isPublished: true,
      incoming: dipilih,
      existing: new Date("2020-01-01T00:00:00.000Z"),
    })
    expect(hasil).toBe(dipilih)
  })

  it("TIDAK mengosongkan tanggal saat artikel ditarik dari publikasi", () => {
    // Kalau dikosongkan, artikel yang diterbitkan ulang kehilangan posisinya
    // di daftar blog dan tanggal aslinya hilang selamanya.
    const hasil = resolvePublishedAt({
      isPublished: false,
      incoming: null,
      existing: new Date("2026-01-15T00:00:00.000Z"),
    })
    expect(hasil).toBeUndefined()
  })

  it("tidak menyentuh kolom saat isPublished tidak diubah sama sekali", () => {
    expect(resolvePublishedAt({})).toBeUndefined()
    expect(resolvePublishedAt({ existing: new Date() })).toBeUndefined()
  })

  it("draft baru tidak diberi tanggal", () => {
    expect(resolvePublishedAt({ isPublished: false })).toBeUndefined()
  })

  it("string kosong diperlakukan sebagai tidak dikirim, bukan tanggal sah", () => {
    const hasil = resolvePublishedAt({ isPublished: true, incoming: "" })
    expect(hasil).toBeTypeOf("string")
    expect(hasil).not.toBe("")
  })
})
