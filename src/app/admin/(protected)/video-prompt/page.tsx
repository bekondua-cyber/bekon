"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Building2, Mic2, RefreshCw, Home, MessageCircleHeart, Users,
  Sparkles, Wand2, Clapperboard, CheckCircle2, Check, Copy,
  Camera, Mic, Type as TypeIcon, ArrowRight, ArrowLeft, RotateCcw,
} from "lucide-react"
import { VIDEO_CATEGORIES, DURATION_OPTIONS, ASPECT_RATIO_OPTIONS, TONE_OPTIONS, PLATFORM_OPTIONS, getCategory } from "@/lib/video-categories"
import { VideoPromptTabs } from "@/components/admin/VideoPromptTabs"

const CATEGORY_ICONS: Record<string, typeof Building2> = {
  Building2, Mic2, RefreshCw, Home, MessageCircleHeart, Users,
}

const ASPECT_SHAPES: Record<string, { w: number; h: number }> = {
  "9:16": { w: 18, h: 32 },
  "16:9": { w: 32, h: 18 },
  "1:1": { w: 26, h: 26 },
  "4:5": { w: 22, h: 28 },
}

const STEPS = [
  { label: "Jenis & Karakter", icon: Sparkles },
  { label: "Ide Konten", icon: Wand2 },
  { label: "Parameter", icon: Clapperboard },
  { label: "Hasil", icon: CheckCircle2 },
]

interface PortfolioOption { id: string; title: string }
interface CharacterOption { id: string; name: string; gender: string | null; age: number | null; photoUrl: string }
interface MaterialOption { id: string; label: string; photoUrl: string }
interface Scene { visual: string; cameraMovement: string; voiceover: string; textOverlay: string }
interface GeneratedResult { id: string; title: string; resultJson: string }

