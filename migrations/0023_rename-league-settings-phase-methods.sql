-- Rename remaining legacy terminology to "phase" in league_settings
-- This completes the phase refactor by aligning pairing-method columns.

ALTER TABLE "league_settings" RENAME COLUMN "first_round_pairing_method" TO "first_phase_pairing_method";
ALTER TABLE "league_settings" RENAME COLUMN "subsequent_round_method" TO "subsequent_phase_method";
