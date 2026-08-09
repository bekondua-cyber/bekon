"use client"
import { Download, ImageOff, Images } from "lucide-react"
import type { CompiledPart, Subject } from "@/lib/video-prompt/schema"
import { toDownloadUrl } from "@/lib/cloudinary-url"

/**
 * Daftar semua gambar referensi beserta part yang memakainya. Panel ini selalu
 * tampil supaya aset tidak pernah tersembunyi — termasuk saat AI lupa
 * mencantumkan aset yang sudah dipilih admin ke `ingredients` part manapun.
 */
export function AssetLocker({ subjects, parts }: { subjects: Subject[]; parts: CompiledPart[] }) {
  const withImages = subjects.filter((s) => s.referenceImages.length > 0)

  if (withImages.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1">
          <ImageOff size={16} className="text-gray-400" /> Tanpa gambar referensi
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Video ini digenerate tanpa karakter atau bahan referensi, jadi tidak ada berkas yang perlu
          diupload ke Flow — cukup tempel prompt-nya. Kalau ingin memakai foto referensi, klik{" "}
          <span className="font-medium">Ubah Parameter</span> lalu buka bagian{" "}
          <span className="font-medium">Talent &amp; Bahan Referensi</span>.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1">
        <Images size={16} className="text-bekon-gold" /> Gambar referensi
      </p>
      <p className="text-xs text-gray-500 mb-3">
        Unduh berkasnya, lalu upload ke kolom Ingredients di Flow saat menggenerate part terkait.
      </p>

      <div className="flex flex-wrap gap-3">
        {withImages.map((s) => {
          const usedIn = parts.filter((p) => p.ingredients.includes(s.id)).map((p) => p.index)
          return s.referenceImages.map((img, i) => (
            <div key={`${s.id}-${i}`} className="w-32">
              <a
                href={toDownloadUrl(img, s.role)}
                download
                className="group block relative rounded-xl overflow-hidden border-2 border-gray-200 hover:border-bekon-gold transition-colors"
                title={`Unduh ${s.role}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={s.role} className="w-full aspect-square object-cover" />
                <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Download size={20} className="text-white" />
                </span>
              </a>
              <p className="text-xs font-medium text-gray-700 truncate mt-1.5">{s.role}</p>
              <p className="text-[11px] text-gray-400">
                {usedIn.length > 0 ? `Dipakai di part ${usedIn.join(", ")}` : "Tidak dipakai di part manapun"}
              </p>
            </div>
          ))
        })}
      </div>
    </div>
  )
}
