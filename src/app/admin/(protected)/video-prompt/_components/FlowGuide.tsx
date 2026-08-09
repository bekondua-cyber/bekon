"use client"
import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

const STEPS = [
  {
    title: "Buka Google Flow, buat project baru",
    detail: "Pilih mode Text to Video. Kalau part-nya memakai gambar referensi, pilih Ingredients to Video.",
  },
  {
    title: "Unduh gambar referensi part ini",
    detail:
      "Klik chip gambar di kartu part untuk mengunduhnya, lalu upload berkas itu ke kolom Ingredients di Flow. Maksimal 3 gambar per generate.",
  },
  {
    title: "Tempel prompt",
    detail:
      "Copy Natural untuk prompt prosa (paling cocok untuk kebanyakan klip). Copy JSON kalau ingin kontrol beat yang lebih ketat. Cukup pakai salah satu, jangan keduanya.",
  },
  {
    title: "Samakan format & durasi",
    detail: "Set aspect ratio dan durasi di Flow sama persis dengan yang tertera di kartu part.",
  },
  {
    title: "Generate, lalu tandai selesai",
    detail:
      "Setelah klip jadi, klik nomor part di kartu untuk menandainya selesai. Ulangi sampai semua part beres, lalu gabungkan klipnya di CapCut dan tambahkan teks overlay dari catatan editing.",
  },
]

export function FlowGuide() {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <HelpCircle size={16} className="text-bekon-gold shrink-0" />
          <span className="text-sm font-semibold text-gray-800">Cara memakai hasil ini di Google Flow</span>
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ol className="border-t border-gray-100 px-5 py-4 space-y-3.5">
          {STEPS.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-bekon-gold/10 text-bekon-gold text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
