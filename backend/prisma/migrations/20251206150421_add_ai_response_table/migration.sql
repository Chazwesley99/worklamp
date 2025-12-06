-- CreateTable
CREATE TABLE "AIResponse" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "responseData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIResponse_resourceType_resourceId_idx" ON "AIResponse"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "AIResponse_createdAt_idx" ON "AIResponse"("createdAt");
