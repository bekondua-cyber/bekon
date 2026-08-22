import { describe, expect, it } from "vitest"
import { moveItem, sameOrder } from "@/lib/reorder"

/**
 * Urutan tim di panel admin sekarang ditentukan lewat drag and drop, dan hasil
 * seretannya langsung ditulis ke sortOrder di database. Satu kesalahan indeks di
 * sini berarti anggota tim tampil di posisi yang salah pada halaman publik —
 * kesalahan yang tidak akan terdeteksi tanpa tes ini.
 */
describe("moveItem", () => {
  const list = ["a", "b", "c", "d"]

  it("memindahkan item maju ke posisi baru", () => {
    expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a", "d"])
  })

  it("memindahkan item mundur ke posisi baru", () => {
    expect(moveItem(list, 3, 1)).toEqual(["a", "d", "b", "c"])
  })

  it("memindahkan item ke ujung akhir", () => {
    expect(moveItem(list, 0, 3)).toEqual(["b", "c", "d", "a"])
  })

  it("memindahkan item ke ujung awal", () => {
    expect(moveItem(list, 2, 0)).toEqual(["c", "a", "b", "d"])
  })

  it("tidak mengubah apa pun kalau posisinya sama", () => {
    expect(moveItem(list, 1, 1)).toEqual(list)
  })

  it("tidak pernah mengubah daftar aslinya", () => {
    const original = [...list]
    moveItem(list, 0, 3)
    expect(list).toEqual(original)
  })

  it("tidak menghilangkan atau menggandakan item", () => {
    for (let from = 0; from < list.length; from++) {
      for (let to = 0; to < list.length; to++) {
        const next = moveItem(list, from, to)
        expect(next).toHaveLength(list.length)
        expect([...next].sort()).toEqual([...list].sort())
      }
    }
  })

  it("mengabaikan indeks di luar jangkauan, bukan melempar error", () => {
    expect(moveItem(list, -1, 2)).toEqual(list)
    expect(moveItem(list, 0, 99)).toEqual(list)
    expect(moveItem(list, 99, 0)).toEqual(list)
    expect(moveItem(list, 0.5, 2)).toEqual(list)
  })

  it("aman untuk daftar kosong dan daftar satu item", () => {
    expect(moveItem([], 0, 0)).toEqual([])
    expect(moveItem(["a"], 0, 0)).toEqual(["a"])
  })
})

describe("sameOrder", () => {
  it("mengenali urutan yang identik", () => {
    expect(sameOrder(["a", "b", "c"], ["a", "b", "c"])).toBe(true)
  })

  it("mengenali urutan yang bertukar posisi", () => {
    expect(sameOrder(["a", "b", "c"], ["b", "a", "c"])).toBe(false)
  })

  it("mengenali panjang yang berbeda", () => {
    expect(sameOrder(["a", "b"], ["a", "b", "c"])).toBe(false)
  })

  it("dua daftar kosong dianggap sama", () => {
    expect(sameOrder([], [])).toBe(true)
  })
})
