/**
 * Pembersih HTML isi artikel — dan penjaga agar kegagalannya tidak pernah lagi
 * mematikan seluruh halaman.
 *
 * KENAPA IMPORT-NYA MALAS (lazy), bukan `import` biasa di atas berkas:
 *
 * `isomorphic-dompurify` membuat instance jsdom SAAT MODULNYA DIMUAT — di
 * bundel produksi barisnya benar-benar berbunyi `new (require("jsdom")).JSDOM(...)`
 * di tingkat modul. Kalau pembuatan itu gagal di runtime server, yang tumbang
 * bukan cuma sanitasi, tapi SELURUH modul rute yang mengimpornya.
 *
 * Itulah yang terjadi di produksi: setiap `/informasi/blog/[slug]` membalas 500,
 * bahkan slug yang TIDAK ADA — yang seharusnya 404. Gejalanya sudah direproduksi
 * persis di lokal dengan menyembunyikan `node_modules/jsdom`: artikel 500, slug
 * tidak ada 500, daftar blog tetap 200. Halaman daftar selamat justru karena ia
 * satu-satunya halaman blog yang tidak mengimpor berkas ini.
 *
 * jsdom 29 menuntut Node `^20.19.0 || ^22.13.0 || >=24.0.0`, sementara proyek
 * ini tidak pernah mendeklarasikan `engines` sama sekali sehingga Vercel memilih
 * versi Node-nya sendiri. `engines.node` di package.json menutup akar itu; berkas
 * ini menutup DAMPAKNYA, supaya kegagalan serupa di masa depan — versi Node
 * berubah, jsdom naik mayor, paketnya tidak ikut ter-deploy — hanya menurunkan
 * kualitas tampilan satu artikel, bukan menjatuhkan seluruh rute.
 */

type Pembersih = {
  sanitize: (html: string, cfg: Record<string, unknown>) => string
  addHook: (nama: string, fn: (node: { nodeName: string }) => void) => void
}

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
  "h2", "h3", "h4", "blockquote", "img", "figure", "figcaption",
  "code", "pre", "hr", "table", "thead", "tbody", "tr", "th", "td", "span",
]

const ALLOWED_ATTR = ["href", "src", "alt", "title", "target", "rel", "class"]

/** `undefined` = belum pernah dicoba, `null` = sudah dicoba dan gagal. */
let pembersih: Pembersih | null | undefined

function ambilPembersih(): Pembersih | null {
  if (pembersih !== undefined) return pembersih

  try {
    // require() disengaja: `import` di tingkat modul akan menjalankan
    // inisialisasi jsdom saat modul dimuat, persis masalah yang dijelaskan di
    // atas. Dibungkus try/catch supaya kegagalannya bisa ditangani.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("isomorphic-dompurify")
    const dp: Pembersih = mod?.default ?? mod

    // Hook dipasang sekali di sini, bukan tiap panggilan sanitize(): DOMPurify
    // menyimpan hook secara global dan menumpuknya kalau didaftarkan berulang.
    dp.addHook("afterSanitizeAttributes", (node) => {
      if (node.nodeName !== "A") return
      const el = node as unknown as Element
      if (el.getAttribute("target") === "_blank") {
        el.setAttribute("rel", "noopener noreferrer")
      }
    })

    pembersih = dp
  } catch (error) {
    console.error(
      "Sanitizer HTML gagal dimuat — isi artikel disajikan sebagai teks biasa. " +
        "Periksa versi Node terhadap engines jsdom:",
      error
    )
    pembersih = null
  }

  return pembersih
}

const ESCAPE: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}

const ENTITAS: Record<string, string> = {
  "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'",
  "&#39;": "'", "&nbsp;": " ", "&amp;": "&",
}

/**
 * Jalan keluar saat sanitizer tidak tersedia.
 *
 * SELURUH markup dibuang lalu setiap karakter berbahaya di-escape, jadi hasilnya
 * mustahil membawa skrip — aman dipasang lewat dangerouslySetInnerHTML. Pembaca
 * kehilangan format dan tautan, tapi tetap bisa membaca artikelnya. Itu jauh
 * lebih baik daripada halaman 500.
 */
export function keTeksAman(html: string): string {
  const teks = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    // Penutup blok jadi baris kosong supaya paragrafnya tidak menyatu jadi satu.
    .replace(/<\/\s*(p|h[1-6]|li|div|blockquote|tr)\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    // Entitas didekode DULU, baru di-escape ulang. Tanpa ini "&lt;" berubah
    // jadi "&amp;lt;" dan pembaca melihat kode mentah, bukan tanda kurang dari.
    .replace(/&(lt|gt|quot|apos|nbsp|amp|#39);/gi, (m) => ENTITAS[m.toLowerCase()] ?? m)
    .replace(/[&<>"']/g, (c) => ESCAPE[c])
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  if (!teks) return ""

  return teks
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
    .join("")
}

/**
 * Membersihkan HTML artikel. TIDAK PERNAH melempar: kalau sanitizer-nya sendiri
 * tidak bisa dimuat atau gagal saat berjalan, isinya diturunkan jadi teks biasa
 * yang sudah di-escape.
 */
export function sanitizeArticleHtml(html: string): string {
  if (!html) return ""

  const dp = ambilPembersih()
  if (!dp) return keTeksAman(html)

  try {
    return dp.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR })
  } catch (error) {
    console.error("Sanitasi HTML gagal saat berjalan:", error)
    return keTeksAman(html)
  }
}

/** Apakah sanitizer penuh sedang aktif. Dipakai tes dan diagnosa. */
export function sanitizerTersedia(): boolean {
  return ambilPembersih() !== null
}
