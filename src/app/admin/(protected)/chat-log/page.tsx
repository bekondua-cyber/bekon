"use client"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Trash2, MessageSquare, AlertCircle } from "lucide-react"
import { TableSkeleton } from "@/components/admin/AdminSkeleton"

interface ChatMessage {
  role: string
  content: string
}

interface Conversation {
  id: string
  messages: string
  usedFallback: boolean
  createdAt: string
}

/** `messages` disimpan sebagai string JSON; jangan pernah parse tanpa penjaga. */
function parseMessages(raw: string): ChatMessage[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (m): m is ChatMessage => typeof m?.role === "string" && typeof m?.content === "string"
    )
  } catch {
    return []
  }
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AdminChatLogPage() {
  const [items, setItems] = useState<Conversation[]>([])
  const [total, setTotal] = useState(0)
  const [fallbackCount, setFallbackCount] = useState(0)
  const [onlyFallback, setOnlyFallback] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/chat-log?fallback=${onlyFallback}`, {
        credentials: "include",
      })
      const json = await res.json()
      setItems(json.data || [])
      setTotal(json.total || 0)
      setFallbackCount(json.fallbackCount || 0)
    } catch {
      toast.error("Gagal memuat log percakapan")
    } finally {
      setLoading(false)
    }
  }, [onlyFallback])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  async function handleDelete(id: string) {
    if (!confirm("Hapus percakapan ini?")) return
    try {
      const res = await fetch(`/api/admin/chat-log?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        toast.success("Percakapan dihapus")
        fetchItems()
      } else {
        toast.error("Gagal menghapus percakapan")
      }
    } catch {
      toast.error("Gagal menghapus percakapan")
    }
  }

  if (loading) {
    return (
      <div>
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-6" />
        <TableSkeleton rows={5} cols={3} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log Chatbot</h1>
          <p className="text-gray-500 text-sm mt-1">
            Apa yang ditanyakan calon klien. Percakapan bertanda{" "}
            <span className="font-medium text-amber-600">Tak Terjawab</span> adalah
            kandidat terbaik untuk ditambahkan ke Knowledge Base.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 shrink-0">
          <input
            type="checkbox"
            checked={onlyFallback}
            onChange={(e) => {
              setLoading(true)
              setOnlyFallback(e.target.checked)
            }}
            className="rounded border-gray-300"
          />
          Hanya yang tak terjawab
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <MessageSquare size={15} />
            Total percakapan
          </div>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <AlertCircle size={15} />
            Tak terjawab
          </div>
          <p className="text-2xl font-bold text-amber-600">{fallbackCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center py-12 text-gray-500 text-sm">
            {onlyFallback
              ? "Belum ada percakapan yang gagal dijawab — bagus."
              : "Belum ada percakapan tercatat."}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => {
              const messages = parseMessages(item.messages)
              const firstQuestion =
                messages.find((m) => m.role === "user")?.content ?? "(tanpa pertanyaan)"
              const isOpen = expanded === item.id

              return (
                <li key={item.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setExpanded(isOpen ? null : item.id)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-900 font-medium">
                          {firstQuestion.slice(0, 90)}
                          {firstQuestion.length > 90 ? "…" : ""}
                        </span>
                        {item.usedFallback && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium">
                            Tak Terjawab
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(item.createdAt)} · {messages.length} pesan
                      </p>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      aria-label="Hapus percakapan"
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-1">
                      {messages.map((m, i) => (
                        <div
                          key={i}
                          className={`text-sm rounded-lg px-3 py-2 ${
                            m.role === "user"
                              ? "bg-gray-50 text-gray-900"
                              : "bg-bekon-gold/5 text-gray-700"
                          }`}
                        >
                          <span className="block text-[11px] uppercase tracking-wide text-gray-400 mb-0.5">
                            {m.role === "user" ? "Pengunjung" : "Chatbot"}
                          </span>
                          {m.content}
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
