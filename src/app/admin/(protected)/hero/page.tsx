"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Edit, Trash2 } from "lucide-react"
import { AdminSearch } from "@/components/admin/AdminSearch"
import { TableSkeleton } from "@/components/admin/AdminSkeleton"
import type { HeroSlide } from "@/types/hero"

export default function AdminHeroPage() {
  const [items, setItems] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [dragId, setDragId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/hero-slides", { credentials: "include" })
      const json = await res.json()
      setItems(json.data || [])
    } catch {
      toast.error("Gagal memuat hero slides")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus slide ini?")) return
    try {
      const res = await fetch(`/api/admin/hero-slides?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        toast.success("Slide berhasil dihapus")
        fetchItems()
      } else if (res.status === 404) {
        toast.info("Slide ini sudah terhapus sebelumnya")
        fetchItems()
      } else {
        toast.error("Gagal menghapus slide")
      }
    } catch {
      toast.error("Gagal menghapus slide")
    }
  }

  async function handleBulkDelete() {
    if (selected.length === 0) return
    if (!confirm(`Yakin ingin menghapus ${selected.length} slide terpilih?`)) return
    try {
      const res = await fetch("/api/admin/hero-slides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
        credentials: "include",
      })
      if (res.ok) {
        toast.success(`${selected.length} slide berhasil dihapus`)
        setSelected([])
        fetchItems()
      } else {
        toast.error("Gagal menghapus slide")
      }
    } catch {
      toast.error("Gagal menghapus slide")
    }
  }

  async function handleToggleActive(item: HeroSlide) {
    try {
      const res = await fetch("/api/admin/hero-slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
        credentials: "include",
      })
      if (res.ok) {
        toast.success(item.isActive ? "Slide dinonaktifkan" : "Slide diaktifkan")
        fetchItems()
      } else {
        toast.error("Gagal mengubah status")
      }
    } catch {
      toast.error("Gagal mengubah status")
    }
  }

  const handleReorder = useCallback(async (slides: { id: string; order: number }[]) => {
    try {
      const res = await fetch("/api/admin/hero-slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
        credentials: "include",
      })
      if (!res.ok) {
        toast.error("Gagal menyimpan urutan")
        fetchItems()
      }
    } catch {
      toast.error("Gagal menyimpan urutan")
      fetchItems()
    }
  }, [])

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragId(items[index].id)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(index))
  }, [items])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"))
    if (isNaN(dragIndex) || dragIndex === dropIndex) {
      setDragId(null)
      return
    }

    setItems((prevItems) => {
      const newItems = [...prevItems]
      const [removed] = newItems.splice(dragIndex, 1)
      newItems.splice(dropIndex, 0, removed)
      const reordered = newItems.map((item, idx) => ({ ...item, order: idx }))
      handleReorder(reordered.map((item) => ({ id: item.id, order: item.order })))
      return reordered
    })
    setDragId(null)
  }, [handleReorder])

  function toggleAll(checked: boolean) {
    setSelected(checked ? filtered.map((i) => i.id) : [])
  }

  function toggleOne(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const q = search.toLowerCase()
  const filtered = items.filter((item) => {
    const label = item.sourceType === "portfolio" && item.portfolio?.title
      ? item.portfolio.title
      : item.image || ""
    return label.toLowerCase().includes(q)
  })
  const allSelected = filtered.length > 0 && selected.length === filtered.length

  if (loading) return <LoadingState />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hero Slides</h1>
        <div className="flex items-center gap-3">
          <AdminSearch value={search} onChange={setSearch} placeholder="Cari slide..." />
          <Link
            href="/admin/hero/tambah"
            className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors"
          >
            + Tambah Slide
          </Link>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-gray-600">{selected.length} terpilih</span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Hapus Terpilih
          </button>
          <button
            onClick={() => setSelected([])}
            className="px-3 py-1.5 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="rounded border-gray-300"
                  aria-label="Pilih semua"
                />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-10"></th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Preview</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipe</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  {search ? "Tidak ada slide yang cocok" : "Belum ada hero slide"}
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => (
                <tr
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`border-b border-gray-100 transition-colors ${
                    dragId === item.id ? "opacity-50 bg-gray-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={() => toggleOne(item.id)}
                      className="rounded border-gray-300"
                      aria-label={`Pilih slide ${index + 1}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-400 cursor-grab" title="Drag to reorder">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <circle cx="3" cy="2" r="1.2" /><circle cx="9" cy="2" r="1.2" />
                      <circle cx="3" cy="6" r="1.2" /><circle cx="9" cy="6" r="1.2" />
                      <circle cx="3" cy="10" r="1.2" /><circle cx="9" cy="10" r="1.2" />
                    </svg>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-24 h-14 rounded overflow-hidden bg-gray-100">
                      {item.sourceType === "portfolio" && item.portfolio?.coverImage ? (
                        <img src={item.portfolio.coverImage} alt="" className="w-full h-full object-cover" />
                      ) : item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                      )}
                    </div>
                  </td>
                    <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        item.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.order}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{item.sourceType}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/hero/${item.id}/edit`)}
                        className="text-gray-400 hover:text-bekon-gold transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-36 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <TableSkeleton rows={5} cols={7} />
    </div>
  )
}
