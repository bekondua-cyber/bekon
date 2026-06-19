export interface HeroSlide {
  id: string
  image: string
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
  order?: number
  isActive?: boolean
  sourceType?: "custom" | "portfolio"
  portfolioId?: string
}
