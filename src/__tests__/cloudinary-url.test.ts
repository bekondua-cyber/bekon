import { describe, expect, it } from "vitest"
import { toDownloadUrl } from "@/lib/cloudinary-url"

const CLOUDINARY = "https://res.cloudinary.com/dfkmge5kg/image/upload/v1782545468/bekon/abc123.webp"

describe("toDownloadUrl", () => {
  it("menyisipkan flag fl_attachment supaya browser mengunduh", () => {
    expect(toDownloadUrl(CLOUDINARY)).toBe(
      "https://res.cloudinary.com/dfkmge5kg/image/upload/fl_attachment/v1782545468/bekon/abc123.webp"
    )
  })

  it("memakai nama berkas yang di-slug saat diberikan", () => {
    expect(toDownloadUrl(CLOUDINARY, "Arsitek BEKON")).toContain("fl_attachment:arsitek-bekon")
  })

  it("membiarkan URL non-Cloudinary apa adanya", () => {
    const other = "https://example.com/foto.jpg"
    expect(toDownloadUrl(other)).toBe(other)
  })

  it("tidak menghasilkan flag ganda pada URL yang sudah punya transformasi", () => {
    const url = toDownloadUrl(CLOUDINARY, "Fasad Minimalis")
    expect(url.match(/fl_attachment/g)).toHaveLength(1)
  })
})
