"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AdminSearch } from "@/components/admin/AdminSearch"
import { CardSkeleton } from "@/components/admin/AdminSkeleton"

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
  const [search, setSearch] = useState("")
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

  const q = search.toLowerCase()
  const tabFiltered = activeTab ? items.filter((l) => l.status === activeTab) : items
  const filtered = tabFiltered.filter((l) => l.name.toLowerCase().includes(q))

  function getStatusColor(status: string) {
    return statusOptions.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <CardSkeleton count={4} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads & Konsultasi</h1>
        <AdminSearch value={search} onChange={setSearch} placeholder="Cari nama..." />
      </div>

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
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
                        title="Hubungi via WA"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        WA
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                    {lead.service && <span>{lead.service}</span>}
                    {lead.budget && <span>Budget: {lead.budget}</span>}
                    {lead.location && <span>{lead.location}</span>}
                    <span>{new Date(lead.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
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
