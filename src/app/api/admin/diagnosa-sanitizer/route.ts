import { existsSync, readdirSync } from "fs"
import { join } from "path"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api-admin"
import { sanitizeArticleHtml, sanitizerTersedia } from "@/lib/sanitize-html"

export const dynamic = "force-dynamic"

/**
 * Diagnosa SEMENTARA: apakah jsdom benar-benar ikut ter-deploy?
 *
 * Versi pertama rute ini memakai `require(variabel)`, dan hasilnya menyesatkan:
 * webpack tidak bisa menganalisis require dinamis, jadi ia menggantinya dengan
 * pelempar error. Ketiga "MODULE_NOT_FOUND" yang keluar adalah cacat rute
 * diagnosanya sendiri, bukan bukti paketnya hilang.
 *
 * Yang sebenarnya terjadi terbaca di bundel: isomorphic-dompurify DI-INLINE
 * webpack, sementara `require("jsdom")` dibiarkan eksternal. Jadi satu-satunya
 * yang bisa hilang saat runtime adalah jsdom.
 *
 * Kali ini disknya yang diperiksa langsung — tidak ada lagi yang perlu ditebak.
 *
 * HAPUS setelah masalahnya selesai.
 */
export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  const akar = process.cwd()
  const nm = join(akar, "node_modules")

  const cekPaket = (nama: string) => {
    const dir = join(nm, nama)
    if (!existsSync(dir)) return { ada: false }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pkg = require(join(dir, "package.json"))
      return { ada: true, versi: pkg.version, berkas: readdirSync(dir).length }
    } catch {
      return { ada: true, versi: "?", berkas: readdirSync(dir).length }
    }
  }

  const contoh = '<h2>Judul</h2><p>Isi</p><img src="https://res.cloudinary.com/x/a.webp" class="img-size-medium">'
  const bersih = sanitizeArticleHtml(contoh)

  return NextResponse.json(
    {
      node: process.version,
      cwd: akar,
      nodeModulesAda: existsSync(nm),
      paket: {
        jsdom: cekPaket("jsdom"),
        dompurify: cekPaket("dompurify"),
        "isomorphic-dompurify": cekPaket("isomorphic-dompurify"),
      },
      sanitizerTersedia: sanitizerTersedia(),
      ujiSanitasi: {
        keluar: bersih,
        imgSelamat: bersih.includes("<img"),
        h2Selamat: bersih.includes("<h2"),
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
