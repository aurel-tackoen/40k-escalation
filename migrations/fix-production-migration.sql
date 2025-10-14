-- Fix for production database with existing data
-- This handles the migration from single-league to multi-league

-- Step 1: Create a default league if none exists
INSERT INTO "leagues" (name, description, "startDate", "currentRound", "createdBy", "isPublic", status)
SELECT 'Default League', 'Auto-created for existing data', CURRENT_DATE, 1, 1, true, 'active'
WHERE NOT EXISTS (SELECT 1 FROM "leagues" LIMIT 1);

-- Step 2: Add leagueId columns as nullable first
ALTER TABLE "armies" ADD COLUMN IF NOT EXISTS "leagueId" integer;
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "leagueId" integer;

-- Step 3: Set leagueId to the first league for existing records
UPDATE "armies" SET "leagueId" = (SELECT id FROM "leagues" ORDER BY id LIMIT 1) WHERE "leagueId" IS NULL;
UPDATE "players" SET "leagueId" = (SELECT id FROM "leagues" ORDER BY id LIMIT 1) WHERE "leagueId" IS NULL;

-- Step 4: Now make columns NOT NULL
ALTER TABLE "armies" ALTER COLUMN "leagueId" SET NOT NULL;
ALTER TABLE "players" ALTER COLUMN "leagueId" SET NOT NULL;

-- Step 5: Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'armies_leagueId_leagues_id_fk'
    ) THEN
        ALTER TABLE "armies" ADD CONSTRAINT "armies_leagueId_leagues_id_fk" 
        FOREIGN KEY ("leagueId") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'players_leagueId_leagues_id_fk'
    ) THEN
        ALTER TABLE "players" ADD CONSTRAINT "players_leagueId_leagues_id_fk" 
        FOREIGN KEY ("leagueId") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;
