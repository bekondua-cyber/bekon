import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor, cleanup } from "@testing-library/react"

/**
 * Enam CTA — termasuk tombol hero, tombol paling menonjol di seluruh situs —
 * dulu merakit sendiri `https://wa.me/${siteConfig.whatsapp1}`. Akibatnya
 * mengganti nomor di halaman Settings admin tidak berpengaruh pada CTA hero,
 * halaman layanan, maupun halaman detail portfolio.
 *
 * Bug-nya tidak pernah terlihat karena `wa_admin_1` di produksi kebetulan
 * ternormalisasi ke digit yang sama dengan konstanta bawaan. Tes ini memakai
 * nomor yang JELAS berbeda, supaya kalau jalur resolusinya putus lagi,
 * kegagalannya kelihatan.
 */

const mockSettings = vi.hoisted(() => ({ value: {} as Record<string, string> }))

vi.mock("@/lib/settings-client", () => ({
  getPublicSettings: () => Promise.resolve(mockSettings.value),
}))

vi.mock("@/lib/track-client", () => ({
  trackConversion: vi.fn(),
}))

import { WhatsAppLink } from "@/components/WhatsAppLink"
import { siteConfig } from "@/data/site-config"

function href(): string {
  return screen.getByRole("link").getAttribute("href") ?? ""
}

beforeEach(() => {
  mockSettings.value = {}
})

afterEach(() => {
  cleanup()
})

describe("WhatsAppLink memakai nomor dari Settings admin", () => {
  it("memakai nomor dari settings, bukan konstanta bawaan", async () => {
    mockSettings.value = { wa_admin_1: "081199990000" }
    render(<WhatsAppLink waKey="wa_admin_1">Konsultasi</WhatsAppLink>)

    await waitFor(() => expect(href()).toContain("6281199990000"))
    expect(href()).not.toContain(siteConfig.whatsapp1)
  })

  it("menormalisasi bentuk bertanda hubung yang memang tersimpan di DB", async () => {
    mockSettings.value = { wa_admin_1: "0811-9999-0000" }
    render(<WhatsAppLink waKey="wa_admin_1">Konsultasi</WhatsAppLink>)

    await waitFor(() => expect(href()).toBe("https://wa.me/6281199990000"))
  })

  it("menghormati wa_admin_2 secara terpisah", async () => {
    mockSettings.value = { wa_admin_1: "081100000001", wa_admin_2: "081100000002" }
    render(<WhatsAppLink waKey="wa_admin_2">Admin 2</WhatsAppLink>)

    await waitFor(() => expect(href()).toContain("6281100000002"))
  })

  it("menyertakan pesan yang sudah ter-encode", async () => {
    mockSettings.value = { wa_admin_1: "081199990000" }
    render(
      <WhatsAppLink waKey="wa_admin_1" message="Halo BEKON, saya tertarik">
        Konsultasi
      </WhatsAppLink>
    )

    await waitFor(() => expect(href()).toContain("?text=Halo%20BEKON%2C%20saya%20tertarik"))
  })
})

describe("WhatsAppLink tetap aman saat settings belum atau gagal dimuat", () => {
  it("langsung punya tautan yang bisa diklik dari konstanta bawaan", () => {
    // Tanpa await — inilah keadaan pada render pertama, sebelum fetch selesai.
    render(<WhatsAppLink waKey="wa_admin_1">Konsultasi</WhatsAppLink>)
    expect(href()).toContain(siteConfig.whatsapp1)
  })

  it("bertahan di konstanta bawaan kalau settings kosong", async () => {
    mockSettings.value = {}
    render(<WhatsAppLink waKey="wa_admin_1">Konsultasi</WhatsAppLink>)

    await waitFor(() => expect(href()).toContain(siteConfig.whatsapp1))
  })

  it("prop href eksplisit tidak tersentuh resolusi settings", async () => {
    mockSettings.value = { wa_admin_1: "081199990000" }
    render(<WhatsAppLink href="https://wa.me/6280000000000">Darurat</WhatsAppLink>)

    await waitFor(() => expect(href()).toBe("https://wa.me/6280000000000"))
  })
})

describe("WhatsAppLink membuka tab baru dengan aman", () => {
  it("selalu memasang rel noopener noreferrer", () => {
    render(<WhatsAppLink waKey="wa_admin_1">Konsultasi</WhatsAppLink>)
    const link = screen.getByRole("link")
    expect(link.getAttribute("target")).toBe("_blank")
    expect(link.getAttribute("rel")).toBe("noopener noreferrer")
  })
})
