import { describe, expect, it } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * Penjaga regresi untuk landmark ganda.
 *
 * Root layout dulu membungkus SEMUA isi dengan `<main id="main" role="main">`,
 * sementara beranda dan layout `(public)` masing-masing merender `<main>`
 * miliknya sendiri. Hasilnya setiap halaman punya dua landmark `main`
 * bersarang dengan `id` yang sama: HTML tidak valid, pembaca layar melihat dua
 * konten utama, dan skip link "#main" menunjuk ke pembungkus terluar alih-alih
 * ke konten sebenarnya.
 *
 * Perbaikannya bukan sekadar menghapus satu tag: root harus tetap netral, dan
 * SETIAP rute harus menyediakan tepat satu `<main id="main">` sendiri —
 * termasuk halaman yang berdiri di luar route group (login, 404, error), yang
 * tadinya menumpang `<main>` milik root.
 */

const SRC = join(process.cwd(), "src")

/**
 * Komentar dibuang sebelum dihitung — komentar di berkas-berkas ini justru
 * menjelaskan aturan landmark dan menyebut tag-nya secara harfiah, sehingga
 * ikut terhitung kalau tidak dibersihkan.
 */
function stripComments(source: string): string {
  return source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
}

function read(...segments: string[]): string {
  return stripComments(readFileSync(join(SRC, ...segments), "utf8"))
}

describe("root layout tidak boleh memegang landmark main", () => {
  it("tidak merender <main> sendiri", () => {
    expect(
      read("app", "layout.tsx"),
      "Root layout membungkus Navbar dan Footer juga, jadi <main> di sini " +
        "selalu bersarang dengan <main> milik halaman."
    ).not.toMatch(/<main[\s>]/)
  })

  it("skip link tetap menunjuk ke #main", () => {
    expect(read("app", "layout.tsx")).toMatch(/href="#main"/)
  })
})

describe("setiap rute menyediakan tepat satu <main id=\"main\">", () => {
  // Berkas yang bertanggung jawab atas landmark pada rutenya masing-masing.
  const pemegangLandmark = [
    ["beranda", ["app", "page.tsx"]],
    ["halaman publik", ["app", "(public)", "layout.tsx"]],
    ["admin terproteksi", ["app", "admin", "(protected)", "layout.tsx"]],
    ["halaman login", ["app", "admin", "(public)", "login", "page.tsx"]],
    ["halaman 404", ["app", "not-found.tsx"]],
    ["halaman error", ["app", "error.tsx"]],
  ] as const

  it.each(pemegangLandmark)("%s punya <main id=\"main\">", (_label, segments) => {
    expect(read(...segments)).toMatch(/<main[^>]*id="main"/)
  })

  it.each(pemegangLandmark)("%s hanya punya satu <main>", (_label, segments) => {
    const jumlah = (read(...segments).match(/<main[\s>]/g) || []).length
    expect(jumlah).toBe(1)
  })
})
