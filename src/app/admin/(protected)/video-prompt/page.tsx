"use client"
import { Clapperboard } from "lucide-react"
import { VideoPromptTabs } from "@/components/admin/VideoPromptTabs"
import { useVideoPromptWizard } from "./_hooks/useVideoPromptWizard"
import { WizardStepper } from "./_components/WizardStepper"
import { StepConcept } from "./_components/StepConcept"
import { StepIdeas } from "./_components/StepIdeas"
import { StepDesign } from "./_components/StepDesign"
import { StepResult } from "./_components/StepResult"

export default function VideoPromptPage() {
  const w = useVideoPromptWizard()

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-bekon-gold to-bekon-gold-dark flex items-center justify-center text-white shrink-0">
          <Clapperboard size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Video Prompt Generator</h1>
          <p className="text-gray-500 text-sm">Susun prompt siap tempel untuk Google Flow</p>
        </div>
      </div>

      <VideoPromptTabs active="/admin/video-prompt" />

      <div className="mt-6 mb-7">
        <WizardStepper current={w.step} maxReached={w.maxStepReached} onJump={w.goToStep} />
      </div>

      {w.step === 4 ? (
        <StepResult
          data={w.parsedResult}
          doneParts={w.doneParts}
          onTogglePart={w.togglePartDone}
          onBack={() => w.goToStep(3)}
          onReset={w.resetAll}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-4xl">
          {w.step === 1 && (
            <StepConcept
              category={w.category}
              setCategory={w.setCategory}
              portfolios={w.portfolios}
              portfolioId={w.portfolioId}
              setPortfolioId={w.setPortfolioId}
              seedTopic={w.seedTopic}
              setSeedTopic={w.setSeedTopic}
              onNext={w.handleGetIdeas}
            />
          )}

          {w.step === 2 && (
            <StepIdeas
              ideas={w.ideas}
              loading={w.loadingIdeas}
              onRegenerate={w.handleGetIdeas}
              onBack={() => w.goToStep(1)}
              onChoose={w.chooseIdea}
            />
          )}

          {w.step === 3 && (
            <StepDesign
              categoryInfo={w.categoryInfo}
              selectedIdea={w.selectedIdea}
              aspectRatio={w.aspectRatio}
              setAspectRatio={w.setAspectRatio}
              durationPerScene={w.durationPerScene}
              setDurationPerScene={w.setDurationPerScene}
              sceneCount={w.sceneCount}
              setSceneCount={w.setSceneCount}
              platform={w.platform}
              setPlatform={w.setPlatform}
              structure={w.structure}
              setStructure={w.setStructure}
              style={w.style}
              setStyle={w.setStyle}
              tone={w.tone}
              setTone={w.setTone}
              estimatedTotalSec={w.estimatedTotalSec}
              characters={w.characters}
              setCharacters={w.setCharacters}
              characterId={w.characterId}
              toggleCharacter={w.toggleCharacter}
              materials={w.materials}
              setMaterials={w.setMaterials}
              materialIds={w.materialIds}
              toggleMaterial={w.toggleMaterial}
              generating={w.generating}
              onGenerate={w.handleGenerate}
              onBack={() => w.goToStep(2)}
            />
          )}
        </div>
      )}
    </div>
  )
}
