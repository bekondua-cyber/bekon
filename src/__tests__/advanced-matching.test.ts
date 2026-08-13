import { describe, expect, it, beforeEach, vi } from "vitest"
import { getVisitorId, __resetVisitorId } from "@/lib/visitor-id"
import { buildMatchData } from "@/lib/track-client"
import { normalizeWA } from "@/lib/utils"

/**
 * Penjaga untuk temuan Events Manager 12 Agustus 2026.
 *
 * Setiap konversi dikirim dua kali — pixel browser dan Conversions API — tapi
 * hanya salinan CAPI yang membawa data pelanggan. Akibatnya cakupan SETIAP
 * match key mentok di 50% (user agent 100%, sisanya 50%), dan skor Event Match
 * Quality tertahan di 5,4 untuk Lead dan 3,7 untuk Contact.
 *
 * Yang paling gampang rusak diam-diam di sini adalah NORMALISASI. Pixel
 * meng-hash nilai mentah sendiri, server meng-hash pakai sha256() yang
 * trim + huruf kecil. Kalau kedua sisi menormalkan berbeda, hash-nya tidak
 * cocok dan platform membacanya sebagai dua orang berlainan — lebih buruk
 * daripada tidak mengirim apa pun.
 */

beforeEach(() => {
  __resetVisitorId()
  try {
    window.localStorage.clear()
  } catch {
    /* diabaikan */
  }
})

describe("visitor id stabil dan tidak pernah merusak halaman", () => {
  it("mengembalikan nilai yang sama pada pemanggilan berulang", () => {
    const a = getVisitorId()
    const b = getVisitorId()
    expect(a).toBeTruthy()
    expect(b).toBe(a)
  })

  it("bertahan lintas pemuatan halaman lewat localStorage", () => {
    const pertama = getVisitorId()
    __resetVisitorId() // seolah halaman dimuat ulang
    expect(getVisitorId()).toBe(pertama)
  })

  it("tetap konsisten dalam satu sesi meski localStorage diblokir", () => {
    const asli = window.localStorage.setItem
    window.localStorage.setItem = () => {
      throw new Error("penyimpanan diblokir")
    }

    try {
      const a = getVisitorId()
      const b = getVisitorId()
      expect(a).toBeTruthy()
      // Cukup konsisten sepanjang sesi — itu sudah memadai untuk mencocokkan
      // pixel dengan CAPI pada event yang sama.
      expect(b).toBe(a)
    } finally {
      window.localStorage.setItem = asli
    }
  })

  it("tidak melempar saat penyimpanan tidak bisa dibaca", () => {
    const asli = window.localStorage.getItem
    window.localStorage.getItem = () => {
      throw new Error("penyimpanan diblokir")
    }

    try {
      expect(() => getVisitorId()).not.toThrow()
    } finally {
      window.localStorage.getItem = asli
    }
  })
})

describe("buildMatchData menormalkan persis seperti sisi server", () => {
  it("menurunkan email ke huruf kecil dan memangkas spasi", () => {
    expect(buildMatchData({ email: "  Budi@Example.COM " }).email).toBe("budi@example.com")
  })

  it("menormalkan telepon lewat aturan yang sama dengan /api/leads", () => {
    const match = buildMatchData({ phone: "+62 812-3456-7890" })
    expect(match.phone).toBe(normalizeWA("+62 812-3456-7890"))
    expect(match.phone).toBe("6281234567890")
  })

  it("menyatukan berbagai bentuk telepon ke satu nilai", () => {
    const bentuk = ["+62 812-3456-7890", "081234567890", "6281234567890"]
    const hasil = new Set(bentuk.map((p) => buildMatchData({ phone: p }).phone))
    expect(hasil.size).toBe(1)
  })

  it("tidak mengirim kunci kosong — nilai kosong menurunkan skor, bukan menaikkan", () => {
    const match = buildMatchData({ email: "   ", phone: "" })
    expect(match.email).toBeUndefined()
    expect(match.phone).toBeUndefined()
  })

  it("menolak telepon yang tidak menyisakan digit sama sekali", () => {
    expect(buildMatchData({ phone: "-" }).phone).toBeUndefined()
  })

  it("selalu menyertakan externalId, bahkan tanpa email dan telepon", () => {
    // Inilah yang membuat event Contact — klik WhatsApp yang anonim — tetap
    // punya satu penanda untuk dicocokkan.
    const match = buildMatchData()
    expect(match.externalId).toBeTruthy()
    expect(match.email).toBeUndefined()
    expect(match.phone).toBeUndefined()
  })

  it("memakai externalId yang sama dengan getVisitorId", () => {
    expect(buildMatchData().externalId).toBe(getVisitorId())
  })

  it("aman dipanggil tanpa argumen sama sekali", () => {
    expect(() => buildMatchData(undefined)).not.toThrow()
  })
})

describe("nilai yang dikirim ke pixel adalah bentuk MENTAH", () => {
  it("email dan telepon tidak di-hash di klien", () => {
    // Pixel Meta dan TikTok meng-hash sendiri. Meng-hash lebih dulu di sini
    // membuat mereka meng-hash dua kali, dan hasilnya tidak akan pernah cocok
    // dengan yang dikirim server.
    const match = buildMatchData({ email: "budi@example.com", phone: "081234567890" })
    expect(match.email).toBe("budi@example.com")
    expect(match.phone).toBe("6281234567890")
    expect(match.email).not.toMatch(/^[a-f0-9]{64}$/)
    expect(match.phone).not.toMatch(/^[a-f0-9]{64}$/)
  })
})

describe("pemilihan label conversion Google Ads", () => {
  /** Env dibaca saat modul dimuat, jadi modulnya harus diimpor ulang. */
  async function labelUntuk(eventName: string, contactLabel: string) {
    vi.resetModules()
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL", "LABEL_LEAD")
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_CONTACT_LABEL", contactLabel)
    const mod = await import("@/lib/track-client")
    const hasil = mod.googleAdsLabel(eventName)
    vi.unstubAllEnvs()
    return hasil
  }

  it("Contact jatuh ke label lama selama label khususnya belum diisi", async () => {
    // Sifat yang menentukan: kode ini harus aman dideploy SEBELUM conversion
    // action barunya dibuat di dashboard, tanpa mengubah perilaku apa pun.
    expect(await labelUntuk("Contact", "")).toBe("LABEL_LEAD")
  })

  it("Contact memakai labelnya sendiri begitu diisi", async () => {
    expect(await labelUntuk("Contact", "LABEL_CONTACT")).toBe("LABEL_CONTACT")
  })

  it("Lead selalu memakai label Lead, tidak terpengaruh label Contact", async () => {
    expect(await labelUntuk("Lead", "LABEL_CONTACT")).toBe("LABEL_LEAD")
  })
})
