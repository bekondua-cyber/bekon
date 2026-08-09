"use client"
import { useState } from "react"
import { ArrowLeft, ChevronDown, Clapperboard, Users } from "lucide-react"
import {
  ASPECT_RATIO_OPTIONS, DURATION_OPTIONS, PLATFORM_OPTIONS, TONE_OPTIONS,
  type VideoCategory,
} from "@/lib/video-categories"
import { ChipButton, FieldLabel, LoadingSpinner } from "./primitives"
import { CharacterPicker, MaterialPicker } from "./AssetPicker"
import type { CharacterOption, MaterialOption } from "./types"

const ASPECT_SHAPES: Record<string, { w: number; h: number }> = {
  "9:16": { w: 18, h: 32 },
  "16:9": { w: 32, h: 18 },
}

/** Teks pembuka bagian talent, mengikuti `usesCharacter` milik kategori. */
const TALENT_COPY: Record<VideoCategory["usesCharacter"], { hint: string; badge?: string }> = {
  rare: { hint: "Video jenis ini biasanya tanpa talent — fokus ke bangunan dan aktivitas proyek." },
  optional: { hint: "Boleh pakai talent, boleh tidak. Terserah konsep Anda." },
  recommended: { hint: "Video jenis ini jauh lebih kuat kalau ada talent.", badge: "Disarankan" },
}

