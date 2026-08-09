"use client"
import { useState } from "react"
import { toast } from "sonner"
import { Check, Upload } from "lucide-react"
import { uploadFile } from "@/lib/upload-client"
import { SourceTabs } from "./primitives"
import type { CharacterOption, MaterialOption } from "./types"

/** Grid pilihan aset yang dipakai bersama oleh karakter & bahan. */
function AssetGrid({
  items,
  selectedIds,
  onToggle,
  emptyText,
}: {
  items: { id: string; label: string; photoUrl: string }[]
  selectedIds: string[]
  onToggle: (id: string) => void
  emptyText: string
}) {
  if (items.length === 0) {
    return <p className="text-xs text-gray-400 py-4 text-center">{emptyText}</p>
  }
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {items.map((item) => {
        const selected = selectedIds.includes(item.id)
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={`relative rounded-xl overflow-hidden border-2 transition-all ${
              selected ? "border-bekon-gold" : "border-transparent hover:border-gray-200"
            }`}
          >
            <div className="aspect-square bg-gray-100 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.photoUrl} alt={item.label} className="w-full h-full object-cover" />
              {selected && (
                <div className="absolute inset-0 bg-bekon-gold/25 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-bekon-gold flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-600 truncate px-1 py-0.5 bg-white">{item.label}</p>
          </button>
        )
      })}
    </div>
  )
}

function PhotoField({
  photoUrl,
  onPicked,
  onClear,
}: {
  photoUrl: string
  onPicked: (url: string) => void
  onClear: () => void
}) {
  const [uploading, setUploading] = useState(false)

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const media = await uploadFile(file)
      onPicked(media.url)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal upload foto")
    } finally {
      setUploading(false)
    }
  }

  if (photoUrl) {
    return (
      <div className="relative w-20 h-20 rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt="" className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={onClear}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
        >
          ×
        </button>
      </div>
    )
  }
  return <input type="file" accept="image/*" onChange={handlePhoto} disabled={uploading} className="text-xs" />
}

export function CharacterPicker({
  characters,
  characterId,
  onToggle,
  onCreated,
}: {
  characters: CharacterOption[]
  characterId: string
  onToggle: (id: string) => void
  onCreated: (item: CharacterOption) => void
}) {
  const [tab, setTab] = useState<"library" | "upload">("library")
  const [photoUrl, setPhotoUrl] = useState("")
  const [name, setName] = useState("")
  const [gender, setGender] = useState("")
  const [age, setAge] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!photoUrl || !name.trim()) {
      toast.error("Foto dan nama wajib diisi")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/video-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, gender: gender || null, age: age ? Number(age) : null, photoUrl }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || "Gagal menyimpan karakter")
        return
      }
      toast.success("Karakter ditambahkan & dipilih")
      onCreated(json.data)
      setPhotoUrl(""); setName(""); setGender(""); setAge("")
      setTab("library")
    } catch {
      toast.error("Gagal menyimpan karakter")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SourceTabs tab={tab} setTab={setTab} />
      {tab === "library" ? (
        <AssetGrid
          items={characters.map((c) => ({ id: c.id, label: c.name, photoUrl: c.photoUrl }))}
          selectedIds={characterId ? [characterId] : []}
          onToggle={onToggle}
          emptyText='Belum ada karakter tersimpan. Coba tab "Upload Baru".'
        />
      ) : (
        <div className="space-y-3">
          <PhotoField photoUrl={photoUrl} onPicked={setPhotoUrl} onClear={() => setPhotoUrl("")} />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text" placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)}
              className="col-span-3 sm:col-span-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-bekon-gold outline-none"
            />
            <select
              value={gender} onChange={(e) => setGender(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-bekon-gold outline-none"
            >
              <option value="">Gender</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            <input
              type="number" placeholder="Usia" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-bekon-gold outline-none"
            />
          </div>
          <button
            onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-bekon-gold text-white rounded-lg text-xs font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
          >
            <Upload size={13} /> {saving ? "Menyimpan..." : "Simpan & Pilih Karakter"}
          </button>
        </div>
      )}
    </div>
  )
}

export function MaterialPicker({
  materials,
  materialIds,
  onToggle,
  onCreated,
}: {
  materials: MaterialOption[]
  materialIds: string[]
  onToggle: (id: string) => void
  onCreated: (item: MaterialOption) => void
}) {
  const [tab, setTab] = useState<"library" | "upload">("library")
  const [photoUrl, setPhotoUrl] = useState("")
  const [label, setLabel] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!photoUrl || !label.trim()) {
      toast.error("Foto dan label wajib diisi")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/video-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ label, photoUrl }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || "Gagal menyimpan bahan")
        return
      }
      toast.success("Bahan ditambahkan & dipilih")
      onCreated(json.data)
      setPhotoUrl(""); setLabel("")
      setTab("library")
    } catch {
      toast.error("Gagal menyimpan bahan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SourceTabs tab={tab} setTab={setTab} />
      {tab === "library" ? (
        <AssetGrid
          items={materials.map((m) => ({ id: m.id, label: m.label, photoUrl: m.photoUrl }))}
          selectedIds={materialIds}
          onToggle={onToggle}
          emptyText='Belum ada bahan tersimpan. Coba tab "Upload Baru".'
        />
      ) : (
        <div className="space-y-3">
          <PhotoField photoUrl={photoUrl} onPicked={setPhotoUrl} onClear={() => setPhotoUrl("")} />
          <input
            type="text" placeholder="Label (contoh: Fasad minimalis)" value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-bekon-gold outline-none"
          />
          <button
            onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-bekon-gold text-white rounded-lg text-xs font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
          >
            <Upload size={13} /> {saving ? "Menyimpan..." : "Simpan & Pilih Bahan"}
          </button>
        </div>
      )}
    </div>
  )
}
