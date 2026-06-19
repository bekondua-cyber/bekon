"use client"
import { useState, useRef } from "react"
import Image from "next/image"
import { toast } from "sonner"

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  accept?: string
  maxSizeMB?: number
}

export function ImageUploader({
  value,
  onChange,
  accept = "image/*",
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.detail || json.error || "Upload gagal")
    }
    if (!json.data?.url) {
      throw new Error("Response tidak mengandung URL gambar")
    }
    return json.data.url
  }

  async function handleFile(file: File) {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File terlalu besar. Maksimal ${maxSizeMB}MB`)
      return
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan")
      return
    }
    try {
      setUploading(true)
      toast.loading("Mengupload gambar...")
      const url = await uploadImage(file)
      onChange(url)
      toast.dismiss()
      toast.success("Gambar berhasil diupload")
    } catch (err) {
      toast.dismiss()
      toast.error(err instanceof Error ? err.message : "Gagal upload gambar")
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-bekon-gold bg-bekon-gold/5"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        {value ? (
          <div className="relative w-full aspect-video max-h-48 mx-auto rounded-lg overflow-hidden">
            <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange("") }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="Hapus gambar"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="py-8">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-bekon-gold border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Mengupload...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-sm text-gray-500">
                  Klik atau drag & drop gambar di sini
                </span>
                <span className="text-xs text-gray-400">
                  Maksimal {maxSizeMB}MB, Rekomendasi: 1920x1080px
                </span>
              </div>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          aria-label="Pilih gambar"
        />
      </div>
    </div>
  )
}
