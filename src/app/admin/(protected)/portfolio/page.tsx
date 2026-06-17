"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

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
  const router = useRouter()

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/portfolio", { credentials: "include" })
      const json = await res.json()
      setItems(json.data || [])
    } catch {
      toast.error("Gagal memuat portfolio")
    } finally {
      setLoading(false)
    }
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
    } catch {
      toast.error("Gagal menghapus portfolio")
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
    } catch {
      toast.error("Gagal mengubah status")
    }
  }

  if (loading) return <LoadingState />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
        <Link
          href="/admin/portfolio/tambah"
          className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors"
        >
          + Tambah Project
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Cover</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Project</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Lokasi</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Belum ada portfolio
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
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
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Hapus"
                      >
                        🗑️
                      </button>
                      <Link
                        href={`/portfolio/${item.slug}`}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Lihat"
                        target="_blank"
                      >
                        👁️
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
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Memuat...</p>
    </div>
  )
}
