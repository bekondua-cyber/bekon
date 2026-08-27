import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api-admin"
import { sanitizeArticleHtml, sanitizerTersedia } from "@/lib/sanitize-html"

export const dynamic = "force-dynamic"

/**
 * Diagnosa SEMENTARA: kenapa sanitizer HTML gagal dimuat di runtime produksi?
 *
 * Halaman artikel di produksi berjalan di jalur cadangan `keTeksAman` — seluruh
 * markup dan gambar dibuang, hanya teks yang tersisa. Lokal selalu berhasil,
 * jadi penyebabnya ada di lingkungan Vercel dan tidak bisa ditebak dari sini.
 * Dua tebakan sebelumnya (versi Node, jsdom hilang) belum terbukti.
 *
 * Rute ini menjawabnya langsung dari dalam runtime yang bermasalah. Dipagari
 * requireAdmin karena `process.version` dan jejak error adalah detail internal.
 *
 * HAPUS setelah akar masalahnya ketemu.
 */
export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  const hasil: Record<string, unknown> = {
    node: process.version,
    platform: `${process.platform} ${process.arch}`,
    sanitizerTersedia: sanitizerTersedia(),
  }

  // Uji tiap lapisan terpisah supaya ketahuan mana yang putus.
  for (const paket of ["jsdom", "dompurify", "isomorphic-dompurify"]) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require(paket)
      hasil[paket] = {
        ok: true,
        tipe: typeof (mod?.default ?? mod),
        kunci: Object.keys(mod ?? {}).slice(0, 6),
      }
    } catch (error) {
      hasil[paket] = {
        ok: false,
        pesan: error instanceof Error ? error.message : String(error),
        kode: (error as NodeJS.ErrnoException)?.code,
        jejak: error instanceof Error ? error.stack?.split("\n").slice(0, 6) : undefined,
      }
    }
  }

  // Bukti akhir: apakah <img> dan <h2> benar-benar selamat di runtime ini?
  const contoh = '<h2>Judul</h2><p>Isi</p><img src="https://res.cloudinary.com/x/a.webp" class="img-size-medium">'
  const bersih = sanitizeArticleHtml(contoh)
  hasil.ujiSanitasi = {
    masuk: contoh,
    keluar: bersih,
    imgSelamat: bersih.includes("<img"),
    h2Selamat: bersih.includes("<h2"),
  }

  return NextResponse.json(hasil, { headers: { "Cache-Control": "no-store" } })
}
