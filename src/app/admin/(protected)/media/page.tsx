"use client"
import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"

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

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append("file", files[i])
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        })
        if (res.ok) successCount++
      }

      if (successCount > 0) {
        toast.success(`${successCount} file berhasil diupload`)
        fetchItems()
      } else {
        toast.error("Gagal upload file")
      }
    } catch {
      toast.error("Gagal upload file")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleDelete(publicId: string) {
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

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Belum ada media</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
              <div className="aspect-video bg-gray-100 relative">
                <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyToClipboard(item.url)}
                    className="px-2 py-1 bg-white text-gray-800 rounded text-xs font-medium"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(item.publicId)}
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
