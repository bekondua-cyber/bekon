import { describe, expect, it, beforeEach, vi, afterEach } from "vitest"
import { buildFbc, captureFbclid, getFbc, __resetFbcMemory } from "@/lib/fbc"

/**
 * Penjaga untuk temuan Events Manager 2026-08-12: cakupan `fbc` 0% pada event
 * Lead maupun Contact. Penyebabnya kode hanya membaca cookie `_fbc`, yang cuma
 * ditulis pixel Meta — dan pixel dimuat `afterInteractive`, jadi pengunjung
 * yang langsung menekan CTA (atau yang pixel-nya diblokir) mengirim event tanpa
 * fbc sama sekali, sehingga konversinya tidak bisa dihubungkan ke klik iklan.
 */

function clearCookies() {
  for (const pair of document.cookie.split(";")) {
    const name = pair.split("=")[0]?.trim()
    if (name) document.cookie = `${name}=; path=/; max-age=0`
  }
}

function goTo(url: string) {
  window.history.replaceState({}, "", url)
}

beforeEach(() => {
  clearCookies()
  __resetFbcMemory()
  goTo("/")
})

afterEach(() => {
  vi.useRealTimers()
})

describe("format fbc mengikuti spesifikasi Meta", () => {
  it("fb.{subdomainIndex}.{creationTime}.{fbclid}", () => {
    expect(buildFbc("ABC123", "bangunrumahbekon.com", 1760000000000)).toBe(
      "fb.1.1760000000000.ABC123"
    )
  })

  it("subdomainIndex naik satu untuk host ber-www", () => {
    expect(buildFbc("ABC123", "www.bangunrumahbekon.com", 1760000000000)).toBe(
      "fb.2.1760000000000.ABC123"
    )
  })

  it("tidak pernah menghasilkan indeks negatif untuk host tanpa titik", () => {
    expect(buildFbc("ABC123", "localhost", 1)).toBe("fb.0.1.ABC123")
  })

  it("mempertahankan fbclid apa adanya — nilainya buram, jangan diutak-atik", () => {
    const aneh = "IwAR0abc-DEF_123.xyz"
    expect(buildFbc(aneh, "contoh.com", 1)).toContain(aneh)
  })
})

describe("captureFbclid menangkap klik iklan tanpa menunggu pixel", () => {
  // subdomainIndex diuji terpisah lewat buildFbc; di sini hostname jsdom
  // ("localhost") tidak relevan, yang diperiksa adalah waktu dan fbclid-nya.
  it("menulis fbc saat mendarat membawa fbclid", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(1760000000000))

    goTo("/?fbclid=KLIK123")
    captureFbclid()

    expect(getFbc()).toBe(buildFbc("KLIK123", window.location.hostname, 1760000000000))
  })

  it("waktu yang disimpan adalah saat MENDARAT, bukan saat konversi", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(1760000000000))
    goTo("/?fbclid=KLIK123")
    captureFbclid()

    // Pengunjung membaca-baca dulu, baru menekan CTA sepuluh menit kemudian.
    vi.setSystemTime(new Date(1760000600000))

    expect(getFbc()).toContain(".1760000000000.")
    expect(getFbc()).not.toContain(".1760000600000.")
  })

  it("tidak menimpa nilai yang sudah ditulis pixel", () => {
    document.cookie = "_fbc=fb.1.999.DARI_PIXEL; path=/"
    goTo("/?fbclid=KLIK123")

    captureFbclid()

    // Browser dan server harus merujuk fbc yang sama persis, kalau tidak
    // dedup lewat eventID jadi tidak bisa dipercaya.
    expect(getFbc()).toBe("fb.1.999.DARI_PIXEL")
  })

  it("diam saja kalau tidak ada fbclid — pengunjung organik tidak dipalsukan", () => {
    goTo("/tentang-kami")
    captureFbclid()
    expect(getFbc()).toBeUndefined()
  })

  it("bertahan setelah pindah halaman tanpa fbclid", () => {
    goTo("/?fbclid=KLIK123")
    captureFbclid()
    const awal = getFbc()

    goTo("/kontak")
    captureFbclid()

    expect(getFbc()).toBe(awal)
  })
})

describe("getFbc aman dipanggil kapan pun", () => {
  it("mengembalikan undefined, bukan melempar, saat belum ada apa-apa", () => {
    expect(() => getFbc()).not.toThrow()
    expect(getFbc()).toBeUndefined()
  })
})
