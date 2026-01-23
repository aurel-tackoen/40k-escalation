-- Rename rounds to stages throughout the database
-- This migration renames "rounds" to "stages" to avoid confusion with Warhammer game rounds

-- Rename the rounds table to stages
ALTER TABLE "rounds" RENAME TO "stages";

-- Rename columns in leagues table
ALTER TABLE "leagues" RENAME COLUMN "currentRound" TO "current_stage";

-- Rename columns in armies table
ALTER TABLE "armies" RENAME COLUMN "round" TO "stage";

-- Rename columns in matches table
ALTER TABLE "matches" RENAME COLUMN "round" TO "stage";

-- Rename columns in pairings table
ALTER TABLE "pairings" RENAME COLUMN "round" TO "stage";

-- Rename columns in players table
ALTER TABLE "players" RENAME COLUMN "joined_round" TO "joined_stage";
ALTER TABLE "players" RENAME COLUMN "left_round" TO "left_stage";
