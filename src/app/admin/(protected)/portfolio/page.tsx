"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Edit, Trash2, Eye } from "lucide-react"
import { AdminSearch } from "@/components/admin/AdminSearch"
import { TableSkeleton } from "@/components/admin/AdminSkeleton"

interface PortfolioItem {
  id: string
  title: string
  slug: string
  category: string | null
  location: string | null
  coverImage: string | null
  isPublished: boolean
}

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/portfolio", { credentials: "include" })
      const json = await res.json()
      setItems(json.data || [])
    } catch (error) {
      toast.error(`Gagal memuat portfolio: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  function toastErr(context: string) {
    return (error: unknown) => toast.error(`${context}: ${error instanceof Error ? error.message : "Unknown error"}`)
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus portfolio ini?")) return
    try {
      const res = await fetch(`/api/admin/portfolio?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        toast.success("Portfolio berhasil dihapus")
        fetchItems()
      } else {
        toast.error("Gagal menghapus portfolio")
      }
    } catch (error) {
      toastErr("Gagal menghapus portfolio")(error)
    }
  }

  async function handleBulkDelete() {
    if (selected.length === 0) return
    if (!confirm(`Yakin ingin menghapus ${selected.length} portfolio terpilih?`)) return
    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
        credentials: "include",
      })
      if (res.ok) {
        toast.success(`${selected.length} portfolio berhasil dihapus`)
        setSelected([])
        fetchItems()
      } else {
        toast.error("Gagal menghapus portfolio")
      }
    } catch (error) {
      toastErr("Gagal menghapus portfolio")(error)
    }
  }

  async function handleTogglePublished(item: PortfolioItem) {
    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isPublished: !item.isPublished }),
        credentials: "include",
      })
      if (res.ok) {
        toast.success(item.isPublished ? "Portfolio di-unpublish" : "Portfolio dipublish")
        fetchItems()
      } else {
        toast.error("Gagal mengubah status")
      }
    } catch (error) {
      toastErr("Gagal mengubah status")(error)
    }
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? filtered.map((i) => i.id) : [])
  }

  function toggleOne(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const q = search.toLowerCase()
  const filtered = items.filter((item) => item.title.toLowerCase().includes(q))
  const allSelected = filtered.length > 0 && selected.length === filtered.length

  if (loading) return <LoadingState />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
        <div className="flex items-center gap-3">
          <AdminSearch value={search} onChange={setSearch} placeholder="Cari project..." />
          <Link
            href="/admin/portfolio/tambah"
            className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors"
          >
            + Tambah Project
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">Cover</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Project</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Lokasi</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  {search ? "Tidak ada project yang cocok" : "Belum ada portfolio"}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={() => toggleOne(item.id)}
                      className="rounded border-gray-300"
                      aria-label={`Pilih ${item.title}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-12 h-8 rounded overflow-hidden bg-gray-100">
                      {item.coverImage && (
                        <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{item.category?.replace(/-/g, " & ") || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{item.location || "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublished(item)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        item.isPublished
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/portfolio/${item.id}/edit`)}
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
                      <Link
                        href={`/portfolio/${item.slug}`}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Lihat"
                        target="_blank"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
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
      <TableSkeleton rows={5} cols={6} />
    </div>
  )
}
