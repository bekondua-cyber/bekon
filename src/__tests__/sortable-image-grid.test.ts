import { describe, it, expect } from "vitest"
import { buildImageKeys } from "@/components/admin/SortableImageGrid"

/**
 * Urutan gambar gallery disusun lewat drag and drop, dan `images[0]` adalah foto
 * besar pertama yang dilihat pengunjung di halaman project.
 *
 * Pemindahan posisinya sendiri memakai `moveItem` dari `@/lib/reorder` — sudah
 * diuji di reorder.test.ts, tidak diulang di sini. Yang khas untuk grid ini
 * adalah key React-nya: memakai index sebagai key membuat <Image> di-remount
 * setiap kali urutan berubah, sehingga thumbnail berkedip sepanjang seretan.
 */
describe("buildImageKeys", () => {
  it("memakai URL sebagai key saat semua unik", () => {
    expect(buildImageKeys(["x.jpg", "y.jpg"])).toEqual(["x.jpg", "y.jpg"])
  })

  it("membedakan URL yang kembar", () => {
    expect(buildImageKeys(["x.jpg", "x.jpg", "x.jpg"])).toEqual([
      "x.jpg",
      "x.jpg#1",
      "x.jpg#2",
    ])
  })

  it("menghasilkan key yang unik walau ada URL kembar", () => {
    const keys = buildImageKeys(["a.jpg", "b.jpg", "a.jpg", "b.jpg"])
    expect(new Set(keys).size).toBe(keys.length)
  })

  it("key tiap gambar tetap sama setelah urutan berubah", () => {
    const before = buildImageKeys(["a.jpg", "b.jpg", "c.jpg"])
    const after = buildImageKeys(["c.jpg", "a.jpg", "b.jpg"])
    expect(new Set(after)).toEqual(new Set(before))
  })

  it("aman untuk daftar kosong", () => {
    expect(buildImageKeys([])).toEqual([])
  })
})
