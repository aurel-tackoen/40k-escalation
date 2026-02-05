-- Rename all "round" terminology to "phase" in the database schema
-- This eliminates confusion between Warhammer battle rounds and league progression periods

-- Rename the rounds table to phases
ALTER TABLE "rounds" RENAME TO "phases";

-- Rename columns in leagues table
ALTER TABLE "leagues" RENAME COLUMN "currentRound" TO "currentPhase";

-- Rename columns in players table
ALTER TABLE "players" RENAME COLUMN "joined_round" TO "joined_phase";
ALTER TABLE "players" RENAME COLUMN "left_round" TO "left_phase";

-- Rename columns in pairings table
ALTER TABLE "pairings" RENAME COLUMN "round" TO "phase";

-- Rename columns in matches table
ALTER TABLE "matches" RENAME COLUMN "round" TO "phase";

-- Rename columns in armies table
ALTER TABLE "armies" RENAME COLUMN "round" TO "phase";
