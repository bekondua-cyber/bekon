"use client"
import { useState, useRef } from "react"
import Image from "next/image"
import { toast } from "sonner"

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  accept?: string
  maxSizeMB?: number
  onUploadProgress?: (progress: number) => void
}

export function ImageUploader({
  value,
  onChange,
  accept = "image/*",
  maxSizeMB = 5,
  onUploadProgress,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
      setUploadProgress(0)

      if (onUploadProgress) onUploadProgress(0)

      progressIntervalRef.current = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
            return 90
          }
          const next = prev + Math.random() * 15
          return Math.min(next, 90)
        })
      }, 200)

      const url = await uploadImage(file)

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      setUploadProgress(100)

      onChange(url)

      if (onUploadProgress) onUploadProgress(100)

      setTimeout(() => {
        setUploadProgress(0)
        setUploading(false)
        if (onUploadProgress) onUploadProgress(0)
      }, 800)

    } catch (err) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      setUploadProgress(0)
      setUploading(false)
      toast.dismiss()
      toast.error(err instanceof Error ? err.message : "Gagal upload gambar")
      if (onUploadProgress) onUploadProgress(0)
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
        } ${uploading ? "pointer-events-none" : ""}`}
      >
        {value ? (
          <div className="relative w-full aspect-video max-h-48 mx-auto rounded-lg overflow-hidden">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
            {!uploading && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange("") }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="Hapus gambar"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <div className="py-8">
            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(uploadProgress / 100) * 175.9} 175.9`}
                      className="text-bekon-gold transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold text-bekon-gold">
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm text-gray-600 font-medium">
                    Mengupload...
                  </span>
                  <span className="text-xs text-gray-400">
                    Mohon tunggu
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-400"
                >
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
          disabled={uploading}
        />
      </div>

      {uploading && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-bekon-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Upload progress: {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  )
}
