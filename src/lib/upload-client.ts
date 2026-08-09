"use client"

export interface UploadedMedia {
  id: string
  filename: string
  url: string
  publicId: string
  sizeBytes: number | null
  width: number | null
  height: number | null
  createdAt: string
}

// Diekspor ulang supaya pemanggil lama tidak perlu diubah; sumbernya kini
// modul netral yang juga bisa dipakai route server.
export { MAX_UPLOAD_SIZE_MB } from "./upload-limits"
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_SIZE_MB } from "./upload-limits"

export async function uploadFile(file: File): Promise<UploadedMedia> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File terlalu besar. Maksimal ${MAX_UPLOAD_SIZE_MB}MB.`)
  }

  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  })

  if (res.status === 413) {
    throw new Error(`File terlalu besar untuk server. Coba kompres atau gunakan file di bawah ${MAX_UPLOAD_SIZE_MB}MB.`)
  }

  const contentType = res.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    throw new Error(`Upload gagal (server merespons status ${res.status})`)
  }

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.detail || json.error || "Upload gagal")
  }
  if (!json.data?.url) {
    throw new Error("Response tidak mengandung URL gambar")
  }

  return json.data as UploadedMedia
}
