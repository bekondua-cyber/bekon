/**
 * Membuang <img> yang sudah mati dari isi artikel.
 *
 * Dua jenis yang dibersihkan, keduanya nyata ditemukan di produksi:
 *
 * 1. Sisa migrasi WordPress — `bangunrumahbekon.com/wp-content/uploads/...`.
 *    Situsnya sudah pindah ke Next.js, jadi seluruh alamat itu membalas 403.
 * 2. Alamat HALAMAN web yang tertempel sebagai gambar (mis. blog.knauf.com/...),
 *    yang membalas text/html sehingga browser menampilkannya sebagai ikon rusak.
 *
 * Berkas gambar aslinya sudah tidak bisa diambil lagi, jadi tidak ada yang bisa
 * dipulihkan — yang bisa dilakukan hanyalah menghapus tag matinya supaya artikel
 * bersih. Thumbnail artikel TIDAK disentuh: semuanya masih sehat di Cloudinary.
 *
 * MODE AMAN: tanpa argumen, skrip hanya MENAMPILKAN rencananya.
 * Jalankan dengan `--tulis` untuk benar-benar menyimpan.
 *
 *   npx tsx scripts/bersihkan-gambar-mati.ts
 *   npx tsx scripts/bersihkan-gambar-mati.ts --tulis
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

import { writeFileSync } from "fs"
import { join } from "path"
import { prisma } from "../src/lib/prisma"
import { revalidatePublic } from "../src/lib/revalidate"

const TULIS = process.argv.includes("--tulis")

/** Alamat gambar yang sudah terbukti tidak bisa ditampilkan. */
function gambarMati(src: string): boolean {
  if (/\/wp-content\/uploads\//i.test(src)) return true
  if (/^data:image\//i.test(src)) return false
  if (src.startsWith("/")) return false
  try {
    const u = new URL(src)
    // Bukan berkas gambar -> ini alamat halaman, bukan gambar.
    return !/\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i.test(u.pathname)
  } catch {
    return true
  }
}

/** Buang <img> mati beserta <figure>/<p> yang jadi kosong karenanya. */
function bersihkan(html: string): { html: string; dibuang: string[] } {
  const dibuang: string[] = []

  let hasil = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = tag.match(/src=["']([^"']+)["']/i)?.[1]
    if (src && gambarMati(src)) {
      dibuang.push(src)
      return ""
    }
    return tag
  })

  if (dibuang.length) {
    // Bungkus yang jadi kosong ikut dibuang supaya tidak menyisakan celah aneh.
    for (let i = 0; i < 3; i++) {
      hasil = hasil
        .replace(/<figure[^>]*>\s*(<figcaption[^>]*>\s*<\/figcaption>)?\s*<\/figure>/gi, "")
        .replace(/<p[^>]*>\s*(&nbsp;|\s)*<\/p>/gi, "")
        .replace(/<a\b[^>]*>\s*<\/a>/gi, "")
    }
    hasil = hasil.replace(/\s{3,}/g, " ").trim()
  }

  return { html: hasil, dibuang }
}

async function main() {
  const artikel = await prisma.article.findMany({
    select: { id: true, slug: true, title: true, isPublished: true, content: true },
    orderBy: { createdAt: "desc" },
  })

  let totalTag = 0
  const rencana: { id: string; slug: string; html: string; dibuang: string[] }[] = []

  for (const a of artikel) {
    if (!a.content) continue
    const { html, dibuang } = bersihkan(a.content)
    if (!dibuang.length) continue
    totalTag += dibuang.length
    rencana.push({ id: a.id, slug: a.slug, html, dibuang })
    console.log(`\n${a.isPublished ? "TERBIT" : "draft "}  /${a.slug}`)
    console.log(`   membuang ${dibuang.length} gambar mati:`)
    for (const u of dibuang) console.log(`     - ${u.slice(0, 95)}`)
    console.log(`   panjang isi: ${a.content.length} -> ${html.length} karakter`)
  }

  console.log(`\n${"=".repeat(60)}`)
  console.log(`Artikel yang akan diubah : ${rencana.length}`)
  console.log(`Tag <img> yang dibuang   : ${totalTag}`)

  if (!TULIS) {
    console.log(`\nMODE TINJAU — tidak ada yang ditulis ke database.`)
    console.log(`Jalankan ulang dengan --tulis untuk menyimpan.`)
    return
  }

  // Cadangan isi ASLI ditulis lebih dulu. Ini mengubah data produksi, dan
  // tanpa salinan ini tidak ada jalan kembali kalau hasilnya tidak diinginkan.
  const berkasCadangan = join(
    process.cwd(),
    `cadangan-isi-artikel-${new Date().toISOString().slice(0, 10)}.json`
  )
  const asli = await prisma.article.findMany({
    where: { id: { in: rencana.map((r) => r.id) } },
    select: { id: true, slug: true, content: true },
  })
  writeFileSync(berkasCadangan, JSON.stringify(asli, null, 2), "utf8")
  console.log(`\nCadangan isi asli disimpan: ${berkasCadangan}`)

  console.log(`Menyimpan...`)
  await prisma.$transaction(
    rencana.map((r) =>
      prisma.article.update({ where: { id: r.id }, data: { content: r.html } })
    )
  )
  try {
    revalidatePublic("articles")
  } catch {
    // revalidatePath hanya bekerja di dalam server Next; dari skrip ini wajar gagal.
    console.log("(cache akan menyegarkan sendiri dalam 60 detik lewat ISR)")
  }
  console.log(`Selesai. ${rencana.length} artikel diperbarui.`)
}

main()
  .catch((e) => { console.error("GAGAL:", e); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
