import { describe, expect, it } from "vitest"
import { isValidWA, normalizeWA } from "@/lib/utils"
import { validateLead, type LeadFormValues } from "@/lib/lead-form"

/**
 * Penjaga regresi untuk bug yang paling merugikan di audit 2026-08-12.
 *
 * Server menguji string telepon MENTAH dengan `/^(\+62|62|0)8[1-9][0-9]{6,11}$/`,
 * sehingga menolak spasi dan strip — termasuk `+62 812-3456-7890`, yaitu format
 * yang dicontohkan placeholder form itu sendiri. Karena kedua form tidak pernah
 * memeriksa `res.ok`, penolakan 400 itu tidak terlihat siapa pun: lead hilang
 * dari CMS sementara Meta/TikTok/Google tetap menerima konversi "Lead".
 */

function values(overrides: Partial<LeadFormValues> = {}): LeadFormValues {
  return {
    name: "Budi Santoso",
    phone: "081234567890",
    email: "",
    service: "",
    budget: "",
    message: "",
    company_website: "",
    ...overrides,
  }
}

describe("isValidWA menerima cara orang benar-benar menulis nomor", () => {
  const diterima = [
    ["format placeholder form sendiri", "+62 812-3456-7890"],
    ["awalan nol polos", "081234567890"],
    ["awalan 62", "6281234567890"],
    ["awalan +62 rapat", "+6281234567890"],
    ["pakai spasi", "0812 3456 7890"],
    ["pakai strip", "0812-3456-7890"],
    ["pakai kurung", "(0812) 3456 7890"],
    ["nomor terpendek yang sah", "08123456789"],
  ] as const

  it.each(diterima)("menerima %s", (_label, input) => {
    expect(isValidWA(input)).toBe(true)
  })

  const ditolak = [
    ["placeholder yang dikirim form saat kosong", "-"],
    ["string kosong", ""],
    ["bukan angka", "abc"],
    ["kode negara saja", "62"],
    ["terlalu pendek", "0812345"],
    ["terlalu panjang", "0812345678901234"],
    ["operator tidak sah (angka 0 setelah 8)", "080234567890"],
    ["nomor telepon rumah", "0215551234"],
  ] as const

  it.each(ditolak)("menolak %s", (_label, input) => {
    expect(isValidWA(input)).toBe(false)
  })
})

describe("normalizeWA menyeragamkan bentuk yang disimpan", () => {
  it("mengubah semua varian yang sah ke satu bentuk yang sama", () => {
    const bentuk = ["+62 812-3456-7890", "081234567890", "6281234567890", "0812 3456 7890"]
    const hasil = new Set(bentuk.map(normalizeWA))
    expect(hasil).toEqual(new Set(["6281234567890"]))
  })

  it("hasilnya langsung bisa dipakai sebagai link wa.me", () => {
    expect(normalizeWA("+62 812-3456-7890")).toMatch(/^62\d+$/)
  })
})

describe("validateLead sejalan dengan aturan server", () => {
  it("meloloskan lead yang lengkap", () => {
    expect(validateLead(values())).toEqual({})
  })

  it("meloloskan pesan pendek — batas 10 karakter yang lama membuang lead sah", () => {
    expect(validateLead(values({ message: "halo" }))).toEqual({})
  })

  it("meloloskan pesan kosong", () => {
    expect(validateLead(values({ message: "" }))).toEqual({})
  })

  it("mewajibkan nomor telepon, bukan diam-diam mengirim '-'", () => {
    expect(validateLead(values({ phone: "" })).phone).toBeTruthy()
  })

  it("mewajibkan nama minimal 2 karakter", () => {
    expect(validateLead(values({ name: "B" })).name).toBeTruthy()
    expect(validateLead(values({ name: "   " })).name).toBeTruthy()
  })

  it("menerima format placeholder yang dulu ditolak server", () => {
    expect(validateLead(values({ phone: "+62 812-3456-7890" }))).toEqual({})
  })
})
