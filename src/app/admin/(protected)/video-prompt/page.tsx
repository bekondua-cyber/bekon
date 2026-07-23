"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

interface PortfolioOption {
  id: string
  title: string
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

const ASPECT_RATIOS = ["9:16", "16:9", "1:1", "4:5"]
const STRUCTURES = ["Hook - Body - CTA", "Problem - Solution - CTA", "Before - After - CTA"]
const TONES = ["Profesional", "Santai & Ramah", "Inspiratif", "Edukatif"]
const PLATFORMS = ["TikTok", "Instagram Reels", "YouTube Shorts"]

export default function VideoPromptPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [portfolios, setPortfolios] = useState<PortfolioOption[]>([])
  const [portfolioId, setPortfolioId] = useState("")
  const [seedTopic, setSeedTopic] = useState("")
  const [ideas, setIdeas] = useState<string[]>([])
  const [selectedIdea, setSelectedIdea] = useState("")
  const [loadingIdeas, setLoadingIdeas] = useState(false)

  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0])
  const [sceneCount, setSceneCount] = useState(5)
  const [durationPerScene, setDurationPerScene] = useState(5)
  const [structure, setStructure] = useState(STRUCTURES[0])
  const [tone, setTone] = useState(TONES[0])
  const [platform, setPlatform] = useState(PLATFORMS[0])
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<GeneratedResult | null>(null)

  useEffect(() => {
    fetch("/api/admin/portfolio", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => setPortfolios(json.data || []))
      .catch(() => {})
  }, [])

  async function handleGetIdeas() {
    setLoadingIdeas(true)
    try {
      const res = await fetch("/api/admin/video-prompt/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ portfolioId: portfolioId || undefined, seedTopic: seedTopic || undefined }),
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
    setStep(2)
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch("/api/admin/video-prompt/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          idea: selectedIdea,
          aspectRatio,
          sceneCount,
          durationPerScene,
          structure,
          tone,
          platform,
          portfolioId: portfolioId || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || "Gagal generate prompt")
        return
      }
      setResult(json.data)
      setStep(3)
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

  const scenes: Scene[] = result ? JSON.parse(result.resultJson).scenes : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Video Prompt Generator</h1>
          <p className="text-gray-500 text-sm mt-1">Generate prompt JSON untuk AI video generator (Google Flow, dsb)</p>
        </div>
        <Link
          href="/admin/video-prompt/history"
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Lihat Riwayat
        </Link>
      </div>

      <div className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Langkah 1: Ide Konten</h2>
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
              onClick={handleGetIdeas}
              disabled={loadingIdeas}
              className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors disabled:opacity-50"
            >
              {loadingIdeas ? "Menggenerate ide..." : "Generate Ide Konten"}
            </button>

            {ideas.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-sm font-medium text-gray-600">Pilih salah satu ide:</p>
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
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Langkah 2: Parameter Video</h2>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">{selectedIdea}</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Aspect Ratio</label>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none">
                  {ASPECT_RATIOS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none">
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Jumlah Scene</label>
                <input type="number" min={1} max={20} value={sceneCount} onChange={(e) => setSceneCount(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Durasi per Scene (detik)</label>
                <input type="number" min={1} max={120} value={durationPerScene} onChange={(e) => setDurationPerScene(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Struktur</label>
                <select value={structure} onChange={(e) => setStructure(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none">
                  {STRUCTURES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold outline-none">
                  {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
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
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Kembali
              </button>
            </div>
          </div>
        )}

        {step === 3 && result && (
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
            <button
              onClick={() => { setStep(1); setIdeas([]); setSelectedIdea(""); setResult(null) }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Buat Baru
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
