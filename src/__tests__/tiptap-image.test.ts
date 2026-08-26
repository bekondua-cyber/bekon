import { describe, expect, it } from "vitest"
import { bacaKelas, PERATAAN, UKURAN } from "@/lib/tiptap-image"
import { sanitizeArticleHtml } from "@/lib/sanitize-html"

/**
 * Perataan dan ukuran gambar disimpan sebagai KELAS CSS, bukan `style` atau
 * `data-*`, karena hanya `class` yang lolos sanitizeArticleHtml.
 *
 * Kalau kaitan itu putus, kerusakannya diam-diam dan sangat membingungkan:
 * admin mengatur posisi gambar di editor, semuanya terlihat benar, lalu
 * pengunjung melihat gambar yang kembali ke posisi semula — tanpa satu pun
 * pesan kesalahan di mana pun. Berkas ini yang menjaga kaitan itu.
 */
describe("kelas gambar bertahan melewati sanitizer", () => {
  it.each([...PERATAAN])("kelas perataan img-align-%s tidak dibuang", (arah) => {
    const hasil = sanitizeArticleHtml(
      `<img src="https://res.cloudinary.com/x/a.webp" class="h-auto my-4 block img-align-${arah} img-size-full">`
    )
    expect(hasil).toContain(`img-align-${arah}`)
  })

  it.each([...UKURAN])("kelas ukuran img-size-%s tidak dibuang", (ukuran) => {
    const hasil = sanitizeArticleHtml(
      `<img src="https://res.cloudinary.com/x/a.webp" class="h-auto my-4 block img-align-center img-size-${ukuran}">`
    )
    expect(hasil).toContain(`img-size-${ukuran}`)
  })

  it("kelas bawaan dari editor ikut selamat", () => {
    const hasil = sanitizeArticleHtml(
      '<img src="https://res.cloudinary.com/x/a.webp" class="h-auto my-4 block img-align-right img-size-medium">'
    )
    for (const k of ["h-auto", "my-4", "block", "img-align-right", "img-size-medium"]) {
      expect(hasil, `kelas ${k} hilang`).toContain(k)
    }
  })

  it("style dan data-* memang TIDAK selamat — alasan kenapa kelas yang dipakai", () => {
    const hasil = sanitizeArticleHtml(
      '<img src="https://res.cloudinary.com/x/a.webp" style="float:left" data-align="left">'
    )
    expect(hasil).not.toContain("float:left")
    expect(hasil).not.toContain("data-align")
  })
})

describe("bacaKelas", () => {
  it("membaca perataan dari daftar kelas yang bercampur", () => {
    expect(bacaKelas("h-auto my-4 img-align-right img-size-small", "img-align", PERATAAN, "center")).toBe("right")
  })

  it("membaca ukuran tanpa tertukar dengan perataan", () => {
    expect(bacaKelas("img-align-left img-size-medium", "img-size", UKURAN, "full")).toBe("medium")
    expect(bacaKelas("img-align-left img-size-medium", "img-align", PERATAAN, "center")).toBe("left")
  })

  it("jatuh ke nilai bawaan kalau kelasnya tidak ada", () => {
    expect(bacaKelas("h-auto my-4", "img-align", PERATAAN, "center")).toBe("center")
    expect(bacaKelas("", "img-size", UKURAN, "full")).toBe("full")
  })

  it("menolak nilai yang tidak dikenal, bukan meneruskannya mentah-mentah", () => {
    // Kalau nilai asing diteruskan, ia jadi kelas CSS yang tidak punya style —
    // gambar tampil tanpa perataan sama sekali dan penyebabnya sulit dilacak.
    expect(bacaKelas("img-align-melayang", "img-align", PERATAAN, "center")).toBe("center")
    expect(bacaKelas("img-size-raksasa", "img-size", UKURAN, "full")).toBe("full")
  })
})

/**
 * Kelasnya juga harus benar-benar punya style. Kelas yang ditulis editor tapi
 * tidak pernah didefinisikan di CSS akan tampil normal di editor namun tidak
 * berpengaruh apa-apa di halaman publik.
 */
describe("setiap kelas punya style di globals.css", () => {
  it("perataan dan ukuran terdefinisi untuk editor DAN halaman publik", async () => {
    const { readFileSync } = await import("fs")
    const { join } = await import("path")
    const css = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8")

    for (const arah of PERATAAN) {
      expect(css, `.prose img.img-align-${arah} belum ada`).toContain(`.prose img.img-align-${arah}`)
      expect(css, `.ProseMirror img.img-align-${arah} belum ada`).toContain(`.ProseMirror img.img-align-${arah}`)
    }
    for (const ukuran of UKURAN) {
      expect(css, `.prose img.img-size-${ukuran} belum ada`).toContain(`.prose img.img-size-${ukuran}`)
      expect(css, `.ProseMirror img.img-size-${ukuran} belum ada`).toContain(`.ProseMirror img.img-size-${ukuran}`)
    }
  })
})
