"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Edit, GripVertical, Trash2, User } from "lucide-react"
import { AdminSearch } from "@/components/admin/AdminSearch"
import { ProfileCardSkeleton } from "@/components/admin/AdminSkeleton"
import { uploadFile } from "@/lib/upload-client"
import { moveItem, sameOrder } from "@/lib/reorder"

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
  isActive: boolean
}

const emptyForm: MemberForm = { name: "", role: "", bio: "", photo: "", isActive: true }

/** Jarak geser sebelum sentuhan dianggap drag, bukan klik yang bergetar. */
const DRAG_THRESHOLD_PX = 6
/** Lebar zona di tepi layar yang memicu auto-scroll saat kartu diseret. */
const AUTOSCROLL_MARGIN_PX = 90

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
  const [dragId, setDragId] = useState<string | null>(null)
  const [savingOrder, setSavingOrder] = useState(false)

  // Handler drag dipasang di window (jari/kursor sering keluar dari kartu asal),
  // jadi nilai yang dibacanya harus lewat ref — closure listener tidak ikut
  // ter-render ulang saat state berubah.
  const itemsRef = useRef<TeamMember[]>([])
  const dragIdRef = useRef<string | null>(null)
  const draggingRef = useRef(false)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const snapshotRef = useRef<TeamMember[]>([])
  const cleanupRef = useRef<(() => void) | null>(null)
  const autoScrollRef = useRef<number | null>(null)
  const pointerYRef = useRef(0)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    fetchItems()
  }, [])

  // Kalau komponen dilepas di tengah drag, listener window ikut dibersihkan.
  useEffect(() => () => cleanupRef.current?.(), [])

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
      const method = editingId ? "PUT" : "POST"
      // Anggota baru ditaruh di ujung daftar; posisinya diatur dengan drag,
      // bukan diketik. Saat edit, sortOrder sengaja tidak dikirim agar urutan
      // hasil drag tidak tertimpa nilai lama yang ada di form.
      const body = editingId
        ? { id: editingId, ...form }
        : { ...form, sortOrder: items.length }

      const res = await fetch("/api/admin/team", {
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

  const q = search.trim().toLowerCase()
  const filtered = q ? items.filter((member) => member.name.toLowerCase().includes(q)) : items
  // Saat daftar disaring, posisi kartu di layar bukan posisi sebenarnya —
  // menyeretnya akan menyimpan urutan yang tidak diniatkan admin.
  const reorderable = !q && items.length > 1
  // Gagang tetap terlihat selagi urutan disimpan (kalau disembunyikan, seluruh
  // isi kartu bergeser sekejap setiap kali admin selesai menyeret), tapi
  // seretan barunya ditahan sampai simpanan sebelumnya selesai.
  const canReorder = reorderable && !savingOrder

  const persistOrder = useCallback(async (next: TeamMember[], previous: TeamMember[]) => {
    setSavingOrder(true)
    try {
      const res = await fetch("/api/admin/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: next.map((m) => m.id) }),
        credentials: "include",
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || "Gagal menyimpan urutan")
      }
      // Samakan sortOrder lokal dengan yang baru ditulis server supaya
      // penyimpanan berikutnya tidak berangkat dari angka basi.
      setItems((prev) => prev.map((m, index) => (m.sortOrder === index ? m : { ...m, sortOrder: index })))
      toast.success("Urutan tim disimpan")
    } catch (err) {
      setItems(previous)
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan urutan")
    } finally {
      setSavingOrder(false)
    }
  }, [])

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current !== null) {
      window.clearInterval(autoScrollRef.current)
      autoScrollRef.current = null
    }
  }, [])

  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current !== null) return
    autoScrollRef.current = window.setInterval(() => {
      const y = pointerYRef.current
      const bottomEdge = window.innerHeight - AUTOSCROLL_MARGIN_PX
      if (y < AUTOSCROLL_MARGIN_PX) {
        window.scrollBy(0, -Math.ceil((AUTOSCROLL_MARGIN_PX - y) / 5))
      } else if (y > bottomEdge) {
        window.scrollBy(0, Math.ceil((y - bottomEdge) / 5))
      }
    }, 16)
  }, [])

  function beginDrag(e: React.PointerEvent, id: string) {
    if (!canReorder) return
    if (e.pointerType === "mouse" && e.button !== 0) return
    if (cleanupRef.current) return

    dragIdRef.current = id
    startRef.current = { x: e.clientX, y: e.clientY }
    snapshotRef.current = itemsRef.current
    pointerYRef.current = e.clientY

    const onMove = (ev: PointerEvent) => {
      pointerYRef.current = ev.clientY

      if (!draggingRef.current) {
        const start = startRef.current
        if (!start) return
        const moved =
          Math.abs(ev.clientX - start.x) > DRAG_THRESHOLD_PX ||
          Math.abs(ev.clientY - start.y) > DRAG_THRESHOLD_PX
        if (!moved) return
        draggingRef.current = true
        setDragId(id)
        document.body.style.userSelect = "none"
        startAutoScroll()
      }

      const overId = memberIdAtPoint(ev.clientX, ev.clientY)
      if (!overId || overId === dragIdRef.current) return

      setItems((prev) => {
        const from = prev.findIndex((m) => m.id === dragIdRef.current)
        const to = prev.findIndex((m) => m.id === overId)
        if (from === -1 || to === -1 || from === to) return prev
        return moveItem(prev, from, to)
      })
    }

    const finish = () => {
      cleanupRef.current?.()
      cleanupRef.current = null

      const wasDragging = draggingRef.current
      const before = snapshotRef.current
      draggingRef.current = false
      dragIdRef.current = null
      startRef.current = null
      snapshotRef.current = []
      setDragId(null)

      if (!wasDragging) return
      const after = itemsRef.current
      if (sameOrder(after.map((m) => m.id), before.map((m) => m.id))) return
      void persistOrder(after, before)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", finish)
    window.addEventListener("pointercancel", finish)

    cleanupRef.current = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", finish)
      window.removeEventListener("pointercancel", finish)
      stopAutoScroll()
      document.body.style.userSelect = ""
    }
  }

  /** Geser kartu satu posisi — jalan keluar untuk yang memakai keyboard. */
  function nudge(id: string, delta: number) {
    if (!canReorder) return
    const before = itemsRef.current
    const from = before.findIndex((m) => m.id === id)
    const to = from + delta
    if (from === -1 || to < 0 || to >= before.length) return
    const next = moveItem(before, from, to)
    setItems(next)
    void persistOrder(next, before)
  }

  function handleCardKeyDown(e: React.KeyboardEvent, id: string) {
    // Hanya saat kartunya sendiri yang fokus — bukan tombol Edit/Hapus di dalamnya.
    if (e.target !== e.currentTarget) return
    if (!e.ctrlKey && !e.metaKey) return
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      nudge(id, -1)
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      nudge(id, 1)
    }
  }

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

          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded"
              />
              Active
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Urutan tampil diatur dengan menyeret kartu di bawah, bukan lewat form ini.
            </p>
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

      {items.length > 1 && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 min-h-[20px]">
          {savingOrder ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-bekon-gold rounded-full animate-spin" />
              <span>Menyimpan urutan...</span>
            </>
          ) : q ? (
            <span>Kosongkan pencarian dulu untuk mengubah urutan.</span>
          ) : (
            <>
              <GripVertical className="w-4 h-4 text-gray-400" />
              <span>
                Seret kartu untuk mengatur urutan tampil di halaman publik. Urutan tersimpan otomatis.
              </span>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">{search ? "Tidak ada anggota yang cocok" : "Belum ada anggota tim"}</div>
        ) : (
          filtered.map((member, index) => {
            const isDragging = dragId === member.id
            return (
              <div
                key={member.id}
                data-member-id={member.id}
                // Kursor boleh menyeret kartu di mana saja; sentuhan wajib lewat
                // gagang, kalau tidak jari tidak bisa lagi men-scroll halaman.
                onPointerDown={(e) => {
                  if (e.pointerType !== "mouse") return
                  if ((e.target as HTMLElement).closest("button, a, input, textarea, select")) return
                  beginDrag(e, member.id)
                }}
                onKeyDown={(e) => handleCardKeyDown(e, member.id)}
                tabIndex={reorderable ? 0 : -1}
                aria-roledescription={reorderable ? "Kartu bisa diseret" : undefined}
                aria-label={reorderable ? `${member.name}, posisi ${index + 1} dari ${filtered.length}. Tekan Ctrl dengan panah kiri atau kanan untuk memindahkan.` : undefined}
                className={`bg-white rounded-xl border p-4 transition-all outline-none focus-visible:ring-2 focus-visible:ring-bekon-gold ${
                  reorderable ? "cursor-grab active:cursor-grabbing select-none" : ""
                } ${
                  isDragging
                    ? "border-bekon-gold ring-2 ring-bekon-gold/30 shadow-lg scale-[1.02] opacity-95"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {reorderable && (
                    <span
                      onPointerDown={(e) => beginDrag(e, member.id)}
                      style={{ touchAction: "none" }}
                      className="-ml-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0"
                      title="Seret untuk memindahkan"
                      aria-hidden="true"
                    >
                      <GripVertical className="w-4 h-4" />
                    </span>
                  )}
                  {member.photo ? (
                    // draggable={false}: tanpa ini browser memulai drag gambar
                    // bawaannya dan seretan kartu terhenti di tengah jalan.
                    <img src={member.photo} alt="" draggable={false} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
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
            )
          })
        )}
      </div>
    </div>
  )
}

/** Kartu mana yang ada tepat di bawah kursor/jari saat ini. */
function memberIdAtPoint(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y)
  const card = el?.closest<HTMLElement>("[data-member-id]")
  return card?.dataset.memberId ?? null
}
