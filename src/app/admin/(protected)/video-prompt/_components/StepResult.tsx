"use client"
import { ArrowLeft, RotateCcw, Copy, Clock, Film, Ratio } from "lucide-react"
import { toast } from "sonner"
import type { VideoPromptResult } from "@/lib/video-prompt/schema"
import { PartCard } from "./PartCard"
import { FlowGuide } from "./FlowGuide"
import { AssetLocker } from "./AssetLocker"

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[11px] text-white/60 leading-none mb-1">{label}</p>
        <p className="text-sm font-semibold leading-none">{value}</p>
      </div>
    </div>
  )
}

export function StepResult({
  data,
  doneParts,
  onTogglePart,
  onBack,
  onReset,
}: {
  data: VideoPromptResult | null
  doneParts: number[]
  onTogglePart: (index: number) => void
  onBack: () => void
  onReset: () => void
}) {
  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
        <p className="text-sm text-gray-500">Hasil tidak bisa dibaca. Coba generate ulang.</p>
        <button
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={14} /> Buat Baru
        </button>
      </div>
    )
  }

  const { project, parts, subjects } = data
  const doneCount = doneParts.length
  const progress = parts.length ? Math.round((doneCount / parts.length) * 100) : 0

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-bekon-near-black to-gray-800 text-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">{project.title}</h2>
            <p className="text-white/50 text-xs mt-0.5">
              Salin tiap part ke Google Flow satu per satu, lalu gabungkan hasilnya di editor.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(data, null, 2))
                toast.success("Seluruh rencana disalin")
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors"
            >
              <Copy size={13} /> Salin Semua
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors"
            >
              <ArrowLeft size={13} /> Ubah Parameter
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors"
            >
              <RotateCcw size={13} /> Buat Baru
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/10">
          <Stat icon={Clock} label="Total durasi" value={`${project.totalDurationSec} detik`} />
          <Stat icon={Film} label="Generate di Flow" value={`${parts.length}× klip`} />
          <Stat icon={Ratio} label="Format" value={project.aspectRatio} />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-white/60">Progres produksi</span>
            <span className="font-semibold">{doneCount}/{parts.length} klip selesai</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-bekon-gold to-yellow-300 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <AssetLocker subjects={subjects} parts={parts} />

      <FlowGuide />

      <div className="space-y-3">
        {parts.map((part) => (
          <PartCard
            key={part.index}
            part={part}
            subjects={subjects}
            done={doneParts.includes(part.index)}
            onToggleDone={() => onTogglePart(part.index)}
          />
        ))}
      </div>
    </div>
  )
}
