"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type SettingsData = Record<string, string>

const tabs = ["Perusahaan", "WhatsApp & Kontak", "SEO Global"]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("Perusahaan")

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings", { credentials: "include" })
      const json = await res.json()
      setSettings(json.data || {})
    } catch {
      toast.error("Gagal memuat settings")
    } finally {
      setLoading(false)
    }
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        credentials: "include",
      })
      if (res.ok) {
        toast.success("Settings berhasil disimpan")
      } else {
        toast.error("Gagal menyimpan settings")
      }
    } catch {
      toast.error("Gagal menyimpan settings")
    } finally {
      setSaving(false)
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-bekon-gold text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {activeTab === "Perusahaan" && (
          <>
            <h2 className="font-semibold text-gray-900">Informasi Perusahaan</h2>
            <Field label="Nama Perusahaan" value={getSetting(settings, "nama_perusahaan")} onChange={(v) => updateSetting("nama_perusahaan", v)} />
            <Field label="Alamat" value={getSetting(settings, "alamat")} onChange={(v) => updateSetting("alamat", v)} />
            <Field label="Telepon" value={getSetting(settings, "telepon")} onChange={(v) => updateSetting("telepon", v)} />
            <Field label="Email" value={getSetting(settings, "email")} onChange={(v) => updateSetting("email", v)} />
            <Field label="Tahun Berdiri" value={getSetting(settings, "tahun_berdiri")} onChange={(v) => updateSetting("tahun_berdiri", v)} />
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi Perusahaan</label>
              <textarea
                value={getSetting(settings, "deskripsi")}
                onChange={(e) => updateSetting("deskripsi", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none resize-y"
              />
            </div>
          </>
        )}

        {activeTab === "WhatsApp & Kontak" && (
          <>
            <h2 className="font-semibold text-gray-900">WhatsApp & Kontak</h2>
            <Field label="WA Admin 1 (nomor)" value={getSetting(settings, "wa_admin_1")} onChange={(v) => updateSetting("wa_admin_1", v)} />
            <Field label="WA Admin 1 (nama)" value={getSetting(settings, "wa_admin_1_name")} onChange={(v) => updateSetting("wa_admin_1_name", v)} />
            <Field label="WA Admin 2 (nomor)" value={getSetting(settings, "wa_admin_2")} onChange={(v) => updateSetting("wa_admin_2", v)} />
            <Field label="WA Admin 2 (nama)" value={getSetting(settings, "wa_admin_2_name")} onChange={(v) => updateSetting("wa_admin_2_name", v)} />
            <Field label="Instagram" value={getSetting(settings, "instagram")} onChange={(v) => updateSetting("instagram", v)} />
            <Field label="YouTube" value={getSetting(settings, "youtube")} onChange={(v) => updateSetting("youtube", v)} />
            <Field label="TikTok" value={getSetting(settings, "tiktok")} onChange={(v) => updateSetting("tiktok", v)} />
          </>
        )}

        {activeTab === "SEO Global" && (
          <>
            <h2 className="font-semibold text-gray-900">SEO Global</h2>
            <Field label="Default Meta Title" value={getSetting(settings, "meta_title_default")} onChange={(v) => updateSetting("meta_title_default", v)} />
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Default Meta Description</label>
              <textarea
                value={getSetting(settings, "meta_desc_default")}
                onChange={(e) => updateSetting("meta_desc_default", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none resize-y"
              />
            </div>
            <Field label="Google Analytics ID" value={getSetting(settings, "google_analytics_id")} onChange={(v) => updateSetting("google_analytics_id", v)} />
          </>
        )}

        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Semua"}
          </button>
        </div>
      </div>
    </div>
  )
}

function getSetting(settings: Record<string, string>, key: string, defaultValue: string = "") {
  return settings[key] || defaultValue
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold focus:border-bekon-gold outline-none"
      />
    </div>
  )
}
