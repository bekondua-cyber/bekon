/**
 * Pembersih HTML isi artikel.
 *
 * KENAPA `sanitize-html`, BUKAN DOMPurify:
 *
 * DOMPurify butuh sebuah DOM. Di server itu berarti jsdom — dan jsdom ada di
 * `server-external-packages.json` bawaan Next: 51 paket yang SELALU
 * dieksternalkan dan tidak pernah di-bundle. Akibatnya jsdom beserta 21
 * dependensinya harus benar-benar ada di node_modules milik Lambda, dan di
 * Vercel mereka tidak pernah ikut terbawa. `require("jsdom")` gagal, seluruh
 * markup dan SEMUA gambar hilang dari setiap artikel — tanpa satu pun pesan
 * error, karena halaman tetap membalas 200 dan teksnya tetap terbaca.
 *
 * Tiga percobaan memperbaiki pemaketannya gagal: `engines.node`, memindahkan
 * jsdom ke `dependencies`, dan `outputFileTracingIncludes`. Yang terakhir
 * berhasil membawa direktori jsdom-nya tapi bukan 21 dependensi yang di-hoist
 * ke root — mengejarnya berarti mendaftar 50+ paket satu per satu.
 *
 * Dua DOM murni-JavaScript juga sudah dicoba sebagai pengganti jsdom, dan
 * KEDUANYA BERBAHAYA dengan DOMPurify:
 *
 *   linkedom   -> tidak punya document.implementation.createHTMLDocument,
 *                 DOMPurify menyerah dan MENERUSKAN INPUT MENTAH-MENTAH.
 *   happy-dom  -> isSupported true, tapi <script> tetap lolos sementara <p>,
 *                 <h2>, dan gambar yang sah justru dibuang.
 *
 * `sanitize-html` tidak butuh DOM sama sekali — ia memakai htmlparser2, JS
 * murni. Next tidak mengeksternalkannya, jadi webpack meng-inline-nya beserta
 * seluruh dependensinya. Tidak ada lagi yang bisa hilang saat runtime.
 */

type FungsiSanitasi = (html: string, opsi: unknown) => string

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
  "h2", "h3", "h4", "blockquote", "img", "figure", "figcaption",
  "code", "pre", "hr", "table", "thead", "tbody", "tr", "th", "td", "span",
]

/**
 * `style` dan `data-*` sengaja TIDAK diizinkan. Perataan dan ukuran gambar
 * disimpan sebagai kelas CSS justru karena itu — lihat src/lib/tiptap-image.ts.
 */
const OPSI = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    "*": ["class", "title"],
    a: ["href", "target", "rel"],
    img: ["src", "alt"],
  },
  // `javascript:` dan `data:` tidak ada di sini, jadi keduanya ditolak.
  allowedSchemes: ["https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  transformTags: {
    // Tautan tab baru tanpa `rel` membiarkan halaman tujuan memegang
    // window.opener dan mengarahkan ulang tab BEKON (tabnabbing).
    a: (tagName: string, attribs: Record<string, string>) => ({
      tagName,
      attribs:
        attribs.target === "_blank"
          ? { ...attribs, rel: "noopener noreferrer" }
          : attribs,
    }),
  },
}

/** `undefined` = belum dicoba, `null` = sudah dicoba dan tidak bisa dipakai. */
let sanitasi: FungsiSanitasi | null | undefined

/**
 * Contoh yang WAJIB berubah setelah dibersihkan. Kalau salah satu lolos utuh,
 * pembersihnya tidak bekerja dan tidak boleh dipercaya.
 *
 * Ini bukan kehati-hatian berlebihan: linkedom dan happy-dom sama-sama membuat
 * DOMPurify diam-diam mengembalikan input apa adanya. Tanpa uji-mandiri ini,
 * kode akan menganggap keduanya berhasil dan menyajikan HTML mentah ke
 * pengunjung — XSS tersimpan, tanpa satu pun tanda.
 */
const UJI_MANDIRI: [string, string][] = [
  ["<script>alert(1)</script>", "<script"],
  ['<img src="x" onerror="alert(1)">', "onerror"],
  ['<a href="javascript:alert(1)">k</a>', "javascript:"],
  ['<iframe src="https://x.com"></iframe>', "<iframe"],
]

function ambilSanitasi(): FungsiSanitasi | null {
  if (sanitasi !== undefined) return sanitasi

  try {
    // require() disengaja: pemuatan ditunda dan kegagalannya bisa ditangani,
    // alih-alih menjatuhkan seluruh modul rute yang mengimpor berkas ini.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("sanitize-html")
    const fn: FungsiSanitasi = mod?.default ?? mod
    if (typeof fn !== "function") throw new Error("sanitize-html bukan fungsi")

    for (const [contoh, berbahaya] of UJI_MANDIRI) {
      if (fn(contoh, OPSI).includes(berbahaya)) {
        throw new Error(`uji-mandiri gagal: "${berbahaya}" masih lolos`)
      }
    }

    sanitasi = fn
  } catch (error) {
    console.error(
      "Sanitizer HTML tidak bisa dipakai — isi artikel disajikan sebagai teks biasa:",
      error
    )
    sanitasi = null
  }

  return sanitasi
}

const ESCAPE: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}

const ENTITAS: Record<string, string> = {
  "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'",
  "&#39;": "'", "&nbsp;": " ", "&amp;": "&",
}

/**
 * Jalan keluar saat pembersih tidak tersedia.
 *
 * SELURUH markup dibuang lalu setiap karakter berbahaya di-escape, jadi
 * hasilnya mustahil membawa skrip. Pembaca kehilangan format dan gambar, tapi
 * artikelnya tetap terbaca — jauh lebih baik daripada halaman 500, dan jauh
 * lebih aman daripada menyajikan HTML yang belum dibersihkan.
 */
export function keTeksAman(html: string): string {
  const teks = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|h[1-6]|li|div|blockquote|tr)\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
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
 * Membersihkan HTML artikel. TIDAK PERNAH melempar, dan tidak pernah
 * mengembalikan HTML yang belum dibersihkan.
 */
export function sanitizeArticleHtml(html: string): string {
  if (!html) return ""

  const fn = ambilSanitasi()
  if (!fn) return keTeksAman(html)

  try {
    return fn(html, OPSI)
  } catch (error) {
    console.error("Sanitasi HTML gagal saat berjalan:", error)
    return keTeksAman(html)
  }
}

/** Apakah pembersih penuh sedang aktif. Dipakai tes dan diagnosa. */
export function sanitizerTersedia(): boolean {
  return ambilSanitasi() !== null
}
