"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Users, Eye, TrendingDown, Clock } from "lucide-react"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

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

interface Ga4Report {
  totals: {
    users: number
    pageviews: number
    bounceRate: number
    avgSessionDuration: number
    conversions: number
  }
  trend: { date: string; users: number }[]
  bounceTrend: { date: string; bounceRate: number }[]
  genderBreakdown: { gender: string; users: number }[]
  topPages: { path: string; pageviews: number; bounceRate: number; avgSessionDuration: number }[]
}

const GENDER_COLORS = ["#B8963E", "#4A7C3F"]

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m > 0 ? `${m}m ${s}dtk` : `${s}dtk`
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const [ga4Loading, setGa4Loading] = useState(true)
  const [ga4Configured, setGa4Configured] = useState(false)
  const [ga4Report, setGa4Report] = useState<Ga4Report | null>(null)
  const [checklistOpen, setChecklistOpen] = useState(false)

  useEffect(() => {
    fetchData()
    fetchGa4()
  }, [])

  async function fetchData() {
    try {
      const [portfolioRes, articlesRes, leadsRes, videosRes] = await Promise.all([
        fetch("/api/admin/portfolio", { credentials: "include" }),
        fetch("/api/admin/articles", { credentials: "include" }),
        fetch("/api/admin/leads", { credentials: "include" }),
        fetch("/api/admin/videos", { credentials: "include" }),
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
    } catch (error) {
      toast.error(`Gagal memuat data dashboard: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  async function fetchGa4() {
    try {
      const res = await fetch("/api/admin/ga4-report", { credentials: "include" })
      const json = await res.json()
      setGa4Configured(json.configured)
      setGa4Report(json.data)
    } catch {
      toast.error("Gagal memuat data GA4")
    } finally {
      setGa4Loading(false)
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

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
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

      <h2 className="text-xl font-bold text-gray-900 mb-4">Tracking &amp; Analytics</h2>

      <div className="bg-white rounded-xl border border-gray-200 mb-8 overflow-hidden">
        <button
          onClick={() => setChecklistOpen(!checklistOpen)}
          className="w-full flex items-center justify-between px-6 py-4"
        >
          <span className="font-semibold text-gray-900">Setup Checklist Akun Tracking</span>
          <span className="text-gray-400 text-sm">{checklistOpen ? "Sembunyikan" : "Tampilkan"}</span>
        </button>
        {checklistOpen && (
          <div className="px-6 pb-6 text-sm text-gray-600 space-y-3">
            <ChecklistItem
              title="Google Analytics 4"
              desc="Buat property GA4 di analytics.google.com, salin Measurement ID (format G-XXXXXXX) ke env NEXT_PUBLIC_GA4_MEASUREMENT_ID."
            />
            <ChecklistItem
              title="Google Tag Manager"
              desc="Buat container di tagmanager.google.com, salin Container ID (format GTM-XXXXXXX) ke env NEXT_PUBLIC_GTM_ID."
            />
            <ChecklistItem
              title="Google Ads"
              desc="ID konversi (format AW-XXXXXXXXX) diisi ke env NEXT_PUBLIC_GOOGLE_ADS_ID. Untuk melacak konversi spesifik (leads/WA klik), buat 'Conversion Action' di Google Ads > Goals, salin conversion label-nya ke env NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL."
            />
            <ChecklistItem
              title="Meta Pixel + Conversions API"
              desc="Buat Pixel di Meta Business Manager (business.facebook.com), salin Pixel ID ke NEXT_PUBLIC_META_PIXEL_ID. Buat System User dengan akses Pixel, generate Access Token, isi ke META_PIXEL_ID dan META_CAPI_ACCESS_TOKEN (server-only)."
            />
            <ChecklistItem
              title="TikTok Pixel"
              desc="Buat Pixel di TikTok Business Center (business.tiktok.com), salin Pixel ID ke NEXT_PUBLIC_TIKTOK_PIXEL_ID."
            />
            <ChecklistItem
              title="GA4 Data API (untuk dashboard ini)"
              desc="Di Google Cloud Console, aktifkan 'Google Analytics Data API', buat Service Account, download JSON key. Tambahkan email service account sebagai Viewer di property GA4. Isi GA4_PROPERTY_ID dan GA4_SERVICE_ACCOUNT_KEY (isi JSON key, boleh di-base64)."
            />
          </div>
        )}
      </div>

      {ga4Loading ? (
        <p className="text-gray-500 text-sm">Memuat data GA4...</p>
      ) : !ga4Configured ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500 text-sm">
            Dashboard GA4 belum aktif. Lengkapi checklist di atas (GA4_PROPERTY_ID dan GA4_SERVICE_ACCOUNT_KEY) untuk menampilkan data.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <GaStatCard icon={Users} label="Pengguna" value={(ga4Report?.totals.users ?? 0).toLocaleString("id-ID")} accent="bekon-gold" />
            <GaStatCard icon={Eye} label="Pageviews" value={(ga4Report?.totals.pageviews ?? 0).toLocaleString("id-ID")} accent="bekon-sage" />
            <GaStatCard icon={TrendingDown} label="Bounce Rate" value={`${(ga4Report?.totals.bounceRate ?? 0).toFixed(1)}%`} accent="bekon-gold" />
            <GaStatCard icon={Clock} label="Durasi Sesi" value={formatDuration(ga4Report?.totals.avgSessionDuration ?? 0)} accent="bekon-sage" />
          </div>

          <div className={`grid grid-cols-1 ${ga4Report && ga4Report.genderBreakdown.length > 0 ? "lg:grid-cols-3" : ""} gap-6 mb-8`}>
            <div className={`bg-white rounded-xl border border-gray-200 p-6 ${ga4Report && ga4Report.genderBreakdown.length > 0 ? "lg:col-span-2" : ""}`}>
              <h3 className="font-semibold text-gray-900 mb-1">Pengguna (30 hari)</h3>
              <p className="text-xs text-gray-400 mb-4">Total pengguna unik per hari</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={ga4Report?.trend || []}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B8963E" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#B8963E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" name="Pengguna" stroke="#B8963E" fill="url(#colorUsers)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {ga4Report && ga4Report.genderBreakdown.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Pengguna Berdasarkan Gender</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={ga4Report.genderBreakdown}
                      dataKey="users"
                      nameKey="gender"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      label={(props: unknown) => {
                        const p = props as { gender?: string; percent?: number }
                        return `${p.gender} ${((p.percent || 0) * 100).toFixed(0)}%`
                      }}
                      labelLine={false}
                    >
                      {ga4Report.genderBreakdown.map((_, i) => (
                        <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {ga4Report.genderBreakdown.map((g, i) => (
                    <div key={g.gender} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GENDER_COLORS[i % GENDER_COLORS.length] }} />
                      {g.gender}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-1">Bounce Rate (30 hari)</h3>
            <p className="text-xs text-gray-400 mb-4">Persentase kunjungan tanpa interaksi lanjutan</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={ga4Report?.bounceTrend || []}>
                <defs>
                  <linearGradient id="colorBounce" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A7C3F" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4A7C3F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} unit="%" />
                <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, "Bounce Rate"]} />
                <Area type="monotone" dataKey="bounceRate" name="Bounce Rate" stroke="#4A7C3F" fill="url(#colorBounce)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <h3 className="font-semibold text-gray-900 px-6 pt-6 mb-4">Halaman Teratas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Halaman</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Pageviews</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Bounce Rate</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-600">Durasi Rata-rata</th>
                  </tr>
                </thead>
                <tbody>
                  {(ga4Report?.topPages || []).map((p) => (
                    <tr key={p.path} className="border-b border-gray-100">
                      <td className="px-6 py-3 text-gray-900 truncate max-w-xs" title={p.path}>{p.path}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{p.pageviews.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{p.bounceRate.toFixed(1)}%</td>
                      <td className="px-6 py-3 text-right text-gray-600">{formatDuration(p.avgSessionDuration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
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

function GaStatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users
  label: string
  value: string
  accent: "bekon-gold" | "bekon-sage"
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${accent === "bekon-gold" ? "bg-bekon-gold/10 text-bekon-gold" : "bg-bekon-sage/10 text-bekon-sage"}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function ChecklistItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-bekon-gold mt-2 shrink-0" />
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-gray-500 mt-0.5">{desc}</p>
      </div>
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
