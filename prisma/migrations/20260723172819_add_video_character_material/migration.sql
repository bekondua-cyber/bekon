-- AlterTable
ALTER TABLE "video_prompt_history" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'umum',
ADD COLUMN     "characterId" TEXT,
ADD COLUMN     "materialIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "video_character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT,
    "age" INTEGER,
    "photoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_material" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "photoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_material_pkey" PRIMARY KEY ("id")
);
