"use client"
import { useState } from "react"
import { ArrowLeft, ArrowRight, PenLine, RotateCcw } from "lucide-react"
import { ShimmerRows } from "./primitives"

export function StepIdeas({
  ideas,
  loading,
  onRegenerate,
  onBack,
  onChoose,
}: {
  ideas: string[]
  loading: boolean
  onRegenerate: () => void
  onBack: () => void
  onChoose: (idea: string) => void
}) {
  const [ownIdea, setOwnIdea] = useState("")

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-semibold text-gray-900">Pilih Ide Konten</h2>
        <p className="text-xs text-gray-400 mt-0.5">Pilih salah satu, atau tulis ide sendiri di bawah.</p>
      </div>

      {loading ? (
        <ShimmerRows count={5} text="AI sedang meracik ide konten..." />
      ) : ideas.length > 0 ? (
        <div className="space-y-2">
          {ideas.map((idea, i) => (
            <button
              key={i}
              onClick={() => onChoose(idea)}
              className="group w-full text-left px-4 py-3.5 border border-gray-200 rounded-xl text-sm hover:border-bekon-gold hover:bg-bekon-gold/5 hover:shadow-sm transition-all flex items-center justify-between gap-3"
            >
              <span className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-bekon-gold group-hover:text-white transition-colors">
                  {i + 1}
                </span>
                {idea}
              </span>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-bekon-gold shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-500">Belum ada ide. Coba generate ulang.</p>
        </div>
      )}

      {/* Sebelumnya tidak ada jalan keluar kalau semua ide AI kurang cocok. */}
      <div className="border-t border-gray-100 pt-4">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
          <PenLine size={13} /> Atau tulis ide sendiri
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={ownIdea}
            onChange={(e) => setOwnIdea(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && ownIdea.trim().length >= 3) onChoose(ownIdea.trim()) }}
            placeholder="Tulis ide konten Anda sendiri..."
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
          />
          <button
            onClick={() => onChoose(ownIdea.trim())}
            disabled={ownIdea.trim().length < 3}
            className="px-4 py-2.5 bg-bekon-gold text-white rounded-xl text-sm font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-40"
          >
            Pakai
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRegenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RotateCcw size={14} /> Generate Ulang
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={14} /> Kembali
        </button>
      </div>
    </div>
  )
}
