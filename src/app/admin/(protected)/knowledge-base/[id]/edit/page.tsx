"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"

interface KnowledgeForm {
  question: string
  answer: string
  category: string
  isPublished: boolean
}

export default function AdminKnowledgeBaseEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<KnowledgeForm>({
    question: "",
    answer: "",
    category: "",
    isPublished: false,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/knowledge-base?id=${id}`, { credentials: "include" })
        const json = await res.json()
        const d = json.data
        if (d) {
          setForm({
            question: d.question || "",
            answer: d.answer || "",
            category: d.category || "",
            isPublished: d.isPublished || false,
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
    setSaving(true)

    try {
      const res = await fetch("/api/admin/knowledge-base", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...form }),
        credentials: "include",
      })

      if (res.ok) {
        toast.success("Entri berhasil diupdate")
        router.push("/admin/knowledge-base")
      } else {
        const err = await res.json()
        toast.error(err.error || "Gagal mengupdate entri")
      }
    } catch {
      toast.error("Gagal mengupdate entri")
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Entri Knowledge Base</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Pertanyaan *</label>
            <input
              type="text"
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold focus:border-bekon-gold outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Jawaban *</label>
            <textarea
              value={form.answer}
              onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none resize-y"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
            >
              <option value="">Pilih kategori</option>
              <option value="layanan">Layanan</option>
              <option value="harga">Harga & Estimasi</option>
              <option value="proses">Proses Kerja</option>
              <option value="area">Area Layanan</option>
              <option value="umum">Umum</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              className="rounded"
            />
            Aktifkan (dipakai chatbot)
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
