import { describe, expect, it } from "vitest"
import { readdirSync, readFileSync, statSync } from "fs"
import { join, relative, sep } from "path"

/**
 * Penjaga untuk bug yang paling lama tidak ketahuan di proyek ini.
 *
 * `isomorphic-dompurify` di-inline webpack ke dalam bundel, tapi
 * `require("jsdom")` dibiarkan EKSTERNAL — jsdom harus benar-benar ada di
 * node_modules milik fungsi saat berjalan. Penelusuran otomatis Next mencatatnya
 * dengan benar secara lokal, tapi berkasnya tidak sampai ke Lambda Vercel.
 *
 * Akibatnya tidak terlihat seperti kerusakan: halaman tetap membalas 200, teks
 * artikel tetap terbaca, dan tidak ada satu pun pesan error. Yang hilang diam-
 * diam adalah SELURUH markup dan SEMUA gambar, karena sanitizer jatuh ke jalur
 * cadangan. Butuh berhari-hari sampai penyebabnya ketemu.
 *
 * `outputFileTracingIncludes` di next.config.mjs yang menutupnya. Tes ini
 * memastikan daftarnya tidak pernah tertinggal dari kenyataan: setiap rute yang
 * mengimpor sanitize-html HARUS terdaftar di sana.
 */

const APP = join(process.cwd(), "src", "app")

/** Semua berkas rute (page/route) yang pada akhirnya memakai sanitize-html. */
function rutePemakaiSanitizer(): string[] {
  const hasil: string[] = []

  function telusuri(dir: string) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        telusuri(full)
      } else if (entry === "page.tsx" || entry === "route.ts") {
        if (readFileSync(full, "utf8").includes("sanitize-html")) hasil.push(full)
      }
    }
  }

  telusuri(APP)
  return hasil
}

/** Ubah path berkas jadi path rute Next: src/app/(public)/a/[b]/page.tsx -> /a/[b] */
function kePathRute(berkas: string): string {
  return (
    "/" +
      relative(APP, berkas)
        .split(sep)
        .slice(0, -1) // buang page.tsx / route.ts
        .filter((seg) => !(seg.startsWith("(") && seg.endsWith(")"))) // route group
        .join("/") || "/"
  )
}

describe("jsdom ikut dipaketkan untuk setiap rute yang menyanitasi HTML", () => {
  const config = readFileSync(join(process.cwd(), "next.config.mjs"), "utf8")

  it("outputFileTracingIncludes ada di next.config.mjs", () => {
    expect(config).toContain("outputFileTracingIncludes")
    expect(config).toContain("node_modules/jsdom")
  })

  it("setiap rute pemakai sanitize-html terdaftar", () => {
    const rute = rutePemakaiSanitizer()
    expect(rute.length, "tidak ada rute yang memakai sanitize-html — apakah pindah berkas?").toBeGreaterThan(0)

    for (const berkas of rute) {
      const path = kePathRute(berkas)
      expect(
        config,
        `Rute ${path} memakai sanitize-html tapi belum terdaftar di outputFileTracingIncludes. ` +
          `Tanpa itu jsdom tidak ikut ter-deploy dan SEMUA gambar di artikel hilang diam-diam.`
      ).toContain(`'${path}'`)
    }
  })

  it("jsdom dideklarasikan sebagai dependensi runtime, bukan devDependency", () => {
    // jsdom memang dipakai vitest, tapi juga dipakai isomorphic-dompurify saat
    // MENYAJIKAN halaman artikel. Menaruhnya hanya di devDependencies membuat
    // build produksi yang bersih kehilangan paketnya.
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"))
    expect(pkg.dependencies?.jsdom, "jsdom harus ada di dependencies").toBeTruthy()
    expect(pkg.devDependencies?.jsdom, "jsdom tidak boleh ganda di devDependencies").toBeUndefined()
  })
})
