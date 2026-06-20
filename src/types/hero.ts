export interface HeroSlide {
  id: string
  image: string
  title: string | null
  subtitle: string | null
  ctaText: string | null
  ctaLink: string | null
  order: number
  isActive: boolean
  sourceType: "custom" | "portfolio"
  portfolioId: string | null
  createdAt: string
  updatedAt: string
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
