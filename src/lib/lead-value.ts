/**
 * Nilai moneter satu leads, dikirim bersama setiap event konversi.
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

function parseLeadValue(): number {
  const raw = Number(process.env.NEXT_PUBLIC_LEAD_VALUE_IDR)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_LEAD_VALUE
}

export const LEAD_VALUE = parseLeadValue()

/** Kode ISO 4217. Wajib, dan wajib cocok dengan mata uang akun iklan. */
export const LEAD_CURRENCY = "IDR"
