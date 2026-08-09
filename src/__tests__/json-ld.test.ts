import { describe, expect, it } from "vitest"
import { serializeJsonLd } from "@/lib/json-ld"

/**
 * Judul artikel bisa datang dari generator AI dan tidak pernah disanitasi
 * (yang disanitasi hanya `content`). Kalau judul memuat `</script>`, tag
 * penutupnya keluar lebih awal dan sisanya jadi skrip yang dieksekusi.
 */
describe("serializeJsonLd", () => {
  it("tidak pernah meloloskan </script> ke keluaran", () => {
    const output = serializeJsonLd({
      headline: 'Tips Rumah</script><script>alert(document.cookie)</script>',
    })
    expect(output).not.toContain("</script>")
    expect(output).not.toContain("<script>")
    expect(output).not.toContain("<")
    expect(output).not.toContain(">")
  })

  it("tetap menghasilkan JSON yang sah dan isinya utuh", () => {
    const data = {
      "@context": "https://schema.org",
      headline: 'Judul <b>tebal</b> & "dikutip"',
      description: "Harga < 500 juta & > 100 juta",
    }
    const parsed = JSON.parse(serializeJsonLd(data))
    expect(parsed).toEqual(data)
  })

  it("meng-escape ampersand agar entitas HTML tidak terbentuk", () => {
    const output = serializeJsonLd({ headline: "Desain &lt; Interior" })
    expect(output).not.toContain("&")
    expect(JSON.parse(output).headline).toBe("Desain &lt; Interior")
  })

  it("tidak merusak spasi biasa", () => {
    // Escape U+2028/U+2029 pernah salah tulis jadi spasi biasa, yang membuat
    // setiap spasi tergantikan dan JSON-nya hancur.
    const parsed = JSON.parse(serializeJsonLd({ headline: "Bangun Rumah di Serang" }))
    expect(parsed.headline).toBe("Bangun Rumah di Serang")
  })

  it("meng-escape U+2028/U+2029 yang mematahkan parser JavaScript", () => {
    const tricky = `baris${"\u2028"}baru${"\u2029"}lagi`
    const output = serializeJsonLd({ headline: tricky })
    expect(output).not.toContain("\u2028")
    expect(output).not.toContain("\u2029")
    expect(JSON.parse(output).headline).toBe(tricky)
  })
})
