-- CreateTable
CREATE TABLE "chat_conversation" (
    "id" TEXT NOT NULL,
    "messages" TEXT NOT NULL,
    "usedFallback" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_conversation_createdAt_idx" ON "chat_conversation"("createdAt");

-- CreateIndex
CREATE INDEX "chat_conversation_usedFallback_createdAt_idx" ON "chat_conversation"("usedFallback", "createdAt");

-- CreateIndex
CREATE INDEX "lead_status_createdAt_idx" ON "lead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "team_member_isActive_sortOrder_idx" ON "team_member"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "testimonial_isPublished_sortOrder_idx" ON "testimonial"("isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "video_isPublished_sortOrder_idx" ON "video"("isPublished", "sortOrder");

