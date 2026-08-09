import { describe, expect, it } from "vitest"
import { linkify, isWhatsAppUrl } from "@/lib/linkify"

/**
 * Balasan fallback chatbot selalu memuat tautan WhatsApp. Sebelumnya dirender
 * sebagai teks mati, jadi konversi bocor persis di titik paling penting.
 */
describe("linkify", () => {
  it("membiarkan teks tanpa URL apa adanya", () => {
    expect(linkify("Halo, ada yang bisa dibantu?")).toEqual([
      { type: "text", value: "Halo, ada yang bisa dibantu?" },
    ])
  })

  it("mengubah tautan WhatsApp jadi link", () => {
    const segments = linkify("Hubungi kami di https://wa.me/628123456789 ya")
    expect(segments).toEqual([
      { type: "text", value: "Hubungi kami di " },
      { type: "link", value: "https://wa.me/628123456789", href: "https://wa.me/628123456789" },
      { type: "text", value: " ya" },
    ])
  })

  it("tidak menelan titik di akhir kalimat ke dalam URL", () => {
    const segments = linkify("Kunjungi https://bangunrumahbekon.com.")
    const link = segments.find((s) => s.type === "link")
    expect(link).toEqual({
      type: "link",
      value: "https://bangunrumahbekon.com",
      href: "https://bangunrumahbekon.com",
    })
    expect(segments.at(-1)).toEqual({ type: "text", value: "." })
  })

  it("menangani beberapa tautan dalam satu balasan", () => {
    const segments = linkify("https://wa.me/62811 dan https://wa.me/62822")
    expect(segments.filter((s) => s.type === "link")).toHaveLength(2)
  })

  it("MENOLAK javascript: — ini vektor XSS kalau sampai jadi href", () => {
    const segments = linkify("klik javascript:alert(document.cookie) sekarang")
    expect(segments.every((s) => s.type === "text")).toBe(true)
  })

  it("MENOLAK data: dan http: biasa", () => {
    expect(linkify("data:text/html,<script>alert(1)</script>").every((s) => s.type === "text")).toBe(true)
    expect(linkify("http://situs-tidak-aman.com").every((s) => s.type === "text")).toBe(true)
  })

  it("tidak pernah kehilangan karakter dari teks asli", () => {
    const original = "Cek https://wa.me/62811 lalu https://bangunrumahbekon.com/kontak selesai."
    const rebuilt = linkify(original)
      .map((s) => s.value)
      .join("")
    expect(rebuilt).toBe(original)
  })
})

describe("isWhatsAppUrl", () => {
  it("mengenali wa.me sebagai WhatsApp", () => {
    expect(isWhatsAppUrl("https://wa.me/628123456789")).toBe(true)
  })

  it("tidak salah menandai domain lain sebagai konversi WhatsApp", () => {
    expect(isWhatsAppUrl("https://bangunrumahbekon.com")).toBe(false)
    expect(isWhatsAppUrl("https://wa.me.penipu.com/628")).toBe(false)
    expect(isWhatsAppUrl("bukan-url")).toBe(false)
  })
})
