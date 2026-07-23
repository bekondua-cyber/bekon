-- CreateTable
CREATE TABLE "video_prompt_history" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "portfolioId" TEXT,
    "ideaPrompt" TEXT NOT NULL,
    "aspectRatio" TEXT NOT NULL,
    "sceneCount" INTEGER NOT NULL,
    "durationPerSec" INTEGER NOT NULL,
    "structure" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "resultJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_prompt_history_pkey" PRIMARY KEY ("id")
);
