import ImageExtension from "@tiptap/extension-image"

/**
 * Gambar artikel dengan perataan dan ukuran yang bisa diatur admin.
 *
 * KENAPA lewat `class`, bukan `style` atau `data-*`:
 *
 * Isi artikel dibersihkan `sanitizeArticleHtml` sebelum dirender ke halaman
 * publik, dan daftar atribut yang lolos hanya href, src, alt, title, target,
 * rel, dan class. Perataan yang ditulis sebagai `style="float:left"` atau
 * `data-align="left"` akan LENYAP saat disajikan — admin mengaturnya di editor,
 * lalu pengunjung melihat gambar yang posisinya kembali seperti semula tanpa
 * satu pun tanda bahwa ada yang hilang.
 *
 * Kelasnya juga sengaja diberi awalan `img-` supaya tidak bertabrakan dengan
 * kelas Tailwind mana pun, dan tetap terbaca kalau nanti ada yang membuka HTML
 * artikelnya langsung.
 */

export const PERATAAN = ["left", "center", "right"] as const
export const UKURAN = ["small", "medium", "full"] as const

export type Perataan = (typeof PERATAAN)[number]
export type Ukuran = (typeof UKURAN)[number]

/** Diekspor supaya bisa diuji langsung tanpa merakit editor. */
export function bacaKelas<T extends string>(
  className: string,
  awalan: string,
  sah: readonly T[],
  bawaan: T
): T {
  const cocok = className.match(new RegExp(`${awalan}-([a-z]+)`))?.[1]
  return sah.includes(cocok as T) ? (cocok as T) : bawaan
}

export const GambarArtikel = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      align: {
        default: "center" as Perataan,
        parseHTML: (el: HTMLElement) => bacaKelas(el.className, "img-align", PERATAAN, "center"),
        // mergeAttributes menggabungkan `class` dari beberapa sumber, jadi ini
        // menempel ke kelas bawaan alih-alih menimpanya.
        renderHTML: (attrs: { align?: Perataan }) => ({ class: `img-align-${attrs.align ?? "center"}` }),
      },

      size: {
        default: "full" as Ukuran,
        parseHTML: (el: HTMLElement) => bacaKelas(el.className, "img-size", UKURAN, "full"),
        renderHTML: (attrs: { size?: Ukuran }) => ({ class: `img-size-${attrs.size ?? "full"}` }),
      },
    }
  },
})
