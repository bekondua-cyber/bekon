"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface VideoItem {
  id: string
  title: string
  youtubeUrl: string
  youtubeId: string
  thumbnail: string | null
  category: string | null
  isFeatured: boolean
  isPublished: boolean
  sortOrder: number
  createdAt: string
}

export default function AdminVideoPage() {
  const [items, setItems] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "",
    youtubeUrl: "",
    category: "",
    isFeatured: false,
    isPublished: true,
    sortOrder: 0,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/videos", { credentials: "include" })
      const json = await res.json()
      setItems(json.data || [])
    } catch {
      toast.error("Gagal memuat video")
    } finally {
      setLoading(false)
    }
  }

  function extractYoutubeId(url: string): string {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?]+)/,
      /(?:youtube\.com\/embed\/)([^/?]+)/,
    ]
    for (const p of patterns) {
      const match = url.match(p)
      if (match) return match[1]
    }
    return url
  }

  function openAddForm() {
    setEditing(null)
    setForm({ title: "", youtubeUrl: "", category: "", isFeatured: false, isPublished: true, sortOrder: 0 })
    setShowForm(true)
  }

  function openEditForm(item: VideoItem) {
    setEditing(item.id)
    setForm({
      title: item.title,
      youtubeUrl: item.youtubeUrl,
      category: item.category || "",
      isFeatured: item.isFeatured,
      isPublished: item.isPublished,
      sortOrder: item.sortOrder,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const youtubeId = extractYoutubeId(form.youtubeUrl)
      const payload = {
        ...form,
        youtubeId,
        thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      }

      const isEdit = editing !== null
      const url = isEdit ? "/api/admin/videos" : "/api/admin/videos"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editing, ...payload } : payload),
        credentials: "include",
      })

      if (res.ok) {
        toast.success(isEdit ? "Video berhasil diupdate" : "Video berhasil ditambahkan")
        setShowForm(false)
        setEditing(null)
        fetchItems()
      } else {
        const err = await res.json()
        toast.error(err.error || "Gagal menyimpan video")
      }
    } catch {
      toast.error("Gagal menyimpan video")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus video ini?")) return
    try {
      const res = await fetch(`/api/admin/videos?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        toast.success("Video berhasil dihapus")
        fetchItems()
      } else {
        toast.error("Gagal menghapus video")
      }
    } catch {
      toast.error("Gagal menghapus video")
    }
  }

  async function togglePublished(item: VideoItem) {
    try {
      const res = await fetch("/api/admin/videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isPublished: !item.isPublished }),
        credentials: "include",
      })
      if (res.ok) {
        toast.success(item.isPublished ? "Video di-unpublish" : "Video di-publish")
        fetchItems()
      } else {
        toast.error("Gagal mengubah status")
      }
    } catch {
      toast.error("Gagal mengubah status")
    }
  }

  async function toggleFeatured(item: VideoItem) {
    try {
      const res = await fetch("/api/admin/videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isFeatured: !item.isFeatured }),
        credentials: "include",
      })
      if (res.ok) {
        toast.success(item.isFeatured ? "Featured dihapus" : "Ditandai sebagai Featured")
        fetchItems()
      } else {
        toast.error("Gagal mengubah featured")
      }
    } catch {
      toast.error("Gagal mengubah featured")
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
        <h1 className="text-2xl font-bold text-gray-900">Video</h1>
        <button
          onClick={openAddForm}
          className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors"
        >
          + Tambah Video
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4 max-w-xl">
          <h2 className="font-semibold text-gray-900">
            {editing ? "Edit Video" : "Tambah Video Baru"}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">URL YouTube *</label>
            <input
              type="url"
              value={form.youtubeUrl}
              onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              placeholder="https://youtube.com/watch?v=..."
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
              <option value="hometour">Home Tour</option>
              <option value="3d-desain">3D Desain</option>
              <option value="behind-the-build">Behind the Build</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              />
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                  className="rounded"
                />
                Featured
              </label>
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  className="rounded"
                />
                Published
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditing(null) }}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Belum ada video
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className={`bg-white rounded-xl border overflow-hidden ${item.isPublished ? "border-gray-200" : "border-gray-300 border-dashed opacity-70"}`}>
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {!item.isPublished && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-bold rounded">
                    DRAFT
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 text-sm truncate">{item.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{item.youtubeUrl}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 capitalize">{item.category || "-"}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => togglePublished(item)}
                      className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
                        item.isPublished
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      }`}
                      title={item.isPublished ? "Unpublish" : "Publish"}
                    >
                      {item.isPublished ? "Published" : "Draft"}
                    </button>
                    <button
                      onClick={() => toggleFeatured(item)}
                      className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
                        item.isFeatured
                          ? "bg-bekon-gold/10 text-bekon-gold hover:bg-bekon-gold/20"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      title={item.isFeatured ? "Remove Featured" : "Set Featured"}
                    >
                      {item.isFeatured ? "Featured" : "Feature"}
                    </button>
                    <button
                      onClick={() => openEditForm(item)}
                      className="text-gray-400 hover:text-blue-500 transition-colors text-sm px-1"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-sm px-1"
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
