"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { uploadFile } from "@/lib/upload-client"

interface CharacterItem {
  id: string
  name: string
  gender: string | null
  age: number | null
  photoUrl: string
  createdAt: string
}

export default function VideoCharactersPage() {
  const [items, setItems] = useState<CharacterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ name: "", gender: "", age: "" })
  const [photoUrl, setPhotoUrl] = useState("")

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/video-characters", { credentials: "include" })
      const json = await res.json()
      setItems(json.data || [])
    } catch {
      toast.error("Gagal memuat karakter")
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
      toast.error("Upload foto karakter dulu")
      return
    }
    if (!form.name.trim()) {
      toast.error("Nama karakter wajib diisi")
      return
    }

    try {
      const res = await fetch("/api/admin/video-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          gender: form.gender || null,
          age: form.age ? Number(form.age) : null,
          photoUrl,
        }),
      })
      if (res.ok) {
        toast.success("Karakter berhasil ditambahkan")
        setForm({ name: "", gender: "", age: "" })
        setPhotoUrl("")
        fetchItems()
      } else {
        const err = await res.json()
        toast.error(err.error || "Gagal menambahkan karakter")
      }
    } catch {
      toast.error("Gagal menambahkan karakter")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus karakter ini?")) return
    try {
      const res = await fetch(`/api/admin/video-characters?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        toast.success("Karakter berhasil dihapus")
        fetchItems()
      } else {
        toast.error("Gagal menghapus karakter")
      }
    } catch {
      toast.error("Gagal menghapus karakter")
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Karakter Video</h1>
      <p className="text-gray-500 text-sm mb-6">Library talent/karakter untuk AI Video Prompt Generator</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4 max-w-xl">
        <h2 className="font-semibold text-gray-900">Tambah Karakter</h2>
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
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">Nama *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Jenis Kelamin</label>
            <select
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
            >
              <option value="">-</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Usia</label>
            <input
              type="number"
              min={0}
              max={120}
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors"
        >
          Simpan Karakter
        </button>
      </form>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Belum ada karakter</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
              <div className="p-2">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {[item.gender, item.age ? `${item.age} th` : null].filter(Boolean).join(" · ") || "-"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
