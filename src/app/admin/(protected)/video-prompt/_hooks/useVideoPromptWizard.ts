"use client"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  VIDEO_CATEGORIES, DEFAULT_DURATION, ASPECT_RATIO_OPTIONS,
  TONE_OPTIONS, PLATFORM_OPTIONS, getCategory,
} from "@/lib/video-categories"
import type { VideoPromptResult } from "@/lib/video-prompt/schema"
import type {
  CharacterOption, GeneratedResult, MaterialOption, PortfolioOption, StepNumber,
} from "../_components/types"

export function useVideoPromptWizard() {
  const [step, setStep] = useState<StepNumber>(1)
  const [maxStepReached, setMaxStepReached] = useState<StepNumber>(1)

  const [category, setCategory] = useState(VIDEO_CATEGORIES[0].id)
  const categoryInfo = getCategory(category)

  const [portfolios, setPortfolios] = useState<PortfolioOption[]>([])
  const [characters, setCharacters] = useState<CharacterOption[]>([])
  const [materials, setMaterials] = useState<MaterialOption[]>([])

  const [characterId, setCharacterId] = useState("")
  const [materialIds, setMaterialIds] = useState<string[]>([])
  const [portfolioId, setPortfolioId] = useState("")
  const [seedTopic, setSeedTopic] = useState("")

  const [ideas, setIdeas] = useState<string[]>([])
  const [selectedIdea, setSelectedIdea] = useState("")
  const [loadingIdeas, setLoadingIdeas] = useState(false)

  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIO_OPTIONS[0])
  const [sceneCount, setSceneCount] = useState(3)
  const [durationPerScene, setDurationPerScene] = useState(DEFAULT_DURATION)
  const [structure, setStructure] = useState(categoryInfo.structures[0])
  const [style, setStyle] = useState(categoryInfo.styles[0])
  const [tone, setTone] = useState(TONE_OPTIONS[0])
  const [platform, setPlatform] = useState(PLATFORM_OPTIONS[0])

  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<GeneratedResult | null>(null)
  const [doneParts, setDoneParts] = useState<number[]>([])

  useEffect(() => {
    const load = (url: string, set: (v: never[]) => void) =>
      fetch(url, { credentials: "include" })
        .then((r) => r.json())
        .then((j) => set(j.data || []))
        .catch(() => {})

    load("/api/admin/portfolio", setPortfolios as never)
    load("/api/admin/video-characters", setCharacters as never)
    load("/api/admin/video-materials", setMaterials as never)
  }, [])

  // Struktur & gaya visual bergantung kategori, jadi direset saat kategori ganti.
  useEffect(() => {
    setStructure(categoryInfo.structures[0])
    setStyle(categoryInfo.styles[0])
  }, [category]) // eslint-disable-line react-hooks/exhaustive-deps

  function goToStep(n: StepNumber) {
    if (n <= maxStepReached) setStep(n)
  }

  function advanceTo(n: StepNumber) {
    setStep(n)
    setMaxStepReached((prev) => (n > prev ? n : prev))
  }

  function toggleCharacter(id: string) {
    setCharacterId((prev) => (prev === id ? "" : id))
  }

  function toggleMaterial(id: string) {
    setMaterialIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  async function handleGetIdeas() {
    advanceTo(2)
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

  function chooseIdea(idea: string) {
    setSelectedIdea(idea)
    advanceTo(3)
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch("/api/admin/video-prompt/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category, idea: selectedIdea, aspectRatio, sceneCount, durationPerScene,
          structure, tone, platform, style,
          deliveryMode: categoryInfo.defaultDelivery,
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
      setDoneParts([])
      advanceTo(4)
      toast.success("Prompt video berhasil dibuat")
    } catch {
      toast.error("Gagal generate prompt")
    } finally {
      setGenerating(false)
    }
  }

  function togglePartDone(index: number) {
    setDoneParts((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  function resetAll() {
    setStep(1)
    setMaxStepReached(1)
    setIdeas([])
    setSelectedIdea("")
    setResult(null)
    setDoneParts([])
    setCharacterId("")
    setMaterialIds([])
  }

  // Guard: resultJson rusak tidak boleh membuat halaman admin crash.
  const parsedResult = useMemo<VideoPromptResult | null>(() => {
    if (!result) return null
    try {
      return JSON.parse(result.resultJson) as VideoPromptResult
    } catch {
      return null
    }
  }, [result])

  const parts = parsedResult?.parts ?? []
  const selectedCharacter = characters.find((c) => c.id === characterId)
  const selectedMaterials = materials.filter((m) => materialIds.includes(m.id))
  const estimatedTotalSec = sceneCount * durationPerScene

  return {
    step, maxStepReached, goToStep, advanceTo,
    category, setCategory, categoryInfo,
    portfolios, characters, setCharacters, materials, setMaterials,
    characterId, toggleCharacter, materialIds, toggleMaterial,
    portfolioId, setPortfolioId, seedTopic, setSeedTopic,
    ideas, selectedIdea, setSelectedIdea, loadingIdeas, handleGetIdeas, chooseIdea,
    aspectRatio, setAspectRatio, sceneCount, setSceneCount,
    durationPerScene, setDurationPerScene,
    structure, setStructure, style, setStyle, tone, setTone, platform, setPlatform,
    generating, handleGenerate,
    result, parsedResult, parts, doneParts, togglePartDone, resetAll,
    selectedCharacter, selectedMaterials, estimatedTotalSec,
  }
}
