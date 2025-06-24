-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_competitionId_fkey";

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "competitionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
