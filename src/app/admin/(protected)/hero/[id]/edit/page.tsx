"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { ImageUploader } from "@/components/admin/ImageUploader"

interface PortfolioOption {
  id: string
  title: string
  coverImage: string | null
}

export default function AdminHeroEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [portfolios, setPortfolios] = useState<PortfolioOption[]>([])
  const [form, setForm] = useState({
    image: "",
    title: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
    isActive: true,
    sourceType: "custom" as "custom" | "portfolio",
    portfolioId: "",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [slideRes, portfolioRes] = await Promise.all([
          fetch(`/api/admin/hero-slides?id=${id}`, { credentials: "include" }),
          fetch("/api/admin/portfolio", { credentials: "include" }),
        ])
        const slideJson = await slideRes.json()
        const portfolioJson = await portfolioRes.json()
        setPortfolios(portfolioJson.data || [])

        const d = slideJson.data
        if (d) {
          setForm({
            image: d.image || "",
            title: d.title || "",
            subtitle: d.subtitle || "",
            ctaText: d.ctaText || "",
            ctaLink: d.ctaLink || "",
            isActive: d.isActive ?? true,
            sourceType: d.sourceType || "custom",
            portfolioId: d.portfolioId || "",
          })
        }
      } catch {
        toast.error("Gagal memuat data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error("Title wajib diisi")
      return
    }

    setSaving(true)
    try {
      const selectedPortfolio = portfolios.find((p) => p.id === form.portfolioId)
      const payload = {
        id,
        ...form,
        image: form.sourceType === "portfolio" ? (selectedPortfolio?.coverImage || "") : form.image,
        portfolioId: form.sourceType === "portfolio" ? form.portfolioId : null,
      }

      const res = await fetch("/api/admin/hero-slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })

      if (res.ok) {
        toast.success("Hero slide berhasil diupdate")
        router.push("/admin/hero")
      } else {
        const err = await res.json()
        toast.error(err.error || "Gagal mengupdate hero slide")
      }
    } catch {
      toast.error("Gagal mengupdate hero slide")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Hero Slide</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Image</h2>

          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="sourceType"
                value="custom"
                checked={form.sourceType === "custom"}
                onChange={() => setForm((f) => ({ ...f, sourceType: "custom", portfolioId: "" }))}
                className="accent-bekon-gold"
              />
              Upload Manual
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="sourceType"
                value="portfolio"
                checked={form.sourceType === "portfolio"}
                onChange={() => setForm((f) => ({ ...f, sourceType: "portfolio" }))}
                className="accent-bekon-gold"
              />
              Dari Portfolio
            </label>
          </div>

          {form.sourceType === "custom" ? (
            <ImageUploader value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Pilih Project Portfolio</label>
              <select
                value={form.portfolioId}
                onChange={(e) => {
                  setForm((f) => ({ ...f, portfolioId: e.target.value }))
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              >
                <option value="">Pilih portfolio...</option>
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              {form.portfolioId && (
                <div className="mt-3 relative w-48 h-32 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={portfolios.find((p) => p.id === form.portfolioId)?.coverImage || ""}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Konten</h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={100}
              placeholder="Wujudkan Hunian Impian Anda"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold focus:border-bekon-gold outline-none"
              required
            />
            <span className="text-xs text-gray-400 mt-1">{form.title.length}/100</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Subtitle</label>
            <textarea
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              maxLength={200}
              rows={3}
              placeholder="Deskripsi singkat..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none resize-y"
            />
            <span className="text-xs text-gray-400 mt-1">{form.subtitle.length}/200</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">CTA Text</label>
              <input
                type="text"
                value={form.ctaText}
                onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))}
                placeholder="Konsultasi Gratis"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">CTA Link</label>
              <input
                type="text"
                value={form.ctaLink}
                onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))}
                placeholder="/kontak"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pengaturan</h2>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="rounded accent-bekon-gold"
            />
            Active (tampil di halaman utama)
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
