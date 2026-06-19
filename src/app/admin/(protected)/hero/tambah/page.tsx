"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImageUploader } from "@/components/admin/ImageUploader"

interface PortfolioOption {
  id: string
  title: string
  coverImage: string | null
}

export default function AdminHeroTambahPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [portfolios, setPortfolios] = useState<PortfolioOption[]>([])
  const [form, setForm] = useState({
    image: "",
    isActive: true,
    sourceType: "custom" as "custom" | "portfolio",
    portfolioId: "",
  })

  useEffect(() => {
    async function fetchPortfolios() {
      try {
        const res = await fetch("/api/admin/portfolio", { credentials: "include" })
        const json = await res.json()
        setPortfolios(json.data || [])
      } catch {
        // silently fail
      }
    }
    fetchPortfolios()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.sourceType === "custom" && !form.image) {
      toast.error("Image wajib diupload")
      return
    }
    if (form.sourceType === "portfolio" && !form.portfolioId) {
      toast.error("Pilih portfolio terlebih dahulu")
      return
    }
    setLoading(true)
    try {
      const selectedPortfolio = portfolios.find((p) => p.id === form.portfolioId)
      const payload = {
        image: form.sourceType === "portfolio" ? (selectedPortfolio?.coverImage || "") : form.image,
        isActive: form.isActive,
        sourceType: form.sourceType,
        portfolioId: form.sourceType === "portfolio" ? form.portfolioId : null,
      }
      const res = await fetch("/api/admin/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })
      if (res.ok) {
        toast.success("Hero slide berhasil dibuat")
        router.push("/admin/hero")
      } else {
        const err = await res.json()
        toast.error(err.error || "Gagal membuat hero slide")
      }
    } catch {
      toast.error("Gagal membuat hero slide")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Hero Slide</h1>
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
                onChange={() => setForm((f) => ({ ...f, sourceType: "portfolio", image: "" }))}
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
                onChange={(e) => setForm((f) => ({ ...f, portfolioId: e.target.value }))}
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
            disabled={loading}
            className="px-6 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
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
