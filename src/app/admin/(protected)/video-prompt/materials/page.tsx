"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { uploadFile } from "@/lib/upload-client"
import { VideoPromptTabs } from "@/components/admin/VideoPromptTabs"

interface MaterialItem {
  id: string
  label: string
  description: string | null
  photoUrl: string
  createdAt: string
}

export default function VideoMaterialsPage() {
  const [items, setItems] = useState<MaterialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ label: "", description: "" })
  const [photoUrl, setPhotoUrl] = useState("")

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/video-materials", { credentials: "include" })
      const json = await res.json()
      setItems(json.data || [])
    } catch {
      toast.error("Gagal memuat bahan")
    } finally {
      setLoading(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const media = await uploadFile(file)
      setPhotoUrl(media.url)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal upload foto")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!photoUrl) {
      toast.error("Upload foto dulu")
      return
    }
    if (!form.label.trim()) {
      toast.error("Label wajib diisi")
      return
    }

    try {
      const res = await fetch("/api/admin/video-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          label: form.label,
          description: form.description || null,
          photoUrl,
        }),
      })
      if (res.ok) {
        toast.success("Bahan berhasil ditambahkan")
        setForm({ label: "", description: "" })
        setPhotoUrl("")
        fetchItems()
      } else {
        const err = await res.json()
        toast.error(err.error || "Gagal menambahkan bahan")
      }
    } catch {
      toast.error("Gagal menambahkan bahan")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus bahan ini?")) return
    try {
      const res = await fetch(`/api/admin/video-materials?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        toast.success("Bahan berhasil dihapus")
        fetchItems()
      } else {
        toast.error("Gagal menghapus bahan")
      }
    } catch {
      toast.error("Gagal menghapus bahan")
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Bahan Referensi Video</h1>
      <p className="text-gray-500 text-sm mb-4">Foto referensi visual (gaya, lokasi, objek) untuk AI Video Prompt Generator</p>

      <VideoPromptTabs active="/admin/video-prompt/materials" />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4 max-w-xl">
        <h2 className="font-semibold text-gray-900">Tambah Bahan</h2>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Foto *</label>
          {photoUrl ? (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden mb-2">
              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotoUrl("")}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
              >
                ×
              </button>
            </div>
          ) : (
            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="text-sm" />
          )}
          {uploading && <p className="text-xs text-gray-400 mt-1">Mengupload...</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Label *</label>
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="Contoh: Fasad rumah minimalis, Lahan kosong lokasi A"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi (opsional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none resize-y"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors"
        >
          Simpan Bahan
        </button>
      </form>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Belum ada bahan referensi</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                <img src={item.photoUrl} alt={item.label} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
              <div className="p-2">
                <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                {item.description && <p className="text-xs text-gray-500 truncate">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
