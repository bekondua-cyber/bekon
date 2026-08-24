import DOMPurify from "isomorphic-dompurify"

/**
 * `target` ada di ALLOWED_ATTR, tapi dulu `rel` tidak pernah dipasang. Tautan
 * di dalam isi artikel — hasil generate AI maupun tempelan admin — bisa membuka
 * tab baru yang masih memegang `window.opener` ke halaman asal, sehingga
 * halaman tujuan bisa mengarahkan ulang tab BEKON ke alamat lain (tabnabbing).
 *
 * Hook dipasang sekali di tingkat modul, bukan di dalam sanitizeArticleHtml().
 * DOMPurify menyimpan hook secara global dan tidak menggantinya kalau
 * didaftarkan ulang — memanggil addHook() per request akan menumpuk hook yang
 * sama sampai ribuan kali dan memperlambat setiap render artikel.
 *
 * Di luar isi artikel tidak ada masalah: sembilan `target="_blank"` di komponen
 * sudah memasang `rel` yang benar.
 */
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.nodeName !== "A") return
  const el = node as unknown as Element
  if (el.getAttribute("target") === "_blank") {
    el.setAttribute("rel", "noopener noreferrer")
  }
})

export function sanitizeArticleHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
      "h2", "h3", "h4", "blockquote", "img", "figure", "figcaption",
      "code", "pre", "hr", "table", "thead", "tbody", "tr", "th", "td", "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class"],
  })
}
