import { describe, expect, it } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"
import { sanitizeArticleHtml, sanitizerTersedia } from "@/lib/sanitize-html"

/**
 * Penjaga untuk bug yang paling lama tidak ketahuan di proyek ini.
 *
 * Isi artikel di produksi selama berhari-hari tampil sebagai teks polos tanpa
 * satu pun gambar. Penyebabnya: DOMPurify butuh DOM, di server itu berarti
 * jsdom, dan jsdom ada di `server-external-packages.json` bawaan Next — daftar
 * paket yang SELALU dieksternalkan dan tidak pernah di-bundle. jsdom beserta 21
 * dependensinya tidak pernah ikut ke Lambda Vercel.
 *
 * Yang membuatnya berbahaya: kerusakannya tidak terlihat seperti kerusakan.
 * Halaman tetap 200, teks tetap terbaca, tidak ada pesan error di mana pun.
 *
 * Berkas ini mengunci pelajarannya supaya tidak terulang.
 */

const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"))

describe("pembersih HTML tidak boleh bergantung pada paket yang dieksternalkan Next", () => {
  const eksternalNext: string[] = JSON.parse(
    readFileSync(
      join(process.cwd(), "node_modules", "next", "dist", "lib", "server-external-packages.json"),
      "utf8"
    )
  )

  it("jsdom memang ada di daftar eksternal Next — inilah sumber masalahnya", () => {
    // Kalau suatu saat Next mengeluarkan jsdom dari daftar ini, catatan panjang
    // di sanitize-html.ts perlu ditinjau ulang.
    expect(eksternalNext).toContain("jsdom")
  })

  it("paket sanitizer yang dipakai TIDAK dieksternalkan, jadi ikut di-bundle", () => {
    expect(pkg.dependencies["sanitize-html"], "sanitize-html harus jadi dependensi runtime").toBeTruthy()
    expect(eksternalNext).not.toContain("sanitize-html")
  })

  it("tidak ada lagi pembersih berbasis DOM di dependensi runtime", () => {
    // isomorphic-dompurify menarik jsdom. linkedom dan happy-dom sama-sama
    // membuat DOMPurify diam-diam meneruskan input mentah — keduanya sudah
    // dicoba dan terbukti berbahaya.
    for (const terlarang of ["isomorphic-dompurify", "linkedom", "happy-dom", "jsdom"]) {
      expect(
        pkg.dependencies[terlarang],
        `${terlarang} tidak boleh ada di dependencies — lihat catatan di src/lib/sanitize-html.ts`
      ).toBeUndefined()
    }
  })

  it("jsdom tetap boleh jadi devDependency untuk lingkungan tes", () => {
    expect(pkg.devDependencies.jsdom).toBeTruthy()
  })
})

/**
 * Uji-mandiri: pembersih yang "ada" belum tentu benar-benar membersihkan.
 * linkedom dan happy-dom sama-sama membuat DOMPurify mengembalikan input apa
 * adanya — kalau kode percaya begitu saja, HTML mentah tersaji ke pengunjung.
 */
describe("pembersih benar-benar bekerja, bukan sekadar termuat", () => {
  it("melaporkan dirinya tersedia di lingkungan ini", () => {
    expect(sanitizerTersedia()).toBe(true)
  })

  it.each([
    ["<script>alert(1)</script>", "<script"],
    ['<img src="x" onerror="alert(1)">', "onerror"],
    ['<a href="javascript:alert(1)">k</a>', "javascript:"],
    ['<iframe src="https://x.com"></iframe>', "<iframe"],
    ['<p style="color:red">x</p>', "style="],
    ['<p data-x="1">x</p>', "data-x"],
  ])("membuang %s", (input, berbahaya) => {
    expect(sanitizeArticleHtml(input)).not.toContain(berbahaya)
  })

  it("mempertahankan isi artikel yang sah beserta gambarnya", () => {
    const hasil = sanitizeArticleHtml(
      '<h2>Judul</h2><ul><li>poin</li></ul>' +
        '<img src="https://res.cloudinary.com/x/a.webp" class="img-align-left img-size-medium" alt="foto">'
    )
    expect(hasil).toContain("<h2>Judul</h2>")
    expect(hasil).toContain("<li>poin</li>")
    expect(hasil).toContain("res.cloudinary.com")
    expect(hasil).toContain("img-align-left")
    expect(hasil).toContain("img-size-medium")
  })
})
