"use client"
import { useMemo, useState } from "react"
import Image from "next/image"
import { GripVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { moveItem } from "@/lib/reorder"

/**
 * Key stabil per gambar supaya React tidak me-remount <Image> saat urutan berubah
 * (index sebagai key bikin thumbnail berkedip tiap drag). URL yang kembar
 * dibedakan dengan suffix.
 */
export function buildImageKeys(images: string[]): string[] {
  const seen = new Map<string, number>()
  return images.map((url) => {
    const n = seen.get(url) ?? 0
    seen.set(url, n + 1)
    return n === 0 ? url : `${url}#${n}`
  })
}

interface SortableImageGridProps {
  images: string[]
  onChange: (images: string[]) => void
  disabled?: boolean
}

export function SortableImageGrid({ images, onChange, disabled = false }: SortableImageGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const keys = useMemo(() => buildImageKeys(images), [images])

  if (images.length === 0) return null

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    onChange(moveItem(images, dragIndex, index))
    setDragIndex(index)
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return
    onChange(moveItem(images, from, to))
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {!disabled && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <GripVertical className="w-3 h-3 flex-shrink-0" />
          Drag gambar untuk mengatur urutan. Gambar nomor 1 tampil paling awal di
          halaman project. Urutan tersimpan saat klik Simpan.
        </p>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((url, i) => (
          <div
            key={keys[i]}
            draggable={!disabled}
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={() => setDragIndex(null)}
            onDragEnd={() => setDragIndex(null)}
            className={`group relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 transition-all ${
              dragIndex === i
                ? "border-bekon-gold opacity-50 scale-95"
                : "border-transparent hover:border-bekon-gold/40"
            } ${disabled ? "" : "cursor-grab active:cursor-grabbing"}`}
          >
            <Image
              src={url}
              alt={`Gambar gallery ${i + 1}`}
              fill
              draggable={false}
              className="object-cover select-none"
              unoptimized
            />

            <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-semibold rounded px-1.5 py-0.5 leading-none">
              {i + 1}
            </span>

            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Hapus gambar ${i + 1}`}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>

            {!disabled && (
              <div className="absolute bottom-1 left-1 right-1 flex justify-between md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Pindahkan gambar ${i + 1} ke posisi sebelumnya`}
                  className="bg-black/60 text-white rounded w-5 h-5 flex items-center justify-center hover:bg-black/80 transition-colors disabled:opacity-0 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === images.length - 1}
                  aria-label={`Pindahkan gambar ${i + 1} ke posisi berikutnya`}
                  className="bg-black/60 text-white rounded w-5 h-5 flex items-center justify-center hover:bg-black/80 transition-colors disabled:opacity-0 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
