import { prisma } from "@/lib/prisma"

/**
 * Rate limit yang bertahan lintas instance serverless.
 *
 * `rateLimit()` di rate-limit.ts menyimpan hitungannya di satu Map di dalam
 * proses. Di serverless tiap instance punya Map sendiri, jadi batas
 * "5 percobaan / 15 menit" efektif menjadi 5x jumlah instance yang sedang
 * hidup, dan hitungannya hilang tiap instance diganti. Untuk pembatas yang cuma
 * meredam banjir permintaan itu masih memadai — tapi pembatas LOGIN adalah
 * satu-satunya penahan brute force di seluruh sistem, dan di sana kelonggaran
 * seperti itu tidak bisa diterima.
 *
 * Memakai Postgres yang sudah ada, bukan Redis: klien menolak menambah layanan
 * luar, dan volume login admin jauh di bawah titik di mana Postgres jadi
 * pilihan yang salah.
 */

/** Peluang menyapu baris kedaluwarsa pada satu pemanggilan. */
const CLEANUP_CHANCE = 0.02

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Naikkan hitungan untuk `identifier` dan putuskan apakah permintaan ini boleh
 * lanjut.
 *
 * Kegagalan database sengaja dibiarkan LOLOS (fail-open), bukan memblokir.
 * Kalau Neon sedang bermasalah, memblokir semua login berarti admin terkunci
 * dari panelnya sendiri persis saat situs paling butuh diurus. Risiko
 * sebaliknya — jendela brute force selama Neon down — jauh lebih kecil, dan
 * kegagalannya tetap tercatat di log.
 */
export async function rateLimitDb(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowMs)

  try {
    if (Math.random() < CLEANUP_CHANCE) {
      // Oportunistik, bukan cron: tabelnya kecil dan tidak ada penjadwal di
      // proyek ini. Kegagalannya tidak boleh menggagalkan pemeriksaan utama.
      await prisma.rateLimitHit
        .deleteMany({ where: { resetAt: { lt: now } } })
        .catch(() => {})
    }

    const existing = await prisma.rateLimitHit.findUnique({ where: { identifier } })

    // Belum ada, atau jendelanya sudah lewat: mulai hitungan baru.
    if (!existing || existing.resetAt <= now) {
      await prisma.rateLimitHit.upsert({
        where: { identifier },
        create: { identifier, count: 1, resetAt },
        update: { count: 1, resetAt },
      })
      return { allowed: true, remaining: maxRequests - 1, resetAt: resetAt.getTime() }
    }

    if (existing.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt: existing.resetAt.getTime() }
    }

    // `increment` dilakukan database, bukan dibaca-lalu-ditulis di aplikasi —
    // dua percobaan login bersamaan dari IP yang sama tidak boleh saling
    // menimpa dan diam-diam menghapus satu hitungan.
    const updated = await prisma.rateLimitHit.update({
      where: { identifier },
      data: { count: { increment: 1 } },
    })

    return {
      allowed: updated.count <= maxRequests,
      remaining: Math.max(0, maxRequests - updated.count),
      resetAt: updated.resetAt.getTime(),
    }
  } catch (error) {
    console.error("Rate limit database gagal, permintaan diloloskan:", error)
    return { allowed: true, remaining: maxRequests - 1, resetAt: resetAt.getTime() }
  }
}
