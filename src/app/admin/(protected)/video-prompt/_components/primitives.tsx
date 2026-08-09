"use client"
import { Grid3x3, Upload, type LucideIcon } from "lucide-react"

export function ChipButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active ? "bg-bekon-gold border-bekon-gold text-white" : "border-gray-200 text-gray-600 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  )
}

export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <label className="block text-sm font-semibold text-gray-700">{children}</label>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )
}

export function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
      <div>
        <span className="text-gray-400 text-xs">{label}: </span>
        <span className="text-gray-700">{value}</span>
      </div>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

/** Skeleton shimmer, menggantikan teks statis saat AI bekerja. */
export function ShimmerRows({ count = 4, text }: { count?: number; text?: string }) {
  return (
    <div className="space-y-3">
      {text && (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <LoadingSpinner /> {text}
        </p>
      )}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-pulse"
        />
      ))}
    </div>
  )
}

export function SourceTabs({
  tab,
  setTab,
}: {
  tab: "library" | "upload"
  setTab: (t: "library" | "upload") => void
}) {
  return (
    <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1 w-fit">
      <button
        type="button"
        onClick={() => setTab("library")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          tab === "library" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
        }`}
      >
        <Grid3x3 size={13} /> Pilih dari Library
      </button>
      <button
        type="button"
        onClick={() => setTab("upload")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          tab === "upload" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
        }`}
      >
        <Upload size={13} /> Upload Baru
      </button>
    </div>
  )
}
