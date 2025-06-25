/*
  Warnings:

  - You are about to drop the column `opponent` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `ourScore` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `theirScore` on the `Match` table. All the data in the column will be lost.
  - Added the required column `awayTeamName` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeTeamName` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "opponent",
DROP COLUMN "ourScore",
DROP COLUMN "theirScore",
ADD COLUMN     "awayTeamName" TEXT NOT NULL,
ADD COLUMN     "awayTeamScore" INTEGER,
ADD COLUMN     "homeTeamName" TEXT NOT NULL,
ADD COLUMN     "homeTeamScore" INTEGER,
ADD COLUMN     "isOurMatch" BOOLEAN NOT NULL DEFAULT false;
