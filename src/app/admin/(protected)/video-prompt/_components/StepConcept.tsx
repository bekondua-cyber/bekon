"use client"
import { ArrowRight, Check, Wand2, Building2, Mic2, RefreshCw, Home, MessageCircleHeart, Users } from "lucide-react"
import { VIDEO_CATEGORIES } from "@/lib/video-categories"
import { FieldLabel } from "./primitives"
import type { PortfolioOption } from "./types"

const CATEGORY_ICONS: Record<string, typeof Building2> = {
  Building2, Mic2, RefreshCw, Home, MessageCircleHeart, Users,
}

export function StepConcept({
  category, setCategory,
  portfolios, portfolioId, setPortfolioId,
  seedTopic, setSeedTopic,
  onNext,
}: {
  category: string
  setCategory: (id: string) => void
  portfolios: PortfolioOption[]
  portfolioId: string
  setPortfolioId: (v: string) => void
  seedTopic: string
  setSeedTopic: (v: string) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-7">
      <div>
        <FieldLabel hint="Pilihan ini menentukan gaya, struktur, dan apakah video butuh talent.">
          Mau bikin video apa?
        </FieldLabel>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VIDEO_CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c.icon]
            const isSelected = category === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`group relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-bekon-gold bg-gradient-to-br from-bekon-gold/10 to-transparent shadow-md -translate-y-0.5"
                    : "border-gray-200 hover:border-bekon-gold/40 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    isSelected
                      ? "bg-gradient-to-br from-bekon-gold to-bekon-gold-dark text-white"
                      : "bg-gray-100 text-gray-400 group-hover:bg-bekon-gold/10 group-hover:text-bekon-gold"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <p className="font-semibold text-sm text-gray-900">{c.label}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{c.description}</p>
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-bekon-gold flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel hint="Kalau dipilih, detail proyek ikut masuk ke prompt.">Proyek referensi</FieldLabel>
          <select
            value={portfolioId}
            onChange={(e) => setPortfolioId(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
          >
            <option value="">Tidak ada</option>
            {portfolios.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel hint="Kosongkan kalau ingin AI yang menentukan arah.">Topik atau arahan</FieldLabel>
          <input
            type="text"
            value={seedTopic}
            onChange={(e) => setSeedTopic(e.target.value)}
            placeholder="Contoh: tips renovasi dapur minimalis"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-bekon-gold to-bekon-gold-dark text-white rounded-xl text-sm font-semibold hover:opacity-95 shadow-sm transition-opacity"
      >
        <Wand2 size={16} /> Cari Ide Konten <ArrowRight size={16} />
      </button>
    </div>
  )
}
