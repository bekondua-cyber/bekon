import { describe, expect, it } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"
import { HOST_GAMBAR_DIIZINKAN, periksaUrlGambar, urlWordPressLama } from "@/lib/image-url"

const SITUS = "bangunrumahbekon.com"

/**
 * Kasus-kasus di bawah bukan karangan: semuanya diambil dari isi artikel yang
 * BENAR-BENAR tersimpan di database produksi saat klien melapor gambarnya pecah.
 */
describe("periksaUrlGambar", () => {
  describe("kasus nyata dari keluhan klien", () => {
    const halamanArtikel = [
      "https://blog.knauf.com/id/tembok-retak-jenis-penyebab-dan-cara-perbaikinya",
      "https://www.kawanlama.com/blog/tips/penyebab-tembok-retak",
      "https://www.lemkra.co.id/read-kenapa-dinding-retak-padahal-rumah-baru",
    ]

    it.each(halamanArtikel)("menolak alamat halaman web: %s", (u) => {
      const h = periksaUrlGambar(u, SITUS)
      expect(h.ok).toBe(false)
    })

    it("menjelaskan cara menyalin alamat gambar yang benar", () => {
      const h = periksaUrlGambar(halamanArtikel[0], SITUS)
      // Host-nya diblokir CSP, jadi itu yang disebut lebih dulu — dan itu memang
      // hambatan pertama yang akan ditemui admin.
      if (!h.ok) expect(h.alasan).toMatch(/CSP|Upload|alamat gambar/i)
    })
  })

  describe("aturan CSP", () => {
    it("menerima host yang ada di daftar izin", () => {
      for (const host of HOST_GAMBAR_DIIZINKAN) {
        expect(periksaUrlGambar(`https://${host}/foto.jpg`, SITUS).ok).toBe(true)
      }
    })

    it("menolak host di luar daftar meski alamatnya benar-benar gambar", () => {
      const h = periksaUrlGambar("https://i.imgur.com/abc123.png", SITUS)
      expect(h.ok).toBe(false)
      if (!h.ok) expect(h.alasan).toContain("imgur.com")
    })

    it("menerima gambar dari domain situs sendiri ('self')", () => {
      expect(periksaUrlGambar(`https://${SITUS}/foto.jpg`, SITUS).ok).toBe(true)
    })

    it("menerima path relatif dan data URI", () => {
      expect(periksaUrlGambar("/gambar/hero.webp", SITUS).ok).toBe(true)
      expect(periksaUrlGambar("data:image/png;base64,iVBORw0KGgo=", SITUS).ok).toBe(true)
    })
  })

  describe("protokol", () => {
    it("menolak http:// karena akan diblokir sebagai mixed content", () => {
      const h = periksaUrlGambar("http://res.cloudinary.com/x/foto.jpg", SITUS)
      expect(h.ok).toBe(false)
      if (!h.ok) expect(h.alasan).toContain("https")
    })

    it("menolak protokol aneh", () => {
      expect(periksaUrlGambar("javascript:alert(1)", SITUS).ok).toBe(false)
      expect(periksaUrlGambar("ftp://contoh.com/a.jpg", SITUS).ok).toBe(false)
    })
  })

  describe("masukan sembarangan", () => {
    it("menolak teks kosong", () => {
      expect(periksaUrlGambar("", SITUS).ok).toBe(false)
      expect(periksaUrlGambar("   ", SITUS).ok).toBe(false)
    })

    it("menolak teks yang bukan alamat sama sekali", () => {
      expect(periksaUrlGambar("gambar rumah bagus", SITUS).ok).toBe(false)
    })

    it("membuang spasi di ujung yang ikut ter-copy", () => {
      const h = periksaUrlGambar("  https://res.cloudinary.com/x/foto.jpg  ", SITUS)
      expect(h.ok).toBe(true)
    })

    it("menerima alamat gambar yang punya query string", () => {
      expect(periksaUrlGambar("https://res.cloudinary.com/x/foto.jpg?w=800", SITUS).ok).toBe(true)
    })
  })

  it("selalu memberi alasan yang bisa dibaca orang, bukan kode error", () => {
    for (const buruk of ["", "bukan url", "http://x.com/a.jpg", "https://imgur.com/a", "ftp://a/b.jpg"]) {
      const h = periksaUrlGambar(buruk, SITUS)
      expect(h.ok).toBe(false)
      if (!h.ok) {
        expect(h.alasan.length).toBeGreaterThan(20)
        expect(h.alasan).toMatch(/[.?]$/)
      }
    }
  })
})

describe("urlWordPressLama", () => {
  it("mengenali sisa migrasi WordPress", () => {
    expect(urlWordPressLama("https://bangunrumahbekon.com/wp-content/uploads/2022/11/6-768x768.png")).toBe(true)
  })
  it("tidak salah menuduh gambar Cloudinary", () => {
    expect(urlWordPressLama("https://res.cloudinary.com/x/bekon/foto.jpg")).toBe(false)
  })
})

/**
 * Penjaga sinkronisasi. Daftar host di image-url.ts hanya berguna kalau ia sama
 * persis dengan CSP di next.config.mjs — kalau salah satu berubah sendiri,
 * admin akan ditolak untuk host yang sebenarnya boleh, atau lebih buruk:
 * diloloskan untuk host yang nanti diblokir browser.
 */
describe("daftar host sinkron dengan CSP di next.config.mjs", () => {
  it("setiap host yang diizinkan benar-benar ada di img-src", () => {
    const config = readFileSync(join(process.cwd(), "next.config.mjs"), "utf8")
    const imgSrc = config.match(/"img-src ([^"]+)"/)?.[1]
    expect(imgSrc, "img-src tidak ditemukan di next.config.mjs").toBeTruthy()

    for (const host of HOST_GAMBAR_DIIZINKAN) {
      expect(imgSrc, `${host} tidak ada di CSP img-src`).toContain(host)
    }
  })

  it("tidak ada host penyimpan gambar di CSP yang terlewat dari daftar", () => {
    const config = readFileSync(join(process.cwd(), "next.config.mjs"), "utf8")
    const imgSrc = config.match(/"img-src ([^"]+)"/)?.[1] ?? ""

    // Host analitik/iklan sengaja diabaikan: mereka ada di CSP untuk pixel
    // pelacakan, bukan tempat menaruh gambar artikel.
    const analitik = /google|facebook|tiktok|doubleclick/i
    const hostCsp = imgSrc
      .split(/\s+/)
      .filter((t) => t.startsWith("https://"))
      .map((t) => t.replace("https://", ""))
      .filter((h) => !analitik.test(h))

    expect(hostCsp.sort()).toEqual([...HOST_GAMBAR_DIIZINKAN].sort())
  })
})