export default function VideoPromptPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  const [category, setCategory] = useState(VIDEO_CATEGORIES[0].id)
  const categoryInfo = getCategory(category)

  const [characters, setCharacters] = useState<CharacterOption[]>([])
  const [materials, setMaterials] = useState<MaterialOption[]>([])
  const [portfolios, setPortfolios] = useState<PortfolioOption[]>([])
  const [characterId, setCharacterId] = useState<string>("")
  const [materialIds, setMaterialIds] = useState<string[]>([])
  const [portfolioId, setPortfolioId] = useState("")
  const [seedTopic, setSeedTopic] = useState("")

  const [ideas, setIdeas] = useState<string[]>([])
  const [selectedIdea, setSelectedIdea] = useState("")
  const [loadingIdeas, setLoadingIdeas] = useState(false)

  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIO_OPTIONS[0])
  const [sceneCount, setSceneCount] = useState(5)
  const [durationPerScene, setDurationPerScene] = useState(DURATION_OPTIONS[0])
  const [structure, setStructure] = useState(categoryInfo.structures[0])
  const [style, setStyle] = useState(categoryInfo.styles[0])
  const [tone, setTone] = useState(TONE_OPTIONS[0])
  const [platform, setPlatform] = useState(PLATFORM_OPTIONS[0])
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<GeneratedResult | null>(null)

  useEffect(() => {
    fetch("/api/admin/portfolio", { credentials: "include" }).then((r) => r.json()).then((j) => setPortfolios(j.data || [])).catch(() => {})
    fetch("/api/admin/video-characters", { credentials: "include" }).then((r) => r.json()).then((j) => setCharacters(j.data || [])).catch(() => {})
    fetch("/api/admin/video-materials", { credentials: "include" }).then((r) => r.json()).then((j) => setMaterials(j.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setStructure(categoryInfo.structures[0])
    setStyle(categoryInfo.styles[0])
  }, [category])

  function toggleMaterial(id: string) {
    setMaterialIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  async function handleGetIdeas() {
    setStep(2)
    setLoadingIdeas(true)
    try {
      const res = await fetch("/api/admin/video-prompt/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category, portfolioId: portfolioId || undefined, characterId: characterId || undefined, seedTopic: seedTopic || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || "Gagal generate ide")
        return
      }
      setIdeas(json.data)
    } catch {
      toast.error("Gagal generate ide")
    } finally {
      setLoadingIdeas(false)
    }
  }

  function handleApproveIdea(idea: string) {
    setSelectedIdea(idea)
    setStep(3)
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch("/api/admin/video-prompt/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category, idea: selectedIdea, aspectRatio, sceneCount, durationPerScene, structure, tone, platform, style,
          portfolioId: portfolioId || undefined, characterId: characterId || undefined, materialIds,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || "Gagal generate prompt")
        return
      }
      setResult(json.data)
      setStep(4)
      toast.success("Prompt video berhasil digenerate")
    } catch {
      toast.error("Gagal generate prompt")
    } finally {
      setGenerating(false)
    }
  }

  function handleCopyAll() {
    if (!result) return
    navigator.clipboard.writeText(result.resultJson)
    toast.success("Seluruh JSON disalin ke clipboard")
  }

  function handleCopyScene(scene: Scene, i: number) {
    navigator.clipboard.writeText(JSON.stringify(scene, null, 2))
    toast.success(`Scene ${i + 1} disalin`)
  }

  function resetAll() {
    setStep(1)
    setIdeas([])
    setSelectedIdea("")
    setResult(null)
    setCharacterId("")
    setMaterialIds([])
  }

  const scenes: Scene[] = result ? JSON.parse(result.resultJson).scenes : []
  const selectedCharacter = characters.find((c) => c.id === characterId)
  const selectedMaterials = materials.filter((m) => materialIds.includes(m.id))
  const CategoryIcon = CATEGORY_ICONS[categoryInfo.icon]

  return (
    <div>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-bekon-gold to-bekon-gold-dark flex items-center justify-center text-white shrink-0">
            <Clapperboard size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Video Prompt Generator</h1>
            <p className="text-gray-500 text-sm">Generate prompt JSON untuk AI video generator (Google Flow, dsb)</p>
          </div>
        </div>
      </div>

      <VideoPromptTabs active="/admin/video-prompt" />

      <Stepper current={step} />

      {step < 4 ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Pilih Jenis Video</label>
                  <div className="grid grid-cols-2 gap-3">
                    {VIDEO_CATEGORIES.map((c) => {
                      const Icon = CATEGORY_ICONS[c.icon]
                      const isSelected = category === c.id
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCategory(c.id)}
                          className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-bekon-gold bg-bekon-gold/5 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                            isSelected ? "bg-bekon-gold text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            <Icon size={18} />
                          </div>
                          <p className="font-semibold text-sm text-gray-900">{c.label}</p>
                          <p className="text-xs text-gray-500 mt-1 leading-snug">{c.description}</p>
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-bekon-gold flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {categoryInfo.usesCharacter !== "rare" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Karakter (opsional)</label>
                    {characters.length === 0 ? (
                      <p className="text-xs text-gray-400">
                        Belum ada karakter. <Link href="/admin/video-prompt/characters" className="text-bekon-gold hover:underline">Tambah karakter</Link>
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {characters.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCharacterId(characterId === c.id ? "" : c.id)}
                            className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                              characterId === c.id ? "border-bekon-gold" : "border-transparent hover:border-gray-200"
                            }`}
                          >
                            <div className="aspect-square bg-gray-100 relative">
                              <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" />
                              {characterId === c.id && (
                                <div className="absolute inset-0 bg-bekon-gold/25 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-bekon-gold flex items-center justify-center">
                                    <Check size={14} className="text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-600 truncate px-1 py-0.5 bg-white">{c.name}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {materials.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Bahan Referensi (opsional, bisa lebih dari satu)</label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {materials.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleMaterial(m.id)}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                            materialIds.includes(m.id) ? "border-bekon-gold" : "border-transparent hover:border-gray-200"
                          }`}
                        >
                          <div className="aspect-square bg-gray-100 relative">
                            <img src={m.photoUrl} alt={m.label} className="w-full h-full object-cover" />
                            {materialIds.includes(m.id) && (
                              <div className="absolute inset-0 bg-bekon-gold/25 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-bekon-gold flex items-center justify-center">
                                  <Check size={14} className="text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-600 truncate px-1 py-0.5 bg-white">{m.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Referensi Portfolio (opsional)</label>
                    <select
                      value={portfolioId}
                      onChange={(e) => setPortfolioId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
                    >
                      <option value="">Tidak ada</option>
                      {portfolios.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Topik/arahan (opsional)</label>
                    <input
                      type="text"
                      value={seedTopic}
                      onChange={(e) => setSeedTopic(e.target.value)}
                      placeholder="Contoh: tips renovasi dapur minimalis"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGetIdeas}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bekon-gold text-white rounded-xl text-sm font-semibold hover:bg-bekon-gold/90 transition-colors"
                >
                  <Wand2 size={16} /> Generate Ide Konten <ArrowRight size={16} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-gray-900">Pilih Ide Konten</h2>

                {loadingIdeas ? (
                  <LoadingState text="AI sedang meracik ide konten..." />
                ) : ideas.length > 0 ? (
                  <div className="space-y-2">
                    {ideas.map((idea, i) => (
                      <button
                        key={i}
                        onClick={() => handleApproveIdea(idea)}
                        className="group w-full text-left px-4 py-3.5 border border-gray-200 rounded-xl text-sm hover:border-bekon-gold hover:bg-bekon-gold/5 transition-all flex items-center justify-between gap-3"
                      >
                        <span>{idea}</span>
                        <ArrowRight size={16} className="text-gray-300 group-hover:text-bekon-gold shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Belum ada ide.</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={handleGetIdeas} disabled={loadingIdeas} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                    <RotateCcw size={14} /> Generate Ulang
                  </button>
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <ArrowLeft size={14} /> Kembali
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-semibold text-gray-900">Atur Parameter Video</h2>
                <div className="bg-bekon-gold/5 border border-bekon-gold/20 rounded-lg p-3 text-sm text-gray-700">{selectedIdea}</div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Aspect Ratio</label>
                  <div className="flex gap-3">
                    {ASPECT_RATIO_OPTIONS.map((r) => {
                      const shape = ASPECT_SHAPES[r]
                      const isSelected = aspectRatio === r
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setAspectRatio(r)}
                          className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg border-2 transition-all ${
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Durasi per Scene</label>
                  <div className="flex gap-2">
                    {DURATION_OPTIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDurationPerScene(d)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                          durationPerScene === d ? "border-bekon-gold bg-bekon-gold text-white" : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {d} detik
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Scene</label>
                    <input type="number" min={1} max={20} value={sceneCount} onChange={(e) => setSceneCount(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Platform</label>
                    <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none">
                      {PLATFORM_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Struktur</label>
                  <div className="flex flex-wrap gap-2">
                    {categoryInfo.structures.map((s) => (
                      <ChipButton key={s} label={s} active={structure === s} onClick={() => setStructure(s)} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gaya Visual</label>
                  <div className="flex flex-wrap gap-2">
                    {categoryInfo.styles.map((s) => (
                      <ChipButton key={s} label={s} active={style === s} onClick={() => setStyle(s)} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tone</label>
                  <div className="flex flex-wrap gap-2">
                    {TONE_OPTIONS.map((t) => (
                      <ChipButton key={t} label={t} active={tone === t} onClick={() => setTone(t)} />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bekon-gold text-white rounded-xl text-sm font-semibold hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
                  >
                    {generating ? <LoadingSpinner /> : <Sparkles size={16} />}
                    {generating ? "Menggenerate..." : "Generate Prompt JSON"}
                  </button>
                  <button onClick={() => setStep(2)} className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <ArrowLeft size={14} /> Kembali
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-6 bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <h3 className="font-semibold text-gray-900 text-sm">Ringkasan Pilihan</h3>

              <SummaryRow label="Jenis Video">
                <div className="flex items-center gap-2">
                  {CategoryIcon && (
                    <div className="w-7 h-7 rounded-lg bg-bekon-gold/10 text-bekon-gold flex items-center justify-center shrink-0">
                      <CategoryIcon size={14} />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">{categoryInfo.label}</span>
                </div>
              </SummaryRow>

              <SummaryRow label="Karakter">
                {selectedCharacter ? (
                  <div className="flex items-center gap-2">
                    <img src={selectedCharacter.photoUrl} alt={selectedCharacter.name} className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-sm text-gray-900">{selectedCharacter.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Tanpa karakter</span>
                )}
              </SummaryRow>

              <SummaryRow label="Bahan Referensi">
                {selectedMaterials.length > 0 ? (
                  <div className="flex -space-x-2">
                    {selectedMaterials.slice(0, 5).map((m) => (
                      <img key={m.id} src={m.photoUrl} alt={m.label} title={m.label} className="w-7 h-7 rounded-full object-cover border-2 border-white" />
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Tidak ada</span>
                )}
              </SummaryRow>

              {step >= 2 && selectedIdea && (
                <SummaryRow label="Ide Terpilih">
                  <p className="text-sm text-gray-900 leading-snug">{selectedIdea}</p>
                </SummaryRow>
              )}

              {step >= 3 && (
                <>
                  <SummaryRow label="Format">
                    <span className="text-sm text-gray-900">{aspectRatio} · {durationPerScene}dtk/scene · {sceneCount} scene</span>
                  </SummaryRow>
                  <SummaryRow label="Gaya">
                    <span className="text-sm text-gray-900">{style}</span>
                  </SummaryRow>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        result && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-bekon-gold/10 text-bekon-gold flex items-center justify-center">
                    {CategoryIcon && <CategoryIcon size={18} />}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{result.title}</h2>
                    <p className="text-xs text-gray-500">{categoryInfo.label} · {aspectRatio} · {platform} · {scenes.length} scene</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCopyAll} className="flex items-center gap-1.5 px-3 py-1.5 bg-bekon-gold text-white rounded-lg text-xs font-medium hover:bg-bekon-gold/90 transition-colors">
                    <Copy size={13} /> Copy Semua JSON
                  </button>
                  <button onClick={resetAll} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                    <RotateCcw size={13} /> Buat Baru
                  </button>
                </div>
              </div>

              {(selectedCharacter || selectedMaterials.length > 0) && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Reference image:</span>
                  {selectedCharacter && (
                    <img src={selectedCharacter.photoUrl} title={selectedCharacter.name} alt={selectedCharacter.name} className="w-8 h-8 rounded-full object-cover border-2 border-white shadow" />
                  )}
                  {selectedMaterials.map((m) => (
                    <img key={m.id} src={m.photoUrl} title={m.label} alt={m.label} className="w-8 h-8 rounded-full object-cover border-2 border-white shadow" />
                  ))}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {scenes.map((scene, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-full bg-bekon-gold/10 text-bekon-gold text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <button onClick={() => handleCopyScene(scene, i)} className="text-gray-400 hover:text-bekon-gold transition-colors" title="Copy scene ini">
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    <SceneField icon={Camera} label="Visual" value={scene.visual} />
                    <SceneField icon={Clapperboard} label="Kamera" value={scene.cameraMovement} />
                    <SceneField icon={Mic} label="Voiceover" value={scene.voiceover} />
                    <SceneField icon={TypeIcon} label="Teks Overlay" value={scene.textOverlay} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}

function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const stepNum = i + 1
        const isDone = stepNum < current
        const isActive = stepNum === current
        const Icon = s.icon
        return (
          <div key={s.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isDone
                    ? "bg-bekon-gold border-bekon-gold text-white"
                    : isActive
                    ? "border-bekon-gold text-bekon-gold bg-white"
                    : "border-gray-200 text-gray-300 bg-white"
                }`}
              >
                {isDone ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap ${isActive ? "text-bekon-gold" : isDone ? "text-gray-700" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${stepNum < current ? "bg-bekon-gold" : "bg-gray-200"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      {children}
    </div>
  )
}

function ChipButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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

function SceneField({ icon: Icon, label, value }: { icon: typeof Camera; label: string; value: string }) {
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

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="w-10 h-10 rounded-full bg-bekon-gold/10 flex items-center justify-center text-bekon-gold animate-pulse">
        <Sparkles size={20} />
      </div>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  )
}
