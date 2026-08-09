import { describe, expect, it } from "vitest"
import { LEAD_VALUE, LEAD_CURRENCY } from "@/lib/lead-value"

/**
 * Meta Events Manager menandai event Lead tanpa value/currency sebagai masalah
 * prioritas tinggi karena ROAS jadi tidak bisa dihitung. Berkas ini mengunci
 * agar keduanya selalu terkirim dengan bentuk yang sah.
 */
describe("nilai leads untuk perhitungan ROAS", () => {
  it("adalah angka positif yang sah", () => {
    expect(Number.isFinite(LEAD_VALUE)).toBe(true)
    expect(LEAD_VALUE).toBeGreaterThan(0)
  })

  it("memakai kode mata uang ISO 4217 tiga huruf", () => {
    expect(LEAD_CURRENCY).toMatch(/^[A-Z]{3}$/)
  })

  it("memakai IDR agar cocok dengan mata uang akun iklan", () => {
    expect(LEAD_CURRENCY).toBe("IDR")
  })
})
