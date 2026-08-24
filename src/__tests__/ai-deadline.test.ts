import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { readdirSync, readFileSync } from "fs"
import { join, relative, sep } from "path"
import { AI_CHAIN_DEADLINE_MS, AI_MIN_SLICE_MS } from "@/lib/ai/fetch-with-timeout"

/**
 * Rantai fallback AI dulu memberi 60 detik PENUH ke tiap provider. Karena
 * ketiganya dicoba berurutan, skenario terburuknya 180 detik — sementara tidak
 * ada satu pun rute yang mendeklarasikan `maxDuration`, dan Vercel Hobby
 * memotong di 60 detik. Dua akibatnya:
 *
 *   1. Fungsinya dimatikan di tengah jalan; admin melihat error 5xx.
 *   2. Provider pertama yang menggantung menghabiskan seluruh jatah, jadi
 *      provider cadangan TIDAK PERNAH dicoba — mekanisme fallback yang sudah
 *      dibangun itu sebenarnya tidak pernah berjalan.
 *
 * Berkas ini mengunci aritmetikanya supaya tidak bisa melar lagi diam-diam.
 */

const complete = {
  gemini: vi.fn(),
  groq: vi.fn(),
  openrouter: vi.fn(),
}

vi.mock("@/lib/ai/providers/gemini", () => ({
  geminiProvider: { name: "gemini", envKey: "GEMINI_API_KEY", complete: (o: unknown) => complete.gemini(o) },
}))
vi.mock("@/lib/ai/providers/groq", () => ({
  groqProvider: { name: "groq", envKey: "GROQ_API_KEY", complete: (o: unknown) => complete.groq(o) },
}))
vi.mock("@/lib/ai/providers/openrouter", () => ({
  openrouterProvider: { name: "openrouter", envKey: "OPENROUTER_API_KEY", complete: (o: unknown) => complete.openrouter(o) },
}))

const options = { messages: [{ role: "user" as const, content: "halo" }] }

/** Rute AI yang WAJIB memasang maxDuration. */
const AI_ROUTES = [
  "src/app/api/admin/articles/generate/route.ts",
  "src/app/api/chatbot/route.ts",
  "src/app/api/admin/video-prompt/generate/route.ts",
  "src/app/api/admin/video-prompt/ideas/route.ts",
]

