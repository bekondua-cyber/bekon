-- AlterTable
ALTER TABLE "video_prompt_history" ADD COLUMN     "promptVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "style" TEXT;
