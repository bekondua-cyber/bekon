-- AlterTable: make title nullable, add missing fields to Prisma schema
-- (columns already exist in DB from previous migration)
ALTER TABLE "hero_slide" ALTER COLUMN "title" DROP NOT NULL;