describe("anggaran waktu rantai AI", () => {
  beforeEach(() => {
    vi.resetModules()
    for (const fn of Object.values(complete)) fn.mockReset()
    process.env.GEMINI_API_KEY = "x"
    process.env.GROQ_API_KEY = "x"
    process.env.OPENROUTER_API_KEY = "x"
    delete process.env.AI_PROVIDER_ORDER
  })

  afterEach(() => {
    delete process.env.GEMINI_API_KEY
    delete process.env.GROQ_API_KEY
    delete process.env.OPENROUTER_API_KEY
  })

  it("skenario terburuk — ketiganya menggantung — tetap muat di anggaran", async () => {
    // Jam dikendalikan manual: tiap provider "menggantung" sampai jatahnya
    // habis, persis kondisi yang dulu membuat totalnya membengkak jadi 180
    // detik. Yang diuji adalah waktu dinding total, bukan jumlah jatah —
    // keduanya berbeda karena jatah dihitung ulang tiap giliran.
    let now = 1_000_000
    const nowSpy = vi.spyOn(Date, "now").mockImplementation(() => now)

    const menggantung = (fn: typeof complete.gemini) =>
      fn.mockImplementation(async (o: { timeoutMs: number }) => {
        now += o.timeoutMs
        throw new Error("tidak merespons")
      })

    menggantung(complete.gemini)
    menggantung(complete.groq)
    menggantung(complete.openrouter)

    const mulai = now
    const { generateCompletion } = await import("@/lib/ai")
    await expect(generateCompletion(options)).rejects.toThrow()

    expect(now - mulai).toBeLessThanOrEqual(AI_CHAIN_DEADLINE_MS)

    // Dan ketiganya memang benar-benar dicoba — inilah yang dulu mustahil,
    // karena provider pertama menghabiskan seluruh jatah sendirian.
    expect(complete.gemini).toHaveBeenCalled()
    expect(complete.groq).toHaveBeenCalled()
    expect(complete.openrouter).toHaveBeenCalled()

    for (const fn of [complete.gemini, complete.groq, complete.openrouter]) {
      expect(fn.mock.calls[0][0].timeoutMs).toBeGreaterThanOrEqual(AI_MIN_SLICE_MS)
    }

    nowSpy.mockRestore()
  })

  it("provider yang gagal cepat mewariskan sisa waktunya ke cadangan", async () => {
    const { generateCompletion } = await import("@/lib/ai")

    complete.gemini.mockRejectedValue(new Error("gagal seketika"))
    complete.groq.mockResolvedValue("ok")

    await generateCompletion(options)

    const jatahGemini = complete.gemini.mock.calls[0][0].timeoutMs as number
    const jatahGroq = complete.groq.mock.calls[0][0].timeoutMs as number

    // Gemini gagal tanpa memakan waktu, jadi Groq mewarisi sisanya dan
    // jatahnya justru lebih besar — bukan mengecil seperti anggapan awal.
    expect(jatahGroq).toBeGreaterThan(jatahGemini)
  })

  it("menghormati deadlineMs yang lebih pendek dari pemanggil", async () => {
    const { generateCompletion } = await import("@/lib/ai")

    complete.gemini.mockResolvedValue("ok")
    await generateCompletion({ ...options, deadlineMs: 21_000 })

    const jatah = complete.gemini.mock.calls[0][0].timeoutMs as number
    expect(jatah).toBeLessThanOrEqual(21_000)
  })

  it("jatah tidak pernah melebihi sisa anggaran, bahkan di bawah lantai minimum", async () => {
    // Regresi: lantai AI_MIN_SLICE_MS dulu jadi lapisan TERLUAR, sehingga
    // deadlineMs yang lebih kecil dari lantai itu justru dilampaui. Provider
    // pertama lolos dari penjaga "anggaran habis" (yang hanya berlaku i > 0),
    // jadi ia menerima 6 detik penuh walau pemanggil cuma memberi 2 detik.
    const { generateCompletion } = await import("@/lib/ai")

    complete.gemini.mockResolvedValue("ok")
    const anggaranMungil = 2_000
    await generateCompletion({ ...options, deadlineMs: anggaranMungil })

    const jatah = complete.gemini.mock.calls[0][0].timeoutMs as number
    expect(jatah).toBeLessThanOrEqual(anggaranMungil)
    expect(jatah).toBeGreaterThan(0)
  })

  it("waktu nyata benar-benar terbatas — bukan cuma jam yang dipalsukan", async () => {
    // Tes lain memakai Date.now yang di-spy. Yang ini membiarkan jam asli
    // berjalan dan provider benar-benar menggantung, supaya batas waktunya
    // terbukti nyata dan bukan artefak mock.
    const { generateCompletion } = await import("@/lib/ai")

    const gantung = () =>
      vi.fn().mockImplementation(
        (o: { timeoutMs: number }) =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("tidak merespons")), o.timeoutMs)
          )
      )
    complete.gemini.mockImplementation(gantung())
    complete.groq.mockImplementation(gantung())
    complete.openrouter.mockImplementation(gantung())

    const t0 = Date.now()
    await expect(generateCompletion({ ...options, deadlineMs: 300 })).rejects.toThrow()
    const berlalu = Date.now() - t0

    // Longgar sedikit untuk jitter penjadwal, tapi jauh di bawah 3x300ms yang
    // akan terjadi kalau tiap provider memakai anggaran penuh sendiri-sendiri.
    expect(berlalu).toBeLessThan(900)
  }, 10_000)

  it("provider tanpa kunci API tidak ikut memotong jatah", async () => {
    delete process.env.GROQ_API_KEY
    delete process.env.OPENROUTER_API_KEY

    const { generateCompletion } = await import("@/lib/ai")
    complete.gemini.mockResolvedValue("ok")
    await generateCompletion(options)

    // Satu-satunya provider yang bisa dipakai berhak atas seluruh anggaran.
    const jatah = complete.gemini.mock.calls[0][0].timeoutMs as number
    expect(jatah).toBeGreaterThan(AI_CHAIN_DEADLINE_MS * 0.9)
  })
})

describe("maxDuration di rute AI", () => {
  it("terpasang di setiap rute yang memanggil generateCompletion", () => {
    for (const route of AI_ROUTES) {
      const source = readFileSync(join(process.cwd(), route), "utf8")
      expect(source, `${route} harus memanggil generateCompletion`).toContain("generateCompletion")
      expect(source, `${route} belum mendeklarasikan maxDuration`).toMatch(
        /export const maxDuration = (\d+)/
      )

      const declared = Number(source.match(/export const maxDuration = (\d+)/)![1])
      // Kalau maxDuration lebih kecil dari anggaran rantai, platform tetap
      // memotong duluan dan seluruh perbaikan ini sia-sia.
      expect(
        declared * 1000,
        `${route}: maxDuration ${declared}s harus melebihi AI_CHAIN_DEADLINE_MS`
      ).toBeGreaterThan(AI_CHAIN_DEADLINE_MS)
    }
  })

  it("tidak ada rute AI lain yang terlewat", () => {
    // Penjaga: kalau nanti ada rute baru yang memanggil generateCompletion,
    // ia harus ikut didaftarkan di AI_ROUTES beserta maxDuration-nya.
    //
    // Menelusuri berkas sendiri, bukan lewat `git grep` — penjaga ini tidak
    // boleh ikut gagal cuma karena tesnya dijalankan di luar working tree git
    // (tarball, container build, direktori hasil unduh).
    function kumpulkanRoute(dir: string, hasil: string[] = []): string[] {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) kumpulkanRoute(full, hasil)
        else if (entry.name === "route.ts") hasil.push(full)
      }
      return hasil
    }

    const pemanggil = kumpulkanRoute(join(process.cwd(), "src", "app", "api"))
      .filter((f) => readFileSync(f, "utf8").includes("generateCompletion"))
      .map((f) => relative(process.cwd(), f).split(sep).join("/"))

    expect(pemanggil.sort()).toEqual([...AI_ROUTES].sort())
  })
})
