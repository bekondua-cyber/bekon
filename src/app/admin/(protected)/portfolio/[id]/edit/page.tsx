"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { uploadFile } from "@/lib/upload-client"

const categories = ["eksterior", "interior", "bangun", "renovasi", "kost-ruko"]

interface PortfolioForm {
  title: string
  slug: string
  category: string
  location: string
  areaSqm: string
  year: string
  description: string
  isFeatured: boolean
  isPublished: boolean
  coverImage: string
  images: string[]
}

export default function AdminPortfolioEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadCoverProgress, setUploadCoverProgress] = useState(0)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadImagesProgress, setUploadImagesProgress] = useState(0)
  const [form, setForm] = useState<PortfolioForm>({
    title: "",
    slug: "",
    category: "",
    location: "",
    areaSqm: "",
    year: "",
    description: "",
    isFeatured: false,
    isPublished: false,
    coverImage: "",
    images: [],
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/portfolio?id=${id}`, { credentials: "include" })
        const json = await res.json()
        if (!res.ok) {
          toast.error(json.error || "Gagal memuat data portfolio")
          setLoading(false)
          return
        }
        const d = json.data
        if (d) {
          setForm({
            title: d.title || "",
            slug: d.slug || "",
            category: d.category || "",
            location: d.location || "",
            areaSqm: d.areaSqm?.toString() || "",
            year: d.year?.toString() || "",
            description: d.description || "",
            isFeatured: d.isFeatured || false,
            isPublished: d.isPublished || false,
            coverImage: d.coverImage || "",
            images: d.images || [],
          })
        }
      } catch {
        toast.error("Gagal memuat data portfolio")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  }

  function handleTitleChange(title: string) {
    setForm((f) => ({ ...f, title, slug: generateSlug(title) }))
  }

  function simulateProgress(
    setProgress: React.Dispatch<React.SetStateAction<number>>,
    setIsUploading: (v: boolean) => void
  ) {
    setIsUploading(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90 }
        return Math.min(prev + Math.random() * 15, 90)
      })
    }, 200)
    return interval
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const interval = simulateProgress(setUploadCoverProgress, setUploadingCover)
    try {
      const media = await uploadFile(file)
      clearInterval(interval)
      setUploadCoverProgress(100)
      setForm((f) => ({ ...f, coverImage: media.url }))
      setTimeout(() => { setUploadingCover(false); setUploadCoverProgress(0) }, 500)
    } catch (err) {
      clearInterval(interval)
      setUploadingCover(false)
      setUploadCoverProgress(0)
      toast.error(err instanceof Error ? err.message : "Gagal upload cover")
    }
  }

  async function handleImagesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const interval = simulateProgress(setUploadImagesProgress, setUploadingImages)
    try {
      const urls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const media = await uploadFile(files[i])
        urls.push(media.url)
      }
      clearInterval(interval)
      setUploadImagesProgress(100)
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
      setTimeout(() => { setUploadingImages(false); setUploadImagesProgress(0) }, 500)
    } catch (err) {
      clearInterval(interval)
      setUploadingImages(false)
      setUploadImagesProgress(0)
      toast.error(err instanceof Error ? err.message : "Gagal upload gambar")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        id,
        ...form,
        areaSqm: form.areaSqm ? parseFloat(form.areaSqm) : null,
        year: form.year ? parseInt(form.year) : null,
      }

      const res = await fetch("/api/admin/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })

      if (res.ok) {
        toast.success("Portfolio berhasil diupdate")
        router.push("/admin/portfolio")
      } else {
        const err = await res.json()
        toast.error(err.error || "Gagal mengupdate portfolio")
      }
    } catch {
      toast.error("Gagal mengupdate portfolio")
    } finally {
      setSaving(false)
    }
  }

  function removeImage(index: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
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
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Informasi Project</h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold focus:border-bekon-gold outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat.replace(/-/g, " & ")}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Lokasi</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Luas (m²)</label>
              <input
                type="number"
                value={form.areaSqm}
                onChange={(e) => setForm((f) => ({ ...f, areaSqm: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tahun</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none resize-y"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Cover Image</h2>

          {form.coverImage && (
            <div className="relative w-48 h-32 rounded-lg overflow-hidden">
              <Image src={form.coverImage} alt="Cover" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
              >
                ×
              </button>
            </div>
          )}

          <div className="relative">
            {uploadingCover ? (
              <div className="flex items-center gap-3 py-2">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-200" />
                    <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray={`${(uploadCoverProgress / 100) * 106.8} 106.8`} className="text-bekon-gold transition-all duration-300" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-bekon-gold">{uploadCoverProgress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Mengupload cover...</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 min-w-[120px]">
                    <div className="bg-bekon-gold h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadCoverProgress}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="text-sm" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Gambar Gallery</h2>

          <div className="grid grid-cols-5 gap-3">
            {form.images.map((url, i) => (
              <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image src={url} alt="" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="relative">
            {uploadingImages ? (
              <div className="flex items-center gap-3 py-2">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-200" />
                    <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray={`${(uploadImagesProgress / 100) * 106.8} 106.8`} className="text-bekon-gold transition-all duration-300" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-bekon-gold">{uploadImagesProgress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Mengupload gambar...</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 min-w-[120px]">
                    <div className="bg-bekon-gold h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadImagesProgress}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <input type="file" accept="image/*" multiple onChange={handleImagesUpload} className="text-sm" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pengaturan</h2>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="rounded"
              />
              Featured
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                className="rounded"
              />
              Published
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || uploadingCover || uploadingImages}
            className="px-6 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
