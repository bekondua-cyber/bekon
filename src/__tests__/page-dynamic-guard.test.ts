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

function collectPageFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      collectPageFiles(full, found)
    } else if (entry === "page.tsx" || entry === "layout.tsx") {
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

  it("beranda secara khusus dinyatakan dinamis", () => {
    const home = readFileSync(join(APP_DIR, "page.tsx"), "utf8")
    expect(readsDatabase(home)).toBe(true)
    expect(home).toMatch(/export\s+const\s+dynamic\s*=\s*"force-dynamic"/)
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
