import { prisma } from "@/lib/prisma"
import { deleteImage } from "@/lib/cloudinary"

/**
 * Siapa yang masih memakai sebuah gambar, dan pembersihan aset yang tak terpakai.
 *
 * Dua celah yang ditutup di sini:
 *
 * 1. Halaman Media dulu menghapus dari Cloudinary dan database tanpa sekali pun
 *    memeriksa apakah URL-nya masih dipasang di portfolio, artikel, atau hero.
 *    Admin merapikan Media, dan gambar di halaman publik langsung rusak — tanpa
 *    peringatan, tanpa cara mengembalikan.
 *
 * 2. Sebaliknya, menghapus portfolio/artikel/hero tidak pernah menyentuh
 *    Cloudinary sama sekali, jadi asetnya menumpuk sebagai berkas yatim yang
 *    tidak bisa dibedakan dari yang masih dipakai.
 */

export interface MediaUsage {
  /** Label yang bisa dibaca admin, mis. "Portfolio: Rumah Minimalis Serang". */
  where: string[]
}

/** Cari semua tempat sebuah URL gambar masih dipasang. */
export async function findImageUsage(urls: string[]): Promise<Map<string, string[]>> {
  const usage = new Map<string, string[]>()
  if (urls.length === 0) return usage

  const add = (url: string, label: string) => {
    const list = usage.get(url) ?? []
    list.push(label)
    usage.set(url, list)
  }

  const [portfolios, articles, heroSlides, team, testimonials] = await Promise.all([
    prisma.portfolio.findMany({
      where: {
        OR: [
          { coverImage: { in: urls } },
          { images: { hasSome: urls } },
          { beforeImage: { in: urls } },
          { afterImage: { in: urls } },
        ],
      },
      select: { title: true, coverImage: true, images: true, beforeImage: true, afterImage: true },
    }),
    prisma.article.findMany({
      where: { OR: [{ thumbnail: { in: urls } }, { ogImage: { in: urls } }] },
      select: { title: true, thumbnail: true, ogImage: true },
    }),
    prisma.heroSlide.findMany({
      where: { image: { in: urls } },
      select: { title: true, image: true },
    }),
    prisma.teamMember.findMany({
      where: { photo: { in: urls } },
      select: { name: true, photo: true },
    }),
    prisma.testimonial.findMany({
      where: { photo: { in: urls } },
      select: { clientName: true, photo: true },
    }),
  ])

  for (const p of portfolios) {
    for (const url of [p.coverImage, p.beforeImage, p.afterImage, ...p.images]) {
      if (url && urls.includes(url)) add(url, `Portfolio: ${p.title}`)
    }
  }
  for (const a of articles) {
    for (const url of [a.thumbnail, a.ogImage]) {
      if (url && urls.includes(url)) add(url, `Artikel: ${a.title}`)
    }
  }
  for (const h of heroSlides) {
    if (h.image && urls.includes(h.image)) add(h.image, `Hero slide: ${h.title || "(tanpa judul)"}`)
  }
  for (const t of team) {
    if (t.photo && urls.includes(t.photo)) add(t.photo, `Anggota tim: ${t.name}`)
  }
  for (const t of testimonials) {
    if (t.photo && urls.includes(t.photo)) add(t.photo, `Testimoni: ${t.clientName}`)
  }

  return usage
}

/**
 * Hapus aset Cloudinary untuk URL yang SUDAH TIDAK dipakai di mana pun, lalu
 * bersihkan barisnya dari tabel Media.
 *
 * Dipanggil setelah portfolio/artikel/hero dihapus. Pemeriksaan ulang penting:
 * satu gambar bisa dipasang di beberapa tempat, dan menghapusnya dari salah
 * satu tidak berarti boleh dibuang.
 *
 * TIDAK PERNAH melempar — kegagalan bersih-bersih tidak boleh membuat operasi
 * hapus yang sudah berhasil terlihat gagal di mata admin.
 */
export async function cleanupUnusedImages(urls: (string | null | undefined)[]): Promise<void> {
  // Array.from, bukan spread — target tsconfig proyek ini belum mengizinkan
  // iterasi Set secara langsung.
  const candidates = Array.from(new Set(urls.filter((u): u is string => !!u)))
  if (candidates.length === 0) return

  try {
    const stillUsed = await findImageUsage(candidates)
    const orphans = candidates.filter((url) => !stillUsed.has(url))
    if (orphans.length === 0) return

    const rows = await prisma.media.findMany({
      where: { url: { in: orphans } },
      select: { id: true, publicId: true },
    })

    await Promise.all(
      rows.filter((r) => r.publicId).map((r) => deleteImage(r.publicId).catch(() => {}))
    )

    if (rows.length > 0) {
      await prisma.media.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } })
    }
  } catch (error) {
    console.error("Gagal membersihkan gambar tak terpakai:", error)
  }
}
