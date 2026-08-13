import { describe, expect, it } from "vitest"
import { auditInternalLinks, countWords, linkableTargets } from "@/lib/ai/article-links-guard"
import { services } from "@/data/services"

/**
 * Meminta AI menyisipkan tautan internal itu mudah; yang sulit adalah
 * memastikan alamatnya benar-benar ada. Model rutin mengarang alamat yang
 * terdengar masuk akal — `/layanan/desain-taman` misalnya — dan tautan internal
 * yang mati lebih merugikan daripada tidak ada tautan: pembaca mentok di 404,
 * dan Google membaca situs ini sebagai situs yang tidak terawat.
 */

describe("tautan ke halaman yang ada dipertahankan", () => {
  it.each(services.map((s) => s.slug))("menerima /layanan/%s", (slug) => {
    const html = `<p>Lihat <a href="/layanan/${slug}">layanan kami</a>.</p>`
    const hasil = auditInternalLinks(html)
    expect(hasil.removed).toEqual([])
    expect(hasil.html).toContain(`href="/layanan/${slug}"`)
  })

  it.each(["/", "/portfolio", "/kontak", "/tentang-kami", "/video", "/informasi/blog"])(
    "menerima halaman statis %s",
    (path) => {
      const hasil = auditInternalLinks(`<p><a href="${path}">tautan</a></p>`)
      expect(hasil.removed).toEqual([])
    }
  )

  it("mengabaikan query dan anchor saat mencocokkan", () => {
    const hasil = auditInternalLinks('<p><a href="/portfolio?category=interior#atas">x</a></p>')
    expect(hasil.removed).toEqual([])
  })

  it("menerima garis miring di akhir", () => {
    expect(auditInternalLinks('<a href="/kontak/">x</a>').removed).toEqual([])
  })
})

describe("tautan karangan dilucuti tanpa merusak kalimat", () => {
  it("membuang alamat layanan yang tidak ada", () => {
    const html = '<p>Kami juga melayani <a href="/layanan/desain-taman">desain taman</a> di Serang.</p>'
    const hasil = auditInternalLinks(html)

    expect(hasil.removed).toEqual(["/layanan/desain-taman"])
    // Kalimatnya harus tetap utuh, hanya kehilangan tautannya.
    expect(hasil.html).toBe("<p>Kami juga melayani desain taman di Serang.</p>")
  })

  it("membuang alamat artikel karangan — slug-nya tidak bisa diverifikasi", () => {
    const hasil = auditInternalLinks('<a href="/informasi/blog/artikel-karangan">baca</a>')
    expect(hasil.removed).toHaveLength(1)
    expect(hasil.html).toBe("baca")
  })

  it("membuang alamat portfolio karangan", () => {
    const hasil = auditInternalLinks('<a href="/portfolio/proyek-yang-tidak-ada">lihat</a>')
    expect(hasil.removed).toHaveLength(1)
  })

  it("menangani beberapa tautan sekaligus, memilah yang sah dari yang tidak", () => {
    const html =
      '<p><a href="/kontak">hubungi</a> atau <a href="/layanan/ngawur">ngawur</a> atau <a href="/portfolio">portfolio</a></p>'
    const hasil = auditInternalLinks(html)

    expect(hasil.removed).toEqual(["/layanan/ngawur"])
    expect(hasil.kept).toEqual(["/kontak", "/portfolio"])
    expect(hasil.html).toContain('href="/kontak"')
    expect(hasil.html).toContain('href="/portfolio"')
    expect(hasil.html).not.toContain("ngawur\"")
  })
})

describe("tautan eksternal bukan urusan penjaga ini", () => {
  it.each([
    "https://wa.me/6281234567890",
    "https://www.google.com",
    "mailto:info@example.com",
    "tel:+6281234567890",
  ])("membiarkan %s", (href) => {
    const hasil = auditInternalLinks(`<a href="${href}">x</a>`)
    expect(hasil.removed).toEqual([])
    expect(hasil.html).toContain(href)
  })
})

describe("countWords menghitung teks, bukan tag", () => {
  it("mengabaikan tag HTML", () => {
    expect(countWords("<p>satu dua tiga</p>")).toBe(3)
  })

  it("tidak menghitung nama tag sebagai kata", () => {
    expect(countWords("<h2>judul</h2><ul><li>a</li><li>b</li></ul>")).toBe(3)
  })

  it("mengembalikan 0 untuk HTML tanpa teks", () => {
    expect(countWords('<img src="x.jpg" />')).toBe(0)
    expect(countWords("")).toBe(0)
  })

  it("menghitung artikel setipis produksi dengan benar", () => {
    // Meniru bentuk artikel yang ada: hanya <p> dan <img>, sangat pendek.
    const tipis = "<p>" + Array(71).fill("kata").join(" ") + '</p><img src="a.jpg">'
    expect(countWords(tipis)).toBe(71)
  })
})

describe("daftar alamat yang disodorkan ke AI", () => {
  it("memuat semua layanan yang benar-benar ada", () => {
    const daftar = linkableTargets().join("\n")
    for (const s of services) {
      expect(daftar).toContain(`/layanan/${s.slug}`)
    }
  })

  it("setiap alamat di daftar itu lolos penjaga tautannya sendiri", () => {
    // Kalau prompt menyodorkan alamat yang justru ditolak penjaga, AI akan
    // menulis tautan yang langsung dilucuti — kontradiksi yang sulit dilacak.
    for (const baris of linkableTargets()) {
      const path = baris.split(" ")[0]
      expect(auditInternalLinks(`<a href="${path}">x</a>`).removed).toEqual([])
    }
  })
})
