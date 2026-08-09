/**
 * Nilai moneter satu konversi, dikirim bersama setiap event.
 *
 * Tanpa `value` dan `currency`, Meta/TikTok/Google tidak bisa menghitung ROAS
 * sama sekali — Events Manager menandainya sebagai masalah prioritas tinggi.
 *
 * Angka Rp50.000 masih PLACEHOLDER, disamakan dengan Conversion Action di
 * Google Ads supaya pelaporan lintas platform sebanding. Ganti lewat env
 * `NEXT_PUBLIC_LEAD_VALUE_IDR` begitu klien memberi data rata-rata nilai
 * proyek dan tingkat closing yang sebenarnya.
 */
const DEFAULT_LEAD_VALUE = 50000

/**
 * Klik WhatsApp bernilai lebih rendah dari submit form: orangnya belum
 * meninggalkan nama/nomor, dan sebagian tidak pernah benar-benar mengirim
 * pesan. Menyamakan keduanya akan menggelembungkan ROAS yang dilaporkan.
 */
const CONTACT_VALUE_RATIO = 0.4

function parsePositive(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const LEAD_VALUE = parsePositive(process.env.NEXT_PUBLIC_LEAD_VALUE_IDR, DEFAULT_LEAD_VALUE)

export const CONTACT_VALUE = parsePositive(
  process.env.NEXT_PUBLIC_CONTACT_VALUE_IDR,
  Math.round(LEAD_VALUE * CONTACT_VALUE_RATIO)
)

/** Kode ISO 4217. Wajib, dan wajib cocok dengan mata uang akun iklan. */
export const LEAD_CURRENCY = "IDR"

/**
 * Nilai untuk satu nama event.
 *
 * Browser dan server WAJIB memakai fungsi ini supaya angkanya identik — Meta
 * mencocokkan event pixel dan CAPI lewat `eventID`, dan nilai yang berbeda
 * pada id yang sama membuat dedup-nya tidak bisa dipercaya.
 */
export function valueForEvent(eventName: string): number {
  return eventName === "Contact" ? CONTACT_VALUE : LEAD_VALUE
}
