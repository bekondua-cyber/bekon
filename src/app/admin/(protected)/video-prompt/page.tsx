"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { VIDEO_CATEGORIES, DURATION_OPTIONS, ASPECT_RATIO_OPTIONS, TONE_OPTIONS, PLATFORM_OPTIONS, getCategory } from "@/lib/video-categories"

interface PortfolioOption {
  id: string
  title: string
}

interface CharacterOption {
  id: string
  name: string
  gender: string | null
  age: number | null
  photoUrl: string
}

interface MaterialOption {
  id: string
  label: string
  photoUrl: string
}

interface Scene {
  visual: string
  cameraMovement: string
  voiceover: string
  textOverlay: string
}

interface GeneratedResult {
  id: string
  title: string
  resultJson: string
}

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
    fetch("/api/admin/portfolio", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => setPortfolios(json.data || []))
      .catch(() => {})
    fetch("/api/admin/video-characters", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => setCharacters(json.data || []))
      .catch(() => {})
    fetch("/api/admin/video-materials", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => setMaterials(json.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setStructure(categoryInfo.structures[0])
    setStyle(categoryInfo.styles[0])
  }, [category])

  function toggleMaterial(id: string) {
    setMaterialIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  async function handleGetIdeas() {
    setLoadingIdeas(true)
    try {
      const res = await fetch("/api/admin/video-prompt/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category,
          portfolioId: portfolioId || undefined,
          characterId: characterId || undefined,
          seedTopic: seedTopic || undefined,
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
          category,
          idea: selectedIdea,
          aspectRatio,
          sceneCount,
          durationPerScene,
          structure,
          tone,
          platform,
          style,
          portfolioId: portfolioId || undefined,
          characterId: characterId || undefined,
          materialIds,
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

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result.resultJson)
    toast.success("JSON disalin ke clipboard")
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Video Prompt Generator</h1>
          <p className="text-gray-500 text-sm mt-1">Generate prompt JSON untuk AI video generator (Google Flow, dsb)</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/video-prompt/characters" className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Karakter
          </Link>
          <Link href="/admin/video-prompt/materials" className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Bahan
          </Link>
          <Link href="/admin/video-prompt/history" className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Riwayat
          </Link>
        </div>
      </div>

      <div className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-gray-900">Langkah 1: Jenis Video &amp; Karakter</h2>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Pilih Jenis Video</label>
              <div className="grid grid-cols-2 gap-2">
                {VIDEO_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      category === c.id
                        ? "border-bekon-gold bg-bekon-gold/10 text-bekon-near-black"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <p className="font-medium">{c.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {categoryInfo.usesCharacter !== "rare" && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Karakter (opsional)</label>
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
                        className={`rounded-lg overflow-hidden border-2 transition-colors ${
                          characterId === c.id ? "border-bekon-gold" : "border-transparent hover:border-gray-200"
                        }`}
                      >
                        <div className="aspect-square bg-gray-100">
                          <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] text-gray-600 truncate px-1 py-0.5">{c.name}</p>
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {characterId ? `Karakter dipilih: ${selectedCharacter?.name}` : "Tanpa karakter (default)"}
                </p>
              </div>
            )}

            {materials.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Bahan Referensi (opsional, bisa pilih lebih dari satu)</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {materials.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMaterial(m.id)}
                      className={`rounded-lg overflow-hidden border-2 transition-colors ${
                        materialIds.includes(m.id) ? "border-bekon-gold" : "border-transparent hover:border-gray-200"
                      }`}
                    >
                      <div className="aspect-square bg-gray-100">
                        <img src={m.photoUrl} alt={m.label} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] text-gray-600 truncate px-1 py-0.5">{m.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Referensi Portfolio (opsional)</label>
              <select
                value={portfolioId}
                onChange={(e) => setPortfolioId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              >
                <option value="">Tidak ada</option>
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Topik/arahan (opsional)</label>
              <input
                type="text"
                value={seedTopic}
                onChange={(e) => setSeedTopic(e.target.value)}
                placeholder="Contoh: tips renovasi dapur minimalis"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none"
              />
            </div>

            <button
              onClick={() => { handleGetIdeas(); setStep(2) }}
              disabled={loadingIdeas}
              className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
            >
              Generate Ide Konten
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Langkah 2: Pilih Ide Konten</h2>
            <p className="text-xs text-gray-500">Kategori: {categoryInfo.label}{selectedCharacter ? ` · Karakter: ${selectedCharacter.name}` : ""}</p>

            {loadingIdeas ? (
              <p className="text-sm text-gray-500">Menggenerate ide...</p>
            ) : ideas.length > 0 ? (
              <div className="space-y-2">
                {ideas.map((idea, i) => (
                  <button
                    key={i}
                    onClick={() => handleApproveIdea(idea)}
                    className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg text-sm hover:border-bekon-gold hover:bg-bekon-gold/5 transition-colors"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Belum ada ide.</p>
            )}

            <div className="flex gap-3">
              <button onClick={handleGetIdeas} disabled={loadingIdeas} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                Generate Ulang
              </button>
              <button onClick={() => setStep(1)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Kembali
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Langkah 3: Parameter Video</h2>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">{selectedIdea}</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Aspect Ratio</label>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none">
                  {ASPECT_RATIO_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none">
                  {PLATFORM_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Jumlah Scene</label>
                <input type="number" min={1} max={20} value={sceneCount} onChange={(e) => setSceneCount(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Durasi per Scene</label>
                <select value={durationPerScene} onChange={(e) => setDurationPerScene(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none">
                  {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d} detik</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Struktur</label>
                <select value={structure} onChange={(e) => setStructure(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none">
                  {categoryInfo.structures.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Gaya Visual</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none">
                  {categoryInfo.styles.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none">
                  {TONE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
              >
                {generating ? "Menggenerate..." : "Generate Prompt JSON"}
              </button>
              <button onClick={() => setStep(2)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Kembali
              </button>
            </div>
          </div>
        )}

        {step === 4 && result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{result.title}</h2>
              <button onClick={handleCopy} className="px-3 py-1.5 bg-bekon-gold text-white rounded-lg text-xs font-medium hover:bg-bekon-gold/90 transition-colors">
                Copy JSON
              </button>
            </div>
            <div className="space-y-3">
              {scenes.map((scene, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 text-sm">
                  <p className="font-medium text-gray-900 mb-1">Scene {i + 1}</p>
                  <p><span className="text-gray-500">Visual:</span> {scene.visual}</p>
                  <p><span className="text-gray-500">Kamera:</span> {scene.cameraMovement}</p>
                  <p><span className="text-gray-500">Voiceover:</span> {scene.voiceover}</p>
                  <p><span className="text-gray-500">Teks Overlay:</span> {scene.textOverlay}</p>
                </div>
              ))}
            </div>
            <button onClick={resetAll} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Buat Baru
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
