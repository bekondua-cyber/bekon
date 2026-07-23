"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface Ga4Report {
  rows: { date: string; sessions: number; pageviews: number; conversions: number }[]
  topPages: { path: string; views: number }[]
  totals: { sessions: number; pageviews: number; conversions: number }
}

export default function TrackingPage() {
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)
  const [report, setReport] = useState<Ga4Report | null>(null)
  const [checklistOpen, setChecklistOpen] = useState(true)

  useEffect(() => {
    fetch("/api/admin/ga4-report", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        setConfigured(json.configured)
        setReport(json.data)
      })
      .catch(() => toast.error("Gagal memuat data GA4"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tracking &amp; Analytics</h1>

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

      {loading ? (
        <p className="text-gray-500 text-sm">Memuat data...</p>
      ) : !configured ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500 text-sm">
            Dashboard GA4 belum aktif. Lengkapi checklist di atas (GA4_PROPERTY_ID dan GA4_SERVICE_ACCOUNT_KEY) untuk menampilkan data.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Sessions" value={report?.totals.sessions ?? 0} accent="text-bekon-gold" />
            <StatCard title="Pageviews" value={report?.totals.pageviews ?? 0} accent="text-blue-600" />
            <StatCard title="Konversi" value={report?.totals.conversions ?? 0} accent="text-green-600" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">Sessions &amp; Pageviews (30 hari)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={report?.rows || []}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A15B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C9A15B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="sessions" stroke="#C9A15B" fill="url(#colorSessions)" strokeWidth={2} />
                <Area type="monotone" dataKey="pageviews" stroke="#3B82F6" fill="url(#colorViews)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Halaman Teratas</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={report?.topPages || []} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="path" tick={{ fontSize: 11 }} width={200} />
                <Tooltip />
                <Bar dataKey="views" fill="#C9A15B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ title, value, accent }: { title: string; value: number; accent: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${accent}`}>{value.toLocaleString("id-ID")}</p>
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
