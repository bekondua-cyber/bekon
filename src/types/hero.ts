export interface HeroSlide {
  id: string
  image: string
  title: string | null
  subtitle: string | null
  ctaText: string | null
  ctaLink: string | null
  order: number
  isActive: boolean
  /** Kolomnya `String` biasa di DB, jadi tipe ini tidak boleh menyempit ke
   *  dua nilai saja — baris lama atau salah tulis akan lolos begitu saja. */
  sourceType: string
  portfolioId: string | null
  /** Date dari Prisma; string kalau datang lewat JSON di komponen klien. */
  createdAt: Date | string
  updatedAt: Date | string
  portfolio?: {
    id: string
    title: string
    slug: string
    coverImage: string | null
  } | null
}

export interface HeroSlideFormData {
  image: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  order?: number
  isActive?: boolean
  sourceType?: "custom" | "portfolio"
  portfolioId?: string
}
