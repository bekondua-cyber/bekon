"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Edit, Trash2, User } from "lucide-react"
import { AdminSearch } from "@/components/admin/AdminSearch"
import { ProfileCardSkeleton } from "@/components/admin/AdminSkeleton"
import { uploadFile } from "@/lib/upload-client"

interface TeamMember {
  id: string
  name: string
  role: string | null
  bio: string | null
  photo: string | null
  sortOrder: number
  isActive: boolean
}

interface MemberForm {
  name: string
  role: string
  bio: string
  photo: string
  sortOrder: number
  isActive: boolean
}

const emptyForm: MemberForm = { name: "", role: "", bio: "", photo: "", sortOrder: 0, isActive: true }

export default function AdminTimPage() {
  const [items, setItems] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<MemberForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoProgress, setPhotoProgress] = useState(0)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/team", { credentials: "include" })
      const json = await res.json()
      setItems(json.data || [])
    } catch {
      toast.error("Gagal memuat data tim")
    } finally {
      setLoading(false)
    }
  }

  function openAddForm() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEditForm(member: TeamMember) {
    setEditingId(member.id)
    setForm({
      name: member.name,
      role: member.role || "",
      bio: member.bio || "",
      photo: member.photo || "",
      sortOrder: member.sortOrder,
      isActive: member.isActive,
    })
    setShowForm(true)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    setPhotoProgress(0)
    const interval = setInterval(() => {
      setPhotoProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90 }
        return Math.min(prev + Math.random() * 15, 90)
      })
    }, 200)
    try {
      const media = await uploadFile(file)
      clearInterval(interval)
      setPhotoProgress(100)
      setForm((f) => ({ ...f, photo: media.url }))
      setTimeout(() => { setUploadingPhoto(false); setPhotoProgress(0) }, 500)
    } catch (err) {
      clearInterval(interval)
      setUploadingPhoto(false)
      setPhotoProgress(0)
      toast.error(err instanceof Error ? err.message : "Gagal upload foto")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingId ? "/api/admin/team" : "/api/admin/team"
      const method = editingId ? "PUT" : "POST"
      const body = editingId ? { id: editingId, ...form } : form

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      })

      if (res.ok) {
        toast.success(editingId ? "Anggota tim berhasil diupdate" : "Anggota tim berhasil ditambahkan")
        setShowForm(false)
        setEditingId(null)
        fetchItems()
      } else {
        const err = await res.json()
        toast.error(err.error || "Gagal menyimpan")
      }
    } catch {
      toast.error("Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus anggota tim ini?")) return
    try {
      const res = await fetch(`/api/admin/team?id=${id}`, { method: "DELETE", credentials: "include" })
      if (res.ok) {
        toast.success("Anggota tim berhasil dihapus")
        fetchItems()
      } else {
        toast.error("Gagal menghapus")
      }
    } catch {
      toast.error("Gagal menghapus")
    }
  }

  const q = search.toLowerCase()
  const filtered = items.filter((member) => member.name.toLowerCase().includes(q))

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-36 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <ProfileCardSkeleton count={6} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tim</h1>
        <div className="flex items-center gap-3">
          <AdminSearch value={search} onChange={setSearch} placeholder="Cari anggota..." />
          <button
            onClick={openAddForm}
            className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors"
          >
            + Tambah Anggota
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4 max-w-xl">
          <h2 className="font-semibold text-gray-900">
            {editingId ? "Edit Anggota Tim" : "Tambah Anggota Tim"}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nama *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Jabatan</label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Foto</label>
            {form.photo && (
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2">
                <img src={form.photo} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, photo: "" }))}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                >
                  ×
                </button>
              </div>
            )}
            {uploadingPhoto ? (
              <div className="flex items-center gap-3 py-2">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-200" />
                    <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray={`${(photoProgress / 100) * 106.8} 106.8`} className="text-bekon-gold transition-all duration-300" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-bekon-gold">{photoProgress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Mengupload foto...</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 min-w-[120px]">
                    <div className="bg-bekon-gold h-1.5 rounded-full transition-all duration-300" style={{ width: `${photoProgress}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded"
                />
                Active
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null) }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">{search ? "Tidak ada anggota yang cocok" : "Belum ada anggota tim"}</div>
        ) : (
          filtered.map((member) => (
            <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                {member.photo ? (
                  <img src={member.photo} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role || "-"}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditForm(member)} className="text-gray-400 hover:text-bekon-gold" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="text-gray-400 hover:text-red-500" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {member.bio && <p className="text-sm text-gray-600 mt-2">{member.bio}</p>}
              {!member.isActive && (
                <span className="mt-2 inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Inactive</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
