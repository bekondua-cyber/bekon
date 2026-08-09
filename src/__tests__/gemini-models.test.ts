import { describe, expect, it } from "vitest"
import {
  GEMINI_MODEL_OPTIONS,
  DEFAULT_GEMINI_MODEL,
  isKnownGeminiModel,
} from "@/lib/ai/gemini-models"

/**
 * Daftar model dikurasi karena tidak semua model yang terdaftar di API Google
 * bisa dipakai: gemini-2.5-flash membalas 404 "no longer available to new
 * users", dan gemini-2.0-flash rutin membalas 429. Test ini menjaga agar
 * keduanya tidak pernah kembali masuk daftar.
 */
describe("daftar model Gemini", () => {
  it("tidak memuat model yang terbukti 404 untuk akun baru", () => {
    const ids = GEMINI_MODEL_OPTIONS.map((m) => m.id)
    expect(ids).not.toContain("gemini-2.5-flash")
    expect(ids).not.toContain("gemini-2.5-flash-lite")
  })

  it("tidak memuat gemini-2.0-flash yang jatahnya rutin habis", () => {
    const ids = GEMINI_MODEL_OPTIONS.map((m) => m.id)
    expect(ids).not.toContain("gemini-2.0-flash")
    expect(ids).not.toContain("gemini-2.0-flash-lite")
  })

  it("defaultnya ada di dalam daftar", () => {
    expect(isKnownGeminiModel(DEFAULT_GEMINI_MODEL)).toBe(true)
  })

  it("defaultnya varian lite — jatah harian paling longgar dan paling cepat", () => {
    expect(DEFAULT_GEMINI_MODEL).toContain("lite")
  })

  it("tidak ada id ganda", () => {
    const ids = GEMINI_MODEL_OPTIONS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("setiap pilihan punya label dan penjelasan yang terisi", () => {
    for (const m of GEMINI_MODEL_OPTIONS) {
      expect(m.id.length).toBeGreaterThan(0)
      expect(m.label.length).toBeGreaterThan(0)
      expect(m.note.length).toBeGreaterThan(20)
    }
  })

  it("menolak id yang tidak dikenal — salah ketik akan membuat Google membalas 404", () => {
    expect(isKnownGeminiModel("gemini-tidak-ada")).toBe(false)
    expect(isKnownGeminiModel("")).toBe(false)
  })
})
