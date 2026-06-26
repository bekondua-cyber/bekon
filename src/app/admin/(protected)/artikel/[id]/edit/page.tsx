"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { RichTextEditor } from "@/components/admin/RichTextEditor"
import { uploadFile } from "@/lib/upload-client"

interface ArticleForm {
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  thumbnail: string
  isPublished: boolean
  publishedAt: string | null
}

export default function AdminArtikelEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [thumbProgress, setThumbProgress] = useState(0)
  const [form, setForm] = useState<ArticleForm>({
    title: "",
    slug: "",
    category: "",
    excerpt: "",
    content: "",
    thumbnail: "",
    isPublished: false,
    publishedAt: null,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/articles?id=${id}`, { credentials: "include" })
        const json = await res.json()
        const d = json.data
        if (d) {
          setForm({
            title: d.title || "",
            slug: d.slug || "",
            category: d.category || "",
            excerpt: d.excerpt || "",
            content: d.content || "",
            thumbnail: d.thumbnail || "",
            isPublished: d.isPublished || false,
            publishedAt: d.publishedAt || null,
          })
        }
      } catch {
        toast.error("Gagal memuat data artikel")
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

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingThumb(true)
    setThumbProgress(0)
    const interval = setInterval(() => {
      setThumbProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90 }
        return Math.min(prev + Math.random() * 15, 90)
      })
    }, 200)
    try {
      const media = await uploadFile(file)
      clearInterval(interval)
      setThumbProgress(100)
      setForm((f) => ({ ...f, thumbnail: media.url }))
      setTimeout(() => { setUploadingThumb(false); setThumbProgress(0) }, 500)
    } catch (err) {
      clearInterval(interval)
      setUploadingThumb(false)
      setThumbProgress(0)
      toast.error(err instanceof Error ? err.message : "Gagal upload thumbnail")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        id,
        ...form,
        publishedAt: form.isPublished
          ? form.publishedAt || new Date().toISOString()
          : null,
      }
      const res = await fetch("/api/admin/articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })

      if (res.ok) {
        toast.success("Artikel berhasil diupdate")
        router.push("/admin/artikel")
      } else {
        const err = await res.json()
        toast.error(err.error || "Gagal mengupdate artikel")
      }
    } catch {
      toast.error("Gagal mengupdate artikel")
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
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Artikel</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Judul *</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
            >
              <option value="">Pilih kategori</option>
              <option value="eksterior">Eksterior</option>
              <option value="interior">Interior</option>
              <option value="umum">Umum</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Konten</label>
            <RichTextEditor
              value={form.content}
              onChange={(content) => setForm((f) => ({ ...f, content }))}
              placeholder="Edit konten artikel di sini..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Thumbnail</label>
            {form.thumbnail && (
              <div className="relative w-48 h-32 rounded-lg overflow-hidden mb-2">
                <Image src={form.thumbnail} alt="" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, thumbnail: "" }))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                >
                  ×
                </button>
              </div>
            )}
            {uploadingThumb ? (
              <div className="flex items-center gap-3 py-2">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-200" />
                    <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray={`${(thumbProgress / 100) * 106.8} 106.8`} className="text-bekon-gold transition-all duration-300" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-bekon-gold">{thumbProgress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Mengupload thumbnail...</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 min-w-[120px]">
                    <div className="bg-bekon-gold h-1.5 rounded-full transition-all duration-300" style={{ width: `${thumbProgress}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="text-sm" />
            )}
          </div>

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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
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
