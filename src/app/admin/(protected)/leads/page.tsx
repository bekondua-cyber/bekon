"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Lead {
  id: string
  name: string
  phone: string | null
  service: string | null
  budget: string | null
  location: string | null
  message: string | null
  status: string
  notes: string | null
  createdAt: string
}

const statusOptions = [
  { value: "new", label: "Baru", color: "bg-blue-100 text-blue-700" },
  { value: "contacted", label: "Diproses", color: "bg-yellow-100 text-yellow-700" },
  { value: "survey", label: "Survey", color: "bg-purple-100 text-purple-700" },
  { value: "proposal", label: "Penawaran", color: "bg-orange-100 text-orange-700" },
  { value: "closing", label: "Closing", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Batal", color: "bg-red-100 text-red-700" },
]

const tabs = [
  { value: "", label: "Semua" },
  { value: "new", label: "Baru" },
  { value: "contacted", label: "Diproses" },
  { value: "proposal", label: "Penawaran" },
  { value: "closing", label: "Closing" },
  { value: "cancelled", label: "Batal" },
]

export default function AdminLeadsPage() {
  const [items, setItems] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("")

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/leads", { credentials: "include" })
      const json = await res.json()
      setItems(json.data || [])
    } catch {
      toast.error("Gagal memuat leads")
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
        credentials: "include",
      })
      if (res.ok) {
        toast.success("Status lead berhasil diubah")
        fetchItems()
      } else {
        toast.error("Gagal mengubah status")
      }
    } catch {
      toast.error("Gagal mengubah status")
    }
  }

  const filtered = activeTab ? items.filter((l) => l.status === activeTab) : items

  function getStatusColor(status: string) {
    return statusOptions.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-700"
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Leads & Konsultasi</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? "bg-bekon-gold text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            {tab.value && (
              <span className="ml-1.5 text-xs opacity-70">
                ({items.filter((l) => l.status === tab.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Belum ada leads</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <div key={lead.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-gray-900">{lead.name}</h3>
                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 text-sm"
                        title="Hubungi via WA"
                      >
                        📞 WA
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    {lead.service && <span>📍 {lead.service}</span>}
                    {lead.budget && <span>💰 {lead.budget}</span>}
                    {lead.location && <span>🌏 {lead.location}</span>}
                    <span>📅 {new Date(lead.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>

                  {lead.message && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{lead.message}</p>
                  )}

                  {lead.notes && (
                    <p className="text-xs text-gray-400 mt-1 italic">Catatan: {lead.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium border-0 ${getStatusColor(lead.status)}`}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
