-- CreateTable
CREATE TABLE "rate_limit_hit" (
    "identifier" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_hit_pkey" PRIMARY KEY ("identifier")
);

-- CreateIndex
CREATE INDEX "rate_limit_hit_resetAt_idx" ON "rate_limit_hit"("resetAt");
