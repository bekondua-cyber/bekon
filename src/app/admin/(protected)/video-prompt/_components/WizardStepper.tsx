"use client"
import { Check, Sparkles, Wand2, Clapperboard, CheckCircle2 } from "lucide-react"
import type { StepNumber } from "./types"

const STEPS = [
  { label: "Konsep", icon: Sparkles },
  { label: "Ide", icon: Wand2 },
  { label: "Rancang", icon: Clapperboard },
  { label: "Hasil", icon: CheckCircle2 },
]

export function WizardStepper({
  current,
  maxReached,
  onJump,
}: {
  current: StepNumber
  maxReached: StepNumber
  onJump: (n: StepNumber) => void
}) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const stepNum = (i + 1) as StepNumber
        const isDone = stepNum < current
        const isActive = stepNum === current
        const isClickable = stepNum <= maxReached
        const Icon = s.icon
        return (
          <div key={s.label} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => onJump(stepNum)}
              disabled={!isClickable}
              className={`flex flex-col items-center gap-1.5 ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone
                    ? "bg-bekon-gold border-bekon-gold text-white"
                    : isActive
                    ? "border-bekon-gold text-bekon-gold bg-white ring-4 ring-bekon-gold/15"
                    : "border-gray-200 text-gray-300 bg-white"
                }`}
              >
                {isDone ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <span
                className={`text-[11px] font-medium whitespace-nowrap ${
                  isActive ? "text-bekon-gold" : isDone ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${stepNum < current ? "bg-bekon-gold" : "bg-gray-200"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
