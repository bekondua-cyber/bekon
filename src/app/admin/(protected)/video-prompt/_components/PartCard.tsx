"use client"
import { useState } from "react"
import { Check, Braces, FileText, Paperclip, Music, Type as TypeIcon } from "lucide-react"
import { toast } from "sonner"
import type { CompiledPart, Subject } from "@/lib/video-prompt/schema"
import { BeatTimeline } from "./BeatTimeline"

const CONTINUITY_BADGE: Record<string, { label: string; className: string }> = {
  new: { label: "Klip baru", className: "bg-blue-50 text-blue-600" },
  extend: { label: "Lanjutan (Extend)", className: "bg-purple-50 text-purple-600" },
  firstLastFrame: { label: "Transisi frame awal→akhir", className: "bg-amber-50 text-amber-700" },
}

export function PartCard({
  part,
  subjects,
  done,
  onToggleDone,
}: {
  part: CompiledPart
  subjects: Subject[]
  done: boolean
  onToggleDone: () => void
}) {
  const [showPrompt, setShowPrompt] = useState(true)
  const badge = CONTINUITY_BADGE[part.continuity] || CONTINUITY_BADGE.new

  function copy(text: string, what: string) {
    navigator.clipboard.writeText(text)
    toast.success(`${what} part ${part.index} disalin`)
  }

  const attached = part.ingredients
    .map((id) => subjects.find((s) => s.id === id))
    .filter((s): s is Subject => Boolean(s))

  return (
    <div
      className={`bg-white rounded-2xl border-2 transition-all ${
        done ? "border-green-200 bg-green-50/30" : "border-gray-200 hover:shadow-md"
      }`}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={onToggleDone}
              title={done ? "Tandai belum digenerate" : "Tandai sudah digenerate di Flow"}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                done ? "bg-green-500 text-white" : "bg-bekon-gold/10 text-bekon-gold hover:bg-bekon-gold/20"
              }`}
            >
              {done ? <Check size={14} /> : part.index}
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{part.label}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{part.durationSec} detik</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.className}`}>
                  {badge.label}
                </span>
                <span className="text-xs text-gray-400">{part.shot.movement}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => copy(part.naturalPrompt, "Prompt natural")}
              className="flex items-center gap-1.5 px-3 py-2 bg-bekon-gold text-white rounded-lg text-xs font-medium hover:bg-bekon-gold/90 transition-colors"
            >
              <FileText size={13} /> Copy Natural
            </button>
            <button
              onClick={() => copy(JSON.stringify(part.jsonPrompt, null, 2), "Prompt JSON")}
              className="flex items-center gap-1.5 px-3 py-2 border border-bekon-gold text-bekon-gold rounded-lg text-xs font-medium hover:bg-bekon-gold/10 transition-colors"
            >
              <Braces size={13} /> Copy JSON
            </button>
          </div>
        </div>

        <BeatTimeline timeline={part.timeline} />

        {attached.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 p-2.5 bg-bekon-gold/5 border border-bekon-gold/20 rounded-lg">
            <span className="flex items-center gap-1.5 text-xs font-medium text-bekon-gold">
              <Paperclip size={13} /> Upload di Flow:
            </span>
            {attached.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-white rounded-md text-xs text-gray-700 border border-gray-200">
                {s.referenceImages[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.referenceImages[0]} alt="" className="w-4 h-4 rounded-full object-cover" />
                )}
                {s.role}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowPrompt((v) => !v)}
          className="mt-4 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          {showPrompt ? "Sembunyikan prompt" : "Lihat prompt"}
        </button>

        {showPrompt && (
          <pre className="mt-2 bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-56 overflow-y-auto">
            {part.naturalPrompt}
          </pre>
        )}

        {(part.editorNotes.textOverlay || part.editorNotes.musicCue) && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
            <p className="text-[11px] font-medium text-gray-400">Catatan editing — bukan untuk Flow</p>
            {part.editorNotes.textOverlay && (
              <p className="flex gap-2 text-xs text-gray-600">
                <TypeIcon size={13} className="text-gray-400 shrink-0 mt-0.5" />
                {part.editorNotes.textOverlay}
              </p>
            )}
            {part.editorNotes.musicCue && (
              <p className="flex gap-2 text-xs text-gray-600">
                <Music size={13} className="text-gray-400 shrink-0 mt-0.5" />
                {part.editorNotes.musicCue}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
