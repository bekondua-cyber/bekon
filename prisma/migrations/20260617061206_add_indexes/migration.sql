-- CreateIndex
CREATE INDEX "article_isPublished_category_idx" ON "article"("isPublished", "category");

-- CreateIndex
CREATE INDEX "portfolio_isPublished_isFeatured_idx" ON "portfolio"("isPublished", "isFeatured");

-- CreateIndex
CREATE INDEX "portfolio_isPublished_category_idx" ON "portfolio"("isPublished", "category");

-- CreateIndex
CREATE INDEX "video_category_idx" ON "video"("category");
