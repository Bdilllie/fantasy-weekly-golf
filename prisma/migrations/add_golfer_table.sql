-- CreateTable
CREATE TABLE "Golfer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owgrRank" INTEGER NOT NULL,
    "country" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Golfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Golfer_name_key" ON "Golfer"("name");

-- CreateIndex
CREATE INDEX "Golfer_owgrRank_idx" ON "Golfer"("owgrRank");
