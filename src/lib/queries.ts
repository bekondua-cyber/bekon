import { prisma } from "@/lib/prisma"

/**
 * Query data publik — satu sumber kebenaran.
 *
 * Sebelumnya server component memanggil route API-nya sendiri lewat HTTP
 * (`fetch(`${API_BASE}/api/portfolio`)`). Itu punya dua biaya nyata:
 *
 * 1. Satu render beranda = 1 invocation halaman + 6 invocation API + 7 koneksi
 *    DB. Di Vercel itu 7x tagihan fungsi untuk data yang sama.
 * 2. `API_BASE` jatuh ke "http://localhost:3000" kalau NEXT_PUBLIC_SITE_URL
 *    kosong, dan pemanggilnya menelan error diam-diam — beranda bisa tampil
 *    kosong di produksi tanpa satu pun pesan error di log.
 *
 * Route API tetap ada karena masih dipakai klien (mis. FloatingWhatsApp yang
 * mem-fetch /api/settings), tapi sekarang keduanya memanggil fungsi di sini
 * supaya `select`/`where`/`orderBy`-nya tidak pernah menyimpang.
 */

export const PORTFOLIO_CARD_FIELDS = {
  id: true,
  title: true,
  slug: true,
  category: true,
  location: true,
  coverImage: true,
  images: true,
  isFeatured: true,
  isPublished: true,
  year: true,
} as const

export const VIDEO_FIELDS = {
  id: true,
  title: true,
  youtubeUrl: true,
  youtubeId: true,
  thumbnail: true,
  category: true,
  isFeatured: true,
  isPublished: true,
  sortOrder: true,
} as const

export const TEAM_FIELDS = {
  id: true,
  name: true,
  role: true,
  bio: true,
  photo: true,
} as const

/** Default 8 item; `all: true` mengambil seluruhnya (halaman daftar portfolio). */
export function getPublishedPortfolio(options?: {
  featured?: boolean
  category?: string | null
  excludeSlug?: string | null
  take?: number | null
  all?: boolean
}) {
  const { featured, category, excludeSlug, take, all } = options ?? {}

  const where: Record<string, unknown> = { isPublished: true }
  if (featured) where.isFeatured = true
  if (category) where.category = category
  if (excludeSlug) where.NOT = { slug: excludeSlug }

  // `?take=abc` menghasilkan NaN dari parseInt dan membuat Prisma melempar.
  // Nilai tak masuk akal dikembalikan ke default, bukan diteruskan.
  const safeTake = typeof take === "number" && Number.isFinite(take) && take > 0 ? Math.min(take, 100) : 8

  return prisma.portfolio.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    ...(all ? {} : { take: safeTake }),
    select: PORTFOLIO_CARD_FIELDS,
  })
}

export function getPortfolioBySlug(slug: string) {
  return prisma.portfolio.findUnique({ where: { slug, isPublished: true } })
}

export function getPublishedArticles(options?: { categories?: string[] | null; q?: string | null }) {
  const { categories, q } = options ?? {}

  const where: Record<string, unknown> = { isPublished: true }
  if (categories && categories.length === 1) {
    where.category = categories[0]
  } else if (categories && categories.length > 1) {
    where.category = { in: categories }
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
    ]
  }

  return prisma.article.findMany({ where, orderBy: { publishedAt: "desc" } })
}

export function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({ where: { slug, isPublished: true } })
}

export function getPublishedVideos(options?: { category?: string | null }) {
  const where: Record<string, unknown> = { isPublished: true }
  if (options?.category) where.category = options.category

  return prisma.video.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    select: VIDEO_FIELDS,
  })
}

export function getPublishedTestimonials() {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
  })
}

export function getActiveTeam() {
  return prisma.teamMember.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: TEAM_FIELDS,
  })
}

export function getActiveHeroSlides() {
  return prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      portfolio: { select: { id: true, title: true, slug: true, coverImage: true } },
    },
  })
}

/** Setting disimpan sebagai baris key/value; halaman selalu ingin bentuk peta. */
export async function getSettingsMap(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany()
  const map: Record<string, string> = {}
  for (const row of rows) {
    if (row.value !== null) map[row.key] = row.value
  }
  return map
}
