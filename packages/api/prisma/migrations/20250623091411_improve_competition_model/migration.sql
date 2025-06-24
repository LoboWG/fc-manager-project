/*
  Warnings:

  - You are about to drop the column `division` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Competition` table. All the data in the column will be lost.
  - Added the required column `format` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `Competition` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_sessionId_fkey";

-- AlterTable
ALTER TABLE "Competition" DROP COLUMN "division",
DROP COLUMN "type",
ADD COLUMN     "format" TEXT NOT NULL,
ADD COLUMN     "providerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "round" TEXT,
ALTER COLUMN "matchDate" DROP NOT NULL,
ALTER COLUMN "sessionId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CompetitionProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CompetitionProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionProvider_name_key" ON "CompetitionProvider"("name");

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "CompetitionProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
