import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { execSync } from "child_process"
import { readFileSync } from "fs"
import { join } from "path"
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
    const hits = execSync(
      'git grep -l "generateCompletion" -- "src/app/api/**/route.ts"',
      { cwd: process.cwd(), encoding: "utf8" }
    )
      .split("\n")
      .filter(Boolean)
      .map((p) => p.trim())

    expect(hits.sort()).toEqual([...AI_ROUTES].sort())
  })
})
