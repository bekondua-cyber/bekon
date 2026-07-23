"use client"
import { useState } from "react"
import { toast } from "sonner"

interface GeneratedArticle {
  title: string
  slug: string
  excerpt: string
  contentHtml: string
  metaTitle: string
  metaDesc: string
}

interface AiGenerateArticleModalProps {
  onGenerated: (result: GeneratedArticle) => void
}

export function AiGenerateArticleModal({ onGenerated }: AiGenerateArticleModalProps) {
  const [open, setOpen] = useState(false)
  const [topic, setTopic] = useState("")
  const [category, setCategory] = useState("")
  const [keywords, setKeywords] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    if (topic.trim().length < 3) {
      toast.error("Topik minimal 3 karakter")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/articles/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ topic, category, keywords }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || "Gagal generate artikel")
        return
      }
      onGenerated(json.data)
      toast.success("Artikel berhasil digenerate, silakan review sebelum simpan")
      setOpen(false)
    } catch {
      toast.error("Gagal generate artikel")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 border border-bekon-gold text-bekon-gold rounded-lg text-sm font-medium hover:bg-bekon-gold/10 transition-colors"
      >
        ✨ Generate dengan AI
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Generate Artikel dengan AI</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Topik *</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Tips memilih material atap rumah tahan gempa"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Kategori (opsional)</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="eksterior / interior / umum"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Kata kunci SEO (opsional)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="renovasi rumah, kontraktor serang"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Menggenerate..." : "Generate"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
