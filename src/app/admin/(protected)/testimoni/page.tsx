"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface TestimoniItem {
  id: string
  clientName: string
  projectType: string | null
  location: string | null
  content: string
  rating: number | null
  photo: string | null
  isPublished: boolean
  sortOrder: number
}

export default function AdminTestimoniPage() {
  const [items, setItems] = useState<TestimoniItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    clientName: "",
    projectType: "",
    location: "",
    content: "",
    rating: 5,
    isPublished: true,
    sortOrder: 0,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/testimonials", { credentials: "include" })
      const json = await res.json()
      setItems(json.data || [])
    } catch {
      toast.error("Gagal memuat testimoni")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      })
      if (res.ok) {
        toast.success("Testimoni berhasil ditambahkan")
        setShowForm(false)
        setForm({ clientName: "", projectType: "", location: "", content: "", rating: 5, isPublished: true, sortOrder: 0 })
        fetchItems()
      } else {
        const err = await res.json()
        toast.error(err.error || "Gagal menambah testimoni")
      }
    } catch {
      toast.error("Gagal menambah testimoni")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus testimoni ini?")) return
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: "DELETE", credentials: "include" })
      if (res.ok) {
        toast.success("Testimoni berhasil dihapus")
        fetchItems()
      } else {
        toast.error("Gagal menghapus testimoni")
      }
    } catch {
      toast.error("Gagal menghapus testimoni")
    }
  }

  async function handleTogglePublished(item: TestimoniItem) {
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isPublished: !item.isPublished }),
        credentials: "include",
      })
      if (res.ok) {
        toast.success(item.isPublished ? "Testimoni di-unpublish" : "Testimoni dipublish")
        fetchItems()
      }
    } catch {
      toast.error("Gagal mengubah status")
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Testimoni</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors"
        >
          {showForm ? "Batal" : "+ Tambah Testimoni"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4 max-w-xl">
          <h2 className="font-semibold text-gray-900">Tambah Testimoni Baru</h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nama Klien *</label>
            <input
              type="text"
              value={form.clientName}
              onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipe Project</label>
              <input
                type="text"
                value={form.projectType}
                onChange={(e) => setForm((f) => ({ ...f, projectType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Lokasi</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Isi Testimoni *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none resize-y"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Rating (1-5)</label>
              <select
                value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} ★</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              className="rounded"
            />
            Langsung publish
          </label>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Belum ada testimoni</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-gray-900">{item.clientName}</h3>
                  {item.rating && (
                    <span className="text-bekon-gold text-sm">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {item.projectType && `${item.projectType}`}{item.projectType && item.location && ' · '}{item.location && `${item.location}`}
                </p>
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">{item.content}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleTogglePublished(item)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                    item.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.isPublished ? "Published" : "Draft"}
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500" title="Hapus">
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
