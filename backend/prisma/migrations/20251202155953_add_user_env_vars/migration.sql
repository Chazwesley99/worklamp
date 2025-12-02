-- CreateTable
CREATE TABLE "UserEnvVar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEnvVar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserEnvVar_userId_idx" ON "UserEnvVar"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEnvVar_userId_key_key" ON "UserEnvVar"("userId", "key");

-- AddForeignKey
ALTER TABLE "UserEnvVar" ADD CONSTRAINT "UserEnvVar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
