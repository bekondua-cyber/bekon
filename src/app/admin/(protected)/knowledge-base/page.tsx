"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Edit, Trash2 } from "lucide-react"
import { AdminSearch } from "@/components/admin/AdminSearch"
import { TableSkeleton } from "@/components/admin/AdminSkeleton"

interface KnowledgeItem {
  id: string
  question: string
  answer: string
  category: string | null
  isPublished: boolean
  createdAt: string
}

export default function AdminKnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/knowledge-base", { credentials: "include" })
      const json = await res.json()
      setItems(json.data || [])
    } catch {
      toast.error("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus entri ini?")) return
    try {
      const res = await fetch(`/api/admin/knowledge-base?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        toast.success("Entri berhasil dihapus")
        fetchItems()
      } else {
        toast.error("Gagal menghapus entri")
      }
    } catch {
      toast.error("Gagal menghapus entri")
    }
  }

  async function handleTogglePublished(item: KnowledgeItem) {
    try {
      const res = await fetch("/api/admin/knowledge-base", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isPublished: !item.isPublished }),
        credentials: "include",
      })
      if (res.ok) {
        toast.success(item.isPublished ? "Di-unpublish" : "Dipublish")
        fetchItems()
      } else {
        toast.error("Gagal mengubah status")
      }
    } catch {
      toast.error("Gagal mengubah status")
    }
  }

  const q = search.toLowerCase()
  const filtered = items.filter((item) => item.question.toLowerCase().includes(q))

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-36 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <TableSkeleton rows={5} cols={4} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Knowledge Base</h1>
          <p className="text-gray-500 text-sm mt-1">Data pertanyaan &amp; jawaban yang jadi bahan belajar chatbot AI</p>
        </div>
        <div className="flex items-center gap-3">
          <AdminSearch value={search} onChange={setSearch} placeholder="Cari pertanyaan..." />
          <Link
            href="/admin/knowledge-base/tambah"
            className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors"
          >
            + Tambah Entri
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Pertanyaan</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  {search ? "Tidak ada entri yang cocok" : "Belum ada entri knowledge base"}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-md truncate">{item.question}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{item.category || "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublished(item)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        item.isPublished
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {item.isPublished ? "Aktif" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/knowledge-base/${item.id}/edit`)}
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
