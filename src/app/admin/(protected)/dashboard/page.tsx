"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface DashboardStats {
  totalPortfolio: number
  totalArticles: number
  totalLeadsNew: number
  totalVideos: number
  recentLeads: Array<{
    id: string
    name: string
    phone: string | null
    service: string | null
    message: string | null
    status: string
    createdAt: string
  }>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [portfolioRes, articlesRes, leadsRes, videosRes] = await Promise.all([
        fetch("/api/portfolio", { credentials: "include" }),
        fetch("/api/articles", { credentials: "include" }),
        fetch("/api/admin/leads", { credentials: "include" }),
        fetch("/api/videos", { credentials: "include" }),
      ])

      const portfolio = await portfolioRes.json()
      const articles = await articlesRes.json()
      const leads = await leadsRes.json()
      const videos = await videosRes.json()

      const allLeads = leads.data || []
      const recentLeads = allLeads
        .sort((a: { createdAt: string }, b: { createdAt: string }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      setStats({
        totalPortfolio: portfolio.data?.length || 0,
        totalArticles: articles.data?.length || 0,
        totalLeadsNew: allLeads.filter((l: { status: string }) => l.status === "new").length || 0,
        totalVideos: videos.data?.length || 0,
        recentLeads,
      })
    } catch {
      toast.error("Gagal memuat data dashboard")
    } finally {
      setLoading(false)
    }
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Portfolio" value={stats?.totalPortfolio ?? 0} subtitle="Projects" />
        <StatCard title="Artikel" value={stats?.totalArticles ?? 0} subtitle="Articles" />
        <StatCard title="Leads Baru" value={stats?.totalLeadsNew ?? 0} subtitle="Perlu diproses" gold />
        <StatCard title="Video" value={stats?.totalVideos ?? 0} subtitle="Gallery" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Leads Terbaru</h2>
        {stats?.recentLeads && stats.recentLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Layanan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.service || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(lead.status)}`}>
                        {statusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Belum ada leads</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, gold }: { title: string; value: number; subtitle: string; gold?: boolean }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${gold ? "text-bekon-gold" : "text-gray-900"}`}>
        {value}
      </p>
      <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
    </div>
  )
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-yellow-100 text-yellow-700",
    survey: "bg-purple-100 text-purple-700",
    proposal: "bg-orange-100 text-orange-700",
    closing: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  }
  return map[status] || "bg-gray-100 text-gray-700"
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    new: "Baru",
    contacted: "Diproses",
    survey: "Survey",
    proposal: "Penawaran",
    closing: "Closing",
    cancelled: "Batal",
  }
  return map[status] || status
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
