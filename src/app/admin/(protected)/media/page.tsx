"use client"
import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { uploadFile } from "@/lib/upload-client"

interface MediaItem {
  id: string
  filename: string
  url: string
  publicId: string
  sizeBytes: number | null
  width: number | null
  height: number | null
  createdAt: string
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "-"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/media", { credentials: "include" })
      const json = await res.json()
      setItems(json.data || [])
    } catch {
      toast.error("Gagal memuat media")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    let successCount = 0
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      try {
        await uploadFile(files[i])
        successCount++
      } catch (err) {
        errors.push(`${files[i].name}: ${err instanceof Error ? err.message : "Upload gagal"}`)
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} file berhasil diupload`)
      fetchItems()
    }
    if (errors.length > 0) {
      errors.forEach((e) => toast.error(e))
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSingleDelete(publicId: string) {
    if (!confirm("Yakin ingin menghapus file ini?")) return
    try {
      const res = await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId }),
        credentials: "include",
      })
      if (res.ok) {
        toast.success("File berhasil dihapus")
        fetchItems()
      } else {
        toast.error("Gagal menghapus file")
      }
    } catch {
      toast.error("Gagal menghapus file")
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return
    if (!confirm(`Yakin ingin menghapus ${selectedIds.length} gambar terpilih?`)) return

    setIsDeleting(true)
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
        credentials: "include",
      })

      if (res.ok) {
        toast.success(`${selectedIds.length} gambar berhasil dihapus`)
        setItems((prev) => prev.filter((m) => !selectedIds.includes(m.id)))
        setSelectedIds([])
      } else {
        const json = await res.json()
        toast.error(json.error || "Gagal menghapus gambar")
      }
    } catch {
      toast.error("Gagal menghapus gambar")
    } finally {
      setIsDeleting(false)
    }
  }

  function toggleSelectAll() {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map((m) => m.id))
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    )
  }

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url)
    toast.success("URL berhasil disalin")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </div>
    )
  }

  const allSelected = items.length > 0 && selectedIds.length === items.length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors cursor-pointer inline-block"
          >
            {uploading ? "Mengupload..." : "+ Upload"}
          </label>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <span className="text-sm text-blue-900 font-medium">
            {selectedIds.length} gambar terpilih
          </span>
          <button
            onClick={() => setSelectedIds([])}
            className="px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 rounded transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menghapus...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Hapus Terpilih
              </>
            )}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Belum ada media</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.length > 0 && (
            <div className="bg-gray-50 rounded-lg border-2 border-gray-300 p-4 flex items-center justify-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-6 h-6 text-bekon-gold border-gray-300 rounded focus:ring-bekon-gold"
                title="Pilih semua"
              />
            </div>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              className={`group relative bg-white rounded-xl border-2 overflow-hidden transition-all ${
                selectedIds.includes(item.id)
                  ? "border-bekon-gold shadow-lg"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="w-5 h-5 text-bekon-gold border-gray-300 rounded focus:ring-bekon-gold bg-white/90"
                />
              </div>

              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img src={item.url} alt={item.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyToClipboard(item.url)}
                    className="px-2 py-1 bg-white text-gray-800 rounded text-xs font-medium"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleSingleDelete(item.publicId)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              <div className="p-2 text-xs text-gray-500 truncate" title={item.filename}>
                {item.filename}
              </div>
              <div className="px-2 pb-2 text-xs text-gray-400 flex justify-between">
                <span>{formatSize(item.sizeBytes)}</span>
                <span>{item.width && item.height ? `${item.width}×${item.height}` : "-"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
