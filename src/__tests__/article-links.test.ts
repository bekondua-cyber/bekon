import { describe, expect, it } from "vitest"
import { servicesForArticle, waMessageForArticle } from "@/lib/article-links"
import { services } from "@/data/services"

/**
 * Halaman detail artikel dulu jalan buntu: nol tautan ke /layanan/*,
 * /portfolio, /kontak, maupun WhatsApp. Pembaca yang datang dari pencarian
 * selesai membaca lalu tidak punya satu pun jalan menuju penawaran — kebocoran
 * paling mendasar untuk situs yang tujuannya mengumpulkan prospek.
 *
 * Yang dijaga di sini: blok penutup TIDAK BOLEH pernah kosong, apa pun bentuk
 * data artikelnya. Artikel tanpa kategori, kategori yang tidak dikenal, atau
 * judul yang tidak cocok pola apa pun tetap harus menawarkan sesuatu.
 */

const slugYangAda = services.map((s) => s.slug)

describe("layanan terkait tidak pernah kosong", () => {
  const kasus = [
    ["kategori dikenal", "interior", "Inspirasi Kitchen Set"],
    ["kategori kosong", null, "Inspirasi Carport"],
    ["kategori undefined", undefined, "TV Room"],
    ["kategori tidak dikenal", "kategori-ngawur", "Judul apa saja"],
    ["judul kosong", null, ""],
    ["judul & kategori tidak informatif", null, "xyz"],
  ] as const

  it.each(kasus)("%s tetap menghasilkan layanan", (_label, category, title) => {
    const hasil = servicesForArticle(category, title)
    expect(hasil.length).toBeGreaterThan(0)
  })

  it.each(kasus)("%s hanya menunjuk slug layanan yang benar-benar ada", (_l, category, title) => {
    for (const s of servicesForArticle(category, title)) {
      expect(slugYangAda).toContain(s.slug)
    }
  })
})

describe("pemetaan kategori masuk akal", () => {
  it("artikel interior menawarkan layanan interior", () => {
    const slugs = servicesForArticle("interior", "Inspirasi Ruang Tamu").map((s) => s.slug)
    expect(slugs).toContain("desain-interior")
    expect(slugs).not.toContain("desain-eksterior")
  })

  it("artikel eksterior menawarkan layanan eksterior", () => {
    const slugs = servicesForArticle("eksterior", "Inspirasi Teras Rumah").map((s) => s.slug)
    expect(slugs).toContain("desain-eksterior")
    expect(slugs).not.toContain("desain-interior")
  })
})

describe("judul jadi lapis kedua saat kategori tidak menolong", () => {
  it("menebak interior dari judul", () => {
    const slugs = servicesForArticle(null, "Insipirasi Kitchen Set").map((s) => s.slug)
    expect(slugs).toContain("desain-interior")
  })

  it("menebak eksterior dari judul", () => {
    const slugs = servicesForArticle(null, "Inspirasi Carport").map((s) => s.slug)
    expect(slugs).toContain("desain-eksterior")
  })

  it("menangani salah ketik yang memang ada di data produksi", () => {
    // Judul asli di database tertulis "Balkom", bukan "Balkon".
    const slugs = servicesForArticle(null, "Inspirasi Balkom Rumah").map((s) => s.slug)
    expect(slugs).toContain("desain-eksterior")
  })

  it("jatuh ke layanan umum kalau judul tidak memberi petunjuk", () => {
    const slugs = servicesForArticle(null, "Kabar Terbaru").map((s) => s.slug)
    expect(slugs).toContain("bangun-rumah-renovasi")
  })
})

describe("pesan WhatsApp menyebut artikel yang dibaca", () => {
  it("memuat judulnya", () => {
    expect(waMessageForArticle("Inspirasi Carport")).toContain("Inspirasi Carport")
  })

  it("tetap masuk akal untuk judul kosong", () => {
    expect(waMessageForArticle("").length).toBeGreaterThan(10)
  })
})
