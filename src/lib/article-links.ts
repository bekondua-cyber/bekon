import { services, type ServiceItem } from "@/data/services"

/**
 * Menghubungkan artikel ke halaman yang menghasilkan prospek.
 *
 * Sebelumnya halaman detail artikel adalah jalan buntu: nol tautan ke
 * `/layanan/*`, `/portfolio`, `/kontak`, maupun WhatsApp. Pembaca yang datang
 * dari pencarian membaca artikel lalu tidak punya satu pun jalan menuju
 * penawaran — untuk situs yang tujuannya mengumpulkan prospek, itu kebocoran
 * paling mendasar.
 *
 * Pemetaannya sengaja berbasis kategori, bukan pencocokan kata kunci di badan
 * artikel. Isi artikel di produksi rata-rata cuma 71 kata, jadi mencari kata
 * kunci di dalamnya menghasilkan sedikit sekali kecocokan sekaligus berisiko
 * terlihat seperti spam tautan. Kategori sudah tersedia dan akurat.
 */

/** Layanan yang paling masuk akal untuk tiap kategori artikel. */
const CATEGORY_SERVICES: Record<string, string[]> = {
  eksterior: ["desain-eksterior", "bangun-rumah-renovasi"],
  interior: ["desain-interior", "interior-rumah"],
  umum: ["bangun-rumah-renovasi", "desain-eksterior", "desain-interior"],
}

/**
 * Petunjuk dari judul, dipakai kalau kategorinya kosong atau tidak dikenal.
 * Judul di produksi memang deskriptif ("Inspirasi Carport", "Kitchen Set"),
 * jadi ini penebak yang cukup andal sebagai lapis kedua.
 */
const TITLE_HINTS: { pattern: RegExp; category: string }[] = [
  { pattern: /kitchen|dapur|kamar|ruang tamu|interior|laundry|dining|tv room/i, category: "interior" },
  { pattern: /carport|teras|balkon|balkom|kanopi|taman|garden|fasad|eksterior|atap/i, category: "eksterior" },
]

function resolveCategory(category: string | null | undefined, title: string): string {
  if (category && CATEGORY_SERVICES[category]) return category

  for (const hint of TITLE_HINTS) {
    if (hint.pattern.test(title)) return hint.category
  }
  return "umum"
}

/** Layanan terkait untuk sebuah artikel. Selalu mengembalikan minimal satu. */
export function servicesForArticle(
  category: string | null | undefined,
  title: string
): ServiceItem[] {
  const resolved = resolveCategory(category, title)
  const slugs = CATEGORY_SERVICES[resolved] ?? CATEGORY_SERVICES.umum

  const matched = slugs
    .map((slug) => services.find((s) => s.slug === slug))
    .filter((s): s is ServiceItem => Boolean(s))

  // Jangan pernah merender blok kosong — lebih baik menawarkan layanan umum
  // daripada tidak menawarkan apa pun.
  return matched.length > 0 ? matched : services.slice(0, 2)
}

/** Pesan WhatsApp yang menyebut artikel yang sedang dibaca. */
export function waMessageForArticle(title: string): string {
  return `Halo BEKON, saya membaca artikel "${title}" dan ingin konsultasi.`
}
