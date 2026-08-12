import { describe, expect, it } from "vitest"
import { readdirSync, readFileSync, statSync } from "fs"
import { join } from "path"

/**
 * Penjaga regresi untuk kelas bug yang gagal terdeteksi selama belasan jam.
 *
 * Beranda membaca database lewat Prisma, tapi Next tidak punya cara mengetahui
 * itu — tidak seperti `fetch()`, panggilan Prisma bukan sinyal dinamis. Tanpa
 * `export const dynamic` atau `revalidate`, halaman diprerender saat build lalu
 * dibekukan: perubahan admin (bio anggota tim, testimoni, portfolio) tidak
 * pernah muncul sampai deploy berikutnya, dan tidak ada satu pun pesan error.
 *
 * Dulu beranda dinamis secara TIDAK SENGAJA karena mem-fetch API-nya sendiri
 * dengan `cache: "no-store"`. Saat pemanggilan itu diganti query Prisma
 * langsung, sinyal dinamisnya ikut hilang tanpa disadari.
 */

const APP_DIR = join(process.cwd(), "src", "app")

/**
 * `sitemap.ts` dan `robots.ts` ikut diperiksa.
 *
 * Penjaga ini semula hanya mengumpulkan `page.tsx` dan `layout.tsx`, dan
 * lubang itu memang termanfaatkan: `sitemap.ts` membaca Prisma tanpa deklarasi
 * mode render sama sekali, jadi ia diprerender saat build lalu beku — artikel
 * dan portfolio baru tidak pernah masuk sitemap sampai deploy berikutnya, dan
 * tidak ada satu pun tanda kesalahan. Setiap berkas rute yang bisa menyentuh
 * database harus lewat sini, bukan cuma halaman.
 */
const ROUTE_FILES = new Set(["page.tsx", "layout.tsx", "sitemap.ts", "robots.ts"])

function collectPageFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      collectPageFiles(full, found)
    } else if (ROUTE_FILES.has(entry)) {
      found.push(full)
    }
  }
  return found
}

/** Halaman ini membaca database lewat Prisma, langsung maupun via queries.ts. */
function readsDatabase(source: string): boolean {
  return /from\s+"@\/lib\/(prisma|queries)"/.test(source)
}

function declaresRenderMode(source: string): boolean {
  return /export\s+const\s+(dynamic|revalidate)\s*=/.test(source)
}

describe("halaman yang membaca database wajib menyatakan mode render", () => {
  const pages = collectPageFiles(APP_DIR)

  it("menemukan berkas halaman untuk diperiksa", () => {
    expect(pages.length).toBeGreaterThan(5)
  })

  it("tidak ada halaman pembaca DB yang dibiarkan statis tanpa sengaja", () => {
    const offenders: string[] = []

    for (const file of pages) {
      const source = readFileSync(file, "utf8")
      if (readsDatabase(source) && !declaresRenderMode(source)) {
        offenders.push(file.replace(process.cwd(), "").replace(/\\/g, "/"))
      }
    }

    expect(
      offenders,
      `Halaman berikut membaca database tapi tidak menyatakan ` +
        `\`export const dynamic\` atau \`revalidate\`. Next akan memprerendernya ` +
        `saat build dan isinya membeku — perubahan admin tidak akan pernah muncul:\n` +
        offenders.map((f) => `  - ${f}`).join("\n")
    ).toEqual([])
  })

  it("beranda menyatakan mode render secara eksplisit", () => {
    const home = readFileSync(join(APP_DIR, "page.tsx"), "utf8")
    expect(readsDatabase(home)).toBe(true)
    // Dulu wajib `force-dynamic`. Sekarang ISR dengan `revalidate`, karena
    // force-dynamic berarti tujuh query Neon per pengunjung. Yang penting dan
    // tidak boleh hilang adalah ADANYA deklarasi — tanpa itu halaman beku.
    expect(declaresRenderMode(home)).toBe(true)
  })

  it("halaman ber-ISR punya TTL yang masuk akal sebagai jaring pengaman", () => {
    // TTL terlalu panjang mengembalikan gejala lama: perubahan admin tidak
    // muncul dan tidak ada yang tahu kenapa. Invalidasi on-demand tetap jalur
    // utamanya; ini cuma batas atas kalau ada jalur tulis yang terlewat.
    const offenders: string[] = []

    for (const file of pages) {
      const source = readFileSync(file, "utf8")
      const match = source.match(/export\s+const\s+revalidate\s*=\s*(\d+)/)
      if (match && Number(match[1]) > 3600) {
        offenders.push(`${file.replace(process.cwd(), "").replace(/\\/g, "/")} (${match[1]}s)`)
      }
    }

    expect(offenders, `TTL di atas 1 jam terlalu lama:\n${offenders.join("\n")}`).toEqual([])
  })

  it("sitemap tidak boleh beku — artikel & portfolio baru harus bisa masuk", () => {
    const sitemap = readFileSync(join(APP_DIR, "sitemap.ts"), "utf8")
    expect(readsDatabase(sitemap)).toBe(true)
    expect(
      declaresRenderMode(sitemap),
      "sitemap.ts membaca database. Tanpa `revalidate` atau `dynamic`, Next " +
        "memprerendernya saat build dan isinya beku sampai deploy berikutnya."
    ).toBe(true)
  })
})

describe("next.config.mjs tidak memaksa cache ke semua path", () => {
  it("tidak ada Cache-Control menyeluruh yang bisa membekukan halaman HTML", () => {
    const config = readFileSync(join(process.cwd(), "next.config.mjs"), "utf8")

    // Baris ini pernah membuat CDN menyajikan beranda basi selama belasan jam
    // begitu halamannya berubah jadi statis.
    const blanketCacheHeader = /source:\s*'\/:path\*'[\s\S]{0,400}?key:\s*'Cache-Control'/
    expect(config).not.toMatch(blanketCacheHeader)
  })
})
