-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "basePrompt" TEXT NOT NULL,
    "chosenPost" TEXT NOT NULL,
    "photoData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Session_createdAt_idx" ON "Session"("createdAt");
