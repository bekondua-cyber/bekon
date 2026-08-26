import { describe, expect, it } from "vitest"
import { keTeksAman, sanitizeArticleHtml, sanitizerTersedia } from "@/lib/sanitize-html"

/**
 * sanitizeArticleHtml adalah SATU-SATUNYA pertahanan XSS untuk isi artikel, dan
 * isi artikel bisa datang dari generator AI maupun tempelan admin. Berkas ini
 * mengunci perilakunya supaya perubahan konfigurasi DOMPurify tidak diam-diam
 * membuka kembali sesuatu yang sudah ditutup.
 */
describe("sanitizeArticleHtml", () => {
  describe("tautan tab baru", () => {
    it("memasang rel pada <a target=\"_blank\"> yang tidak punya rel", () => {
      const hasil = sanitizeArticleHtml('<p><a href="https://contoh.com" target="_blank">contoh</a></p>')
      expect(hasil).toContain('rel="noopener noreferrer"')
      expect(hasil).toContain('target="_blank"')
    })

    it("tetap benar untuk beberapa tautan sekaligus", () => {
      const hasil = sanitizeArticleHtml(
        '<a href="https://a.com" target="_blank">a</a><a href="https://b.com" target="_blank">b</a>'
      )
      expect(hasil.match(/rel="noopener noreferrer"/g)).toHaveLength(2)
    })

    it("tidak mengubah tautan internal yang membuka di tab yang sama", () => {
      const hasil = sanitizeArticleHtml('<a href="/layanan/desain-interior">desain interior</a>')
      expect(hasil).toContain('href="/layanan/desain-interior"')
      expect(hasil).not.toContain("rel=")
    })

    it("menimpa rel yang tidak aman pada tautan tab baru", () => {
      const hasil = sanitizeArticleHtml('<a href="https://contoh.com" target="_blank" rel="opener">x</a>')
      expect(hasil).toContain('rel="noopener noreferrer"')
      expect(hasil).not.toContain('rel="opener"')
    })

    it("hook tidak menumpuk saat dipanggil berulang kali", () => {
      // DOMPurify menyimpan hook secara global. Kalau addHook dipanggil per
      // request, hook yang sama menumpuk dan tiap render artikel makin lambat.
      const html = '<a href="https://contoh.com" target="_blank">x</a>'
      for (let i = 0; i < 50; i++) sanitizeArticleHtml(html)
      const hasil = sanitizeArticleHtml(html)
      expect(hasil.match(/rel="noopener noreferrer"/g)).toHaveLength(1)
    })
  })

  describe("pertahanan XSS yang tidak boleh melemah", () => {
    it("membuang <script>", () => {
      const hasil = sanitizeArticleHtml('<p>halo</p><script>alert(1)</script>')
      expect(hasil).not.toContain("<script")
      expect(hasil).not.toContain("alert(1)")
      expect(hasil).toContain("<p>halo</p>")
    })

    it("menolak href javascript:", () => {
      const hasil = sanitizeArticleHtml('<a href="javascript:alert(1)">klik</a>')
      expect(hasil).not.toContain("javascript:")
    })

    it("membuang atribut event seperti onerror dan onclick", () => {
      const hasil = sanitizeArticleHtml('<img src="x" onerror="alert(1)"><p onclick="alert(2)">teks</p>')
      expect(hasil).not.toContain("onerror")
      expect(hasil).not.toContain("onclick")
    })

    it("membuang <iframe> dan <style>", () => {
      const hasil = sanitizeArticleHtml('<iframe src="https://jahat.com"></iframe><style>body{display:none}</style>')
      expect(hasil).not.toContain("<iframe")
      expect(hasil).not.toContain("<style")
    })
  })

  /**
   * Regresi produksi: isomorphic-dompurify membuat instance jsdom saat MODULNYA
   * DIMUAT. Ketika itu gagal di server, SELURUH rute /informasi/blog/[slug]
   * membalas 500 — termasuk slug yang TIDAK ADA, yang seharusnya 404.
   *
   * `keTeksAman` adalah jalur cadangannya. Ia diuji langsung karena `require()`
   * di dalam modul tidak bisa dipalsukan lewat vi.mock (yang hanya mencegat
   * `import`) — memaksakannya justru akan menghasilkan tes yang diam-diam
   * menguji sanitizer asli, bukan cadangannya.
   */
  describe("jalur cadangan saat sanitizer tidak bisa dimuat", () => {
    it("isi artikel tetap terbaca sebagai teks biasa", () => {
      const hasil = keTeksAman("<h2>Judul</h2><p>Isi <strong>penting</strong>.</p>")
      expect(hasil).toContain("Judul")
      expect(hasil).toContain("Isi penting.")
    })

    it("membuang SELURUH markup berbahaya", () => {
      const hasil = keTeksAman(
        '<script>alert(1)</script><img src=x onerror="alert(2)"><a href="javascript:alert(3)">x</a>'
      )
      expect(hasil).not.toContain("<script")
      expect(hasil).not.toContain("onerror")
      expect(hasil).not.toContain("<img")
      expect(hasil).not.toContain("javascript:")
      // Satu-satunya tag yang boleh keluar adalah <p> dan <br /> buatan sendiri.
      expect(hasil).not.toMatch(/<(?!\/?(p|br)[\s/>])[a-z]/i)
    })

    it("meng-escape karakter yang bisa membentuk tag baru", () => {
      const hasil = keTeksAman("<p>5 &lt; 10 &amp; 20 > 15</p>")
      expect(hasil).not.toMatch(/<script|<img/i)
      expect(hasil).toContain("&lt;")
      expect(hasil).toContain("&amp;")
    })

    it("mempertahankan pemisahan paragraf agar tetap enak dibaca", () => {
      const hasil = keTeksAman("<p>Paragraf satu.</p><p>Paragraf dua.</p>")
      expect(hasil.match(/<p>/g)?.length).toBeGreaterThanOrEqual(2)
    })

    it("aman untuk isi kosong", () => {
      expect(keTeksAman("")).toBe("")
      expect(sanitizeArticleHtml("")).toBe("")
    })
  })

  describe("ketersediaan sanitizer", () => {
    it("sanitizer penuh aktif di lingkungan ini", () => {
      // Kalau ini gagal, jsdom tidak bisa dimuat — persis kondisi produksi.
      expect(sanitizerTersedia()).toBe(true)
    })

    it("tidak pernah melempar, apa pun masukannya", () => {
      for (const input of ["", "<p>ok</p>", "<<<>>>", "<p unclosed", "&#x3C;script&#x3E;"]) {
        expect(() => sanitizeArticleHtml(input)).not.toThrow()
      }
    })
  })

  describe("isi artikel yang sah tetap utuh", () => {
    it("mempertahankan struktur yang dipakai artikel hasil AI", () => {
      const html =
        '<h2>Judul</h2><p>Paragraf dengan <strong>tebal</strong>.</p>' +
        '<ul><li>poin</li></ul>' +
        '<a href="/portfolio">lihat portfolio</a>'
      const hasil = sanitizeArticleHtml(html)
      expect(hasil).toContain("<h2>Judul</h2>")
      expect(hasil).toContain("<strong>tebal</strong>")
      expect(hasil).toContain("<li>poin</li>")
      expect(hasil).toContain('href="/portfolio"')
    })

    it("mempertahankan gambar beserta alt", () => {
      const hasil = sanitizeArticleHtml('<img src="https://res.cloudinary.com/x.jpg" alt="rumah">')
      expect(hasil).toContain('alt="rumah"')
      expect(hasil).toContain("res.cloudinary.com")
    })
  })
})
