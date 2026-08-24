import { beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Pembatas login adalah SATU-SATUNYA penahan brute force di seluruh sistem.
 * Versi memori memberi tiap instance serverless jatah 5 percobaannya sendiri,
 * sehingga batasnya bisa dilewati begitu saja dengan menunggu instance
 * berganti. Versi database ini menutupnya — dan berkas ini menjaga perilakunya.
 */

const db = {
  findUnique: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
  deleteMany: vi.fn(),
}

vi.mock("@/lib/prisma", () => ({
  prisma: { rateLimitHit: db },
}))

const MAX = 5
const WINDOW = 15 * 60 * 1000

async function panggil(identifier = "login:1.2.3.4") {
  const { rateLimitDb } = await import("@/lib/rate-limit-db")
  return rateLimitDb(identifier, MAX, WINDOW)
}

describe("rateLimitDb", () => {
  beforeEach(() => {
    vi.resetModules()
    for (const fn of Object.values(db)) fn.mockReset()
    db.deleteMany.mockResolvedValue({ count: 0 })
    // Matikan penyapuan acak supaya tes tidak flaky.
    vi.spyOn(Math, "random").mockReturnValue(0.99)
  })

  it("mengizinkan percobaan pertama dan membuat barisnya", async () => {
    db.findUnique.mockResolvedValue(null)
    db.upsert.mockResolvedValue({})

    const hasil = await panggil()

    expect(hasil.allowed).toBe(true)
    expect(hasil.remaining).toBe(MAX - 1)
    expect(db.upsert).toHaveBeenCalled()
  })

  it("memblokir setelah jatah habis", async () => {
    db.findUnique.mockResolvedValue({
      identifier: "login:1.2.3.4",
      count: MAX,
      resetAt: new Date(Date.now() + 60_000),
    })

    const hasil = await panggil()

    expect(hasil.allowed).toBe(false)
    expect(hasil.remaining).toBe(0)
    // Yang sudah diblokir tidak boleh menambah hitungan lagi — kalau tidak,
    // penyerang yang terus mencoba memperpanjang blokirnya sendiri tanpa batas.
    expect(db.update).not.toHaveBeenCalled()
  })

  it("memulai jendela baru setelah resetAt lewat", async () => {
    db.findUnique.mockResolvedValue({
      identifier: "login:1.2.3.4",
      count: MAX,
      resetAt: new Date(Date.now() - 1_000),
    })
    db.upsert.mockResolvedValue({})

    const hasil = await panggil()

    expect(hasil.allowed).toBe(true)
    expect(db.upsert).toHaveBeenCalled()
  })

  it("menaikkan hitungan lewat increment database, bukan baca-lalu-tulis", async () => {
    db.findUnique.mockResolvedValue({
      identifier: "login:1.2.3.4",
      count: 2,
      resetAt: new Date(Date.now() + 60_000),
    })
    db.update.mockResolvedValue({ count: 3, resetAt: new Date(Date.now() + 60_000) })

    const hasil = await panggil()

    expect(hasil.allowed).toBe(true)
    expect(hasil.remaining).toBe(MAX - 3)
    // Dua percobaan bersamaan dari IP yang sama tidak boleh saling menimpa.
    expect(db.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { count: { increment: 1 } } })
    )
  })

  it("meloloskan permintaan kalau database gagal (fail-open)", async () => {
    db.findUnique.mockRejectedValue(new Error("Neon tidak bisa dihubungi"))
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})

    const hasil = await panggil()

    // Memblokir semua login saat Neon bermasalah berarti admin terkunci dari
    // panelnya sendiri persis saat situs paling butuh diurus.
    expect(hasil.allowed).toBe(true)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it("tabel yang belum ada pun tidak mengunci admin", async () => {
    // Kondisi nyata kalau kode ter-deploy sebelum migrasinya dijalankan.
    db.findUnique.mockRejectedValue(
      Object.assign(new Error('relation "rate_limit_hit" does not exist'), { code: "P2021" })
    )
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})

    const hasil = await panggil()

    expect(hasil.allowed).toBe(true)
    spy.mockRestore()
  })

  it("menyapu baris kedaluwarsa saat undian menang", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    db.findUnique.mockResolvedValue(null)
    db.upsert.mockResolvedValue({})

    await panggil()

    expect(db.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { resetAt: { lt: expect.any(Date) } } })
    )
  })
})
