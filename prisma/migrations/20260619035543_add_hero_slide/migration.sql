-- CreateTable
CREATE TABLE "hero_slide" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sourceType" TEXT NOT NULL DEFAULT 'custom',
    "portfolioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hero_slide_order_idx" ON "hero_slide"("order");

-- CreateIndex
CREATE INDEX "hero_slide_isActive_idx" ON "hero_slide"("isActive");

-- AddForeignKey
ALTER TABLE "hero_slide" ADD CONSTRAINT "hero_slide_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
