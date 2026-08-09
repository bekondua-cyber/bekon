import { describe, expect, it } from "vitest"
import { LEAD_VALUE, CONTACT_VALUE, LEAD_CURRENCY, valueForEvent } from "@/lib/lead-value"

/**
 * Meta Events Manager menandai event tanpa value/currency sebagai masalah
 * prioritas tinggi karena ROAS jadi tidak bisa dihitung. Berkas ini mengunci
 * agar keduanya selalu terkirim dengan bentuk yang sah.
 */
describe("nilai konversi untuk perhitungan ROAS", () => {
  it("adalah angka positif yang sah", () => {
    expect(Number.isFinite(LEAD_VALUE)).toBe(true)
    expect(LEAD_VALUE).toBeGreaterThan(0)
    expect(Number.isFinite(CONTACT_VALUE)).toBe(true)
    expect(CONTACT_VALUE).toBeGreaterThan(0)
  })

  it("memakai kode mata uang ISO 4217 tiga huruf", () => {
    expect(LEAD_CURRENCY).toMatch(/^[A-Z]{3}$/)
  })

  it("memakai IDR agar cocok dengan mata uang akun iklan", () => {
    expect(LEAD_CURRENCY).toBe("IDR")
  })
})

describe("valueForEvent", () => {
  it("memberi nilai penuh untuk Lead (form terkirim, ada nama & nomor)", () => {
    expect(valueForEvent("Lead")).toBe(LEAD_VALUE)
  })

  it("memberi nilai lebih rendah untuk Contact (klik WA, niat lebih lemah)", () => {
    expect(valueForEvent("Contact")).toBe(CONTACT_VALUE)
    expect(valueForEvent("Contact")).toBeLessThan(valueForEvent("Lead"))
  })

  it("jatuh ke nilai Lead untuk event yang tidak dikenal, bukan 0 atau NaN", () => {
    // Nilai 0 membuat Meta menandai event bermasalah lagi; NaN ditolak API.
    const value = valueForEvent("EventBaruYangBelumAda")
    expect(Number.isFinite(value)).toBe(true)
    expect(value).toBeGreaterThan(0)
  })

  it("selalu mengembalikan angka positif berhingga untuk masukan apa pun", () => {
    for (const name of ["Lead", "Contact", "", "ViewContent", "  "]) {
      const value = valueForEvent(name)
      expect(Number.isFinite(value)).toBe(true)
      expect(value).toBeGreaterThan(0)
    }
  })
})
