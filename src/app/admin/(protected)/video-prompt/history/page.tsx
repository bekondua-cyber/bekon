"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { AdminSearch } from "@/components/admin/AdminSearch"
import { TableSkeleton } from "@/components/admin/AdminSkeleton"

interface HistoryItem {
  id: string
  title: string
  aspectRatio: string
  sceneCount: number
  platform: string
  resultJson: string
  createdAt: string
}

export default function VideoPromptHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/video-prompt-history", { credentials: "include" })
      const json = await res.json()
      setItems(json.data || [])
    } catch {
      toast.error("Gagal memuat riwayat")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus riwayat ini?")) return
    try {
      const res = await fetch(`/api/admin/video-prompt-history?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        toast.success("Riwayat berhasil dihapus")
        fetchItems()
      } else {
        toast.error("Gagal menghapus riwayat")
      }
    } catch {
      toast.error("Gagal menghapus riwayat")
    }
  }

  function handleCopy(json: string) {
    navigator.clipboard.writeText(json)
    toast.success("JSON disalin ke clipboard")
  }

  const q = search.toLowerCase()
  const filtered = items.filter((item) => item.title.toLowerCase().includes(q))

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <TableSkeleton rows={5} cols={4} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Video Prompt</h1>
          <p className="text-gray-500 text-sm mt-1">Library prompt JSON hasil generate AI</p>
        </div>
        <div className="flex items-center gap-3">
          <AdminSearch value={search} onChange={setSearch} placeholder="Cari judul..." />
          <Link
            href="/admin/video-prompt"
            className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors"
          >
            + Generate Baru
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 text-sm">
            {search ? "Tidak ada riwayat yang cocok" : "Belum ada riwayat prompt video"}
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.platform} · {item.aspectRatio} · {item.sceneCount} scene · {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="text-sm text-bekon-gold hover:underline"
                  >
                    {expandedId === item.id ? "Sembunyikan" : "Lihat JSON"}
                  </button>
                  <button
                    onClick={() => handleCopy(item.resultJson)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedId === item.id && (
                <pre className="mt-3 bg-gray-50 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(JSON.parse(item.resultJson), null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
