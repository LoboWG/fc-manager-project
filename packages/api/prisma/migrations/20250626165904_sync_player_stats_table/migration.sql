-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "awayTeamCorners" INTEGER,
ADD COLUMN     "awayTeamExpectedGoals" DOUBLE PRECISION,
ADD COLUMN     "awayTeamFouls" INTEGER,
ADD COLUMN     "awayTeamFreeKicks" INTEGER,
ADD COLUMN     "awayTeamInterceptions" INTEGER,
ADD COLUMN     "awayTeamOffsides" INTEGER,
ADD COLUMN     "awayTeamPasses" INTEGER,
ADD COLUMN     "awayTeamPenalties" INTEGER,
ADD COLUMN     "awayTeamPossession" INTEGER,
ADD COLUMN     "awayTeamSaves" INTEGER,
ADD COLUMN     "awayTeamShots" INTEGER,
ADD COLUMN     "awayTeamTackles" INTEGER,
ADD COLUMN     "awayTeamTacklesCompleted" INTEGER,
ADD COLUMN     "awayTeamYellowCards" INTEGER DEFAULT 0,
ADD COLUMN     "homeTeamCorners" INTEGER,
ADD COLUMN     "homeTeamExpectedGoals" DOUBLE PRECISION,
ADD COLUMN     "homeTeamFouls" INTEGER,
ADD COLUMN     "homeTeamFreeKicks" INTEGER,
ADD COLUMN     "homeTeamInterceptions" INTEGER,
ADD COLUMN     "homeTeamOffsides" INTEGER,
ADD COLUMN     "homeTeamPasses" INTEGER,
ADD COLUMN     "homeTeamPenalties" INTEGER,
ADD COLUMN     "homeTeamPossession" INTEGER,
ADD COLUMN     "homeTeamSaves" INTEGER,
ADD COLUMN     "homeTeamShots" INTEGER,
ADD COLUMN     "homeTeamTackles" INTEGER,
ADD COLUMN     "homeTeamTacklesCompleted" INTEGER,
ADD COLUMN     "homeTeamYellowCards" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "PlayerMatchStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "positionPlayed" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "isManOfTheMatch" BOOLEAN NOT NULL DEFAULT false,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "shotSuccessRate" DOUBLE PRECISION,
    "dribblesAttempted" INTEGER NOT NULL DEFAULT 0,
    "dribbleSuccessRate" DOUBLE PRECISION,
    "passesAttempted" INTEGER NOT NULL DEFAULT 0,
    "passSuccessRate" DOUBLE PRECISION,
    "tacklesAttempted" INTEGER NOT NULL DEFAULT 0,
    "tackleSuccessRate" DOUBLE PRECISION,
    "ballsRecovered" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "offsides" INTEGER NOT NULL DEFAULT 0,
    "shotsOnTarget" INTEGER NOT NULL DEFAULT 0,
    "passesCompleted" INTEGER NOT NULL DEFAULT 0,
    "dribblesCompleted" INTEGER NOT NULL DEFAULT 0,
    "tacklesCompleted" INTEGER NOT NULL DEFAULT 0,
    "performanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerMatchStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerMatchStats_userId_matchId_key" ON "PlayerMatchStats"("userId", "matchId");

-- AddForeignKey
ALTER TABLE "PlayerMatchStats" ADD CONSTRAINT "PlayerMatchStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchStats" ADD CONSTRAINT "PlayerMatchStats_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