export function StepDesign({
  categoryInfo, selectedIdea,
  aspectRatio, setAspectRatio,
  durationPerScene, setDurationPerScene,
  sceneCount, setSceneCount,
  platform, setPlatform,
  structure, setStructure,
  style, setStyle,
  tone, setTone,
  estimatedTotalSec,
  characters, setCharacters, characterId, toggleCharacter,
  materials, setMaterials, materialIds, toggleMaterial,
  generating, onGenerate, onBack,
}: {
  categoryInfo: VideoCategory
  selectedIdea: string
  aspectRatio: string
  setAspectRatio: (v: string) => void
  durationPerScene: number
  setDurationPerScene: (v: number) => void
  sceneCount: number
  setSceneCount: (v: number) => void
  platform: string
  setPlatform: (v: string) => void
  structure: string
  setStructure: (v: string) => void
  style: string
  setStyle: (v: string) => void
  tone: string
  setTone: (v: string) => void
  estimatedTotalSec: number
  characters: CharacterOption[]
  setCharacters: React.Dispatch<React.SetStateAction<CharacterOption[]>>
  characterId: string
  toggleCharacter: (id: string) => void
  materials: MaterialOption[]
  setMaterials: React.Dispatch<React.SetStateAction<MaterialOption[]>>
  materialIds: string[]
  toggleMaterial: (id: string) => void
  generating: boolean
  onGenerate: () => void
  onBack: () => void
}) {
  const talent = TALENT_COPY[categoryInfo.usesCharacter]
  // Terbuka otomatis hanya kalau kategori memang menyarankan talent.
  const [assetsOpen, setAssetsOpen] = useState(categoryInfo.usesCharacter === "recommended")

  const selectedCount = (characterId ? 1 : 0) + materialIds.length
  const libraryCount = characters.length + materials.length

  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-semibold text-gray-900 mb-2">Rancang Videonya</h2>
        <div className="bg-bekon-gold/5 border border-bekon-gold/20 rounded-xl p-3 text-sm text-gray-700">
          {selectedIdea}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <FieldLabel hint="Veo hanya mendukung dua rasio ini.">Format</FieldLabel>
          <div className="flex gap-3">
            {ASPECT_RATIO_OPTIONS.map((r) => {
              const shape = ASPECT_SHAPES[r]
              const isSelected = aspectRatio === r
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAspectRatio(r)}
                  className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
                    isSelected ? "border-bekon-gold bg-bekon-gold/5" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`rounded-sm border-2 ${isSelected ? "border-bekon-gold bg-bekon-gold/20" : "border-gray-300 bg-gray-100"}`}
                    style={{ width: shape.w, height: shape.h }}
                  />
                  <span className={`text-xs font-medium ${isSelected ? "text-bekon-gold" : "text-gray-500"}`}>{r}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <FieldLabel hint="Durasi satu kali generate di Flow.">Durasi per part</FieldLabel>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurationPerScene(d)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                  durationPerScene === d
                    ? "border-bekon-gold bg-bekon-gold text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {d} detik
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <FieldLabel>Jumlah part</FieldLabel>
        <div className="flex items-center gap-4">
          <input
            type="range" min={1} max={10} value={sceneCount}
            onChange={(e) => setSceneCount(Number(e.target.value))}
            className="flex-1 accent-bekon-gold"
          />
          <span className="w-8 text-center text-sm font-semibold text-gray-900">{sceneCount}</span>
        </div>
        {/* Estimasi hidup: sebelumnya user tidak tahu akan dapat berapa detik. */}
        <p className="mt-2 text-xs text-gray-500">
          ≈ <span className="font-semibold text-bekon-gold">{estimatedTotalSec} detik</span> total ·{" "}
          {sceneCount}× generate di Flow
        </p>
      </div>

      {/* Talent & bahan: pindah ke sini dari gerbang, dan hanya menonjol
          kalau kategori memang membutuhkannya. */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setAssetsOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2.5 text-left">
            <Users size={16} className="text-gray-400 shrink-0" />
            <span>
              <span className="text-sm font-semibold text-gray-800">Talent &amp; Bahan Referensi</span>
              <span className="block text-xs text-gray-400">
                {talent.hint}
                {/* Tanpa ini, pustaka aset tidak terlihat sama sekali saat panel tertutup. */}
                {!assetsOpen && libraryCount > 0 && selectedCount === 0 && (
                  <span className="text-gray-500"> · {libraryCount} aset tersedia di pustaka</span>
                )}
              </span>
            </span>
          </span>
          <span className="flex items-center gap-2 shrink-0">
            {talent.badge && (
              <span className="px-2 py-0.5 rounded-full bg-bekon-gold/10 text-bekon-gold text-[11px] font-medium">
                {talent.badge}
              </span>
            )}
            {selectedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-medium">
                {selectedCount} dipilih
              </span>
            )}
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${assetsOpen ? "rotate-180" : ""}`} />
          </span>
        </button>

        {assetsOpen && (
          <div className="border-t border-gray-100 p-4 space-y-5 bg-gray-50/50">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Karakter</p>
              <CharacterPicker
                characters={characters}
                characterId={characterId}
                onToggle={toggleCharacter}
                onCreated={(item) => {
                  setCharacters((prev) => [item, ...prev])
                  toggleCharacter(item.id)
                }}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Bahan referensi</p>
              <MaterialPicker
                materials={materials}
                materialIds={materialIds}
                onToggle={toggleMaterial}
                onCreated={(item) => {
                  setMaterials((prev) => [item, ...prev])
                  toggleMaterial(item.id)
                }}
              />
            </div>
          </div>
        )}
      </div>

      <details className="group">
        <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-900 list-none flex items-center gap-1.5">
          <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
          Pengaturan lanjutan
        </summary>
        <div className="mt-4 space-y-5 pl-5">
          <div>
            <FieldLabel>Struktur</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {categoryInfo.structures.map((s) => (
                <ChipButton key={s} label={s} active={structure === s} onClick={() => setStructure(s)} />
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Gaya visual</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {categoryInfo.styles.map((s) => (
                <ChipButton key={s} label={s} active={style === s} onClick={() => setStyle(s)} />
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Tone</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((t) => (
                <ChipButton key={t} label={t} active={tone === t} onClick={() => setTone(t)} />
              ))}
            </div>
          </div>
          <div className="max-w-xs">
            <FieldLabel>Platform</FieldLabel>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
            >
              {PLATFORM_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </details>

      <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-white/90 backdrop-blur border-t border-gray-100 flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={14} /> Kembali
        </button>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-bekon-gold to-bekon-gold-dark text-white rounded-xl text-sm font-semibold hover:opacity-95 shadow-sm transition-opacity disabled:opacity-50"
        >
          {generating ? <><LoadingSpinner /> Menyusun prompt...</> : <><Clapperboard size={16} /> Generate Prompt</>}
        </button>
      </div>
    </div>
  )
}
