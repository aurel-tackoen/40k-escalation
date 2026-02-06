---
phase: 01-format-system-foundation
plan: 03
subsystem: database
tags: [typescript, migration, neon, drizzle, cp-scoring, painting-bonus]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Format registry with format keys, nullable format column on leagues table"
provides:
  - "One-time migration script to assign formats and recalculate OW PtG stats"
  - "CP scoring derivation from marginOfVictory (Massacre=3, Major=2, Minor=2, Draw=1)"
  - "Retroactive painting bonus calculation from armies.units JSON data"
affects:
  - 01-format-system-foundation (script must run before format-dependent features are used)
  - 02-api-layer (leagues will have format values set after migration runs)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Standalone migration script using @neondatabase/serverless directly (not @netlify/neon)"
    - "CLI argument parsing with --dry-run and --league-40k=ID --league-ow=ID overrides"
    - "Army painting percentage from units JSON: painted models / total models per unit"

key-files:
  created:
    - scripts/migrate-formats.ts
  modified: []

key-decisions:
  - "Auto-discover leagues by game system shortName, with explicit --league-40k=ID --league-ow=ID fallback for multi-league databases"
  - "Exclude format column from discovery query since migration 0023 may not be applied yet"
  - "100% painting threshold for bonus (all models painted across all units in phase army)"

patterns-established:
  - "scripts/ directory for one-time migration and maintenance scripts"
  - "CP derivation pattern: marginOfVictory string -> CP integer via lookup map"

# Metrics
duration: 3min
completed: 2026-02-06
---

# Phase 1 Plan 3: Format Migration Script Summary

**One-time migration script assigning format keys to 2 existing leagues with OW PtG CP scoring recalculation and retroactive painting bonus application**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-06T19:50:57Z
- **Completed:** 2026-02-06T19:54:31Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created migration script that discovers leagues by game system shortName (not hardcoded IDs)
- Implements CP scoring derivation from marginOfVictory: Massacre=3, Major Victory=2, Minor Victory=2, Draw=1, Loss=0
- Retroactively applies +1 CP painting bonus per match for 100% painted armies
- Recalculates player wins/losses/draws/totalPoints from scratch for OW league
- Supports --dry-run mode and explicit --league-40k=ID --league-ow=ID overrides
- Verified against live database: 5 matches processed, 3 painting bonuses applied correctly

## Task Commits

Each task was committed atomically:

1. **Task 1: Create scripts directory and migration script** - `bb573fe` (feat)

## Files Created/Modified
- `scripts/migrate-formats.ts` - Migration script with league discovery, format assignment, CP scoring recalculation, painting bonus logic, dry-run support, and detailed logging

## Decisions Made
- **Auto-discover with explicit ID fallback**: The script auto-discovers leagues when exactly 1 exists per game system, but supports `--league-40k=ID` and `--league-ow=ID` CLI arguments when multiple leagues exist (as in the dev/staging database). This makes the script usable in all environments.
- **Excluded format column from discovery query**: The initial version selected `leagues.format` in the discovery query, which fails if migration 0023 hasn't been applied yet. Removed it since we're about to SET the format, not read it.
- **100% painting threshold**: Uses the same calculation as `usePaintingStats.js` -- sum all paintedModels / sum all totalModels across units with models > 0. Army is fully painted when percentage >= 100%.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added --league-40k=ID and --league-ow=ID CLI arguments**
- **Found during:** Task 1 (dry-run testing)
- **Issue:** Dev/staging database has multiple leagues per game system (2 40k, 2 OW), so auto-discovery skips with warning. The script would be unusable in non-production environments.
- **Fix:** Added `parseLeagueIdArg()` function to extract explicit league IDs from CLI arguments. Falls back to auto-discovery when not provided.
- **Files modified:** scripts/migrate-formats.ts
- **Verification:** Dry-run with `--league-40k=27 --league-ow=28` successfully processes both leagues
- **Committed in:** bb573fe (Task 1 commit)

**2. [Rule 1 - Bug] Removed format column from discovery query**
- **Found during:** Task 1 (dry-run testing)
- **Issue:** Selecting `leagues.format` in the discovery query fails with "Failed query" when migration 0023 hasn't been applied to the database yet. The column doesn't exist.
- **Fix:** Removed `format` from the select clause. The format value isn't needed for discovery -- we're about to set it.
- **Files modified:** scripts/migrate-formats.ts
- **Verification:** Dry-run connects and discovers leagues successfully
- **Committed in:** bb573fe (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 bug)
**Impact on plan:** Both fixes make the script actually runnable. No scope creep.

## Issues Encountered
- The dev database has multiple leagues per game system, unlike the expected production database with exactly 2 leagues. Handled with explicit ID arguments.
- The `format` column doesn't exist in the database yet (migration 0023 not applied), causing queries that reference it to fail. Handled by excluding it from the discovery query.

## User Setup Required
None - script is run manually by the developer after migration 0023 is applied.

## Next Phase Readiness
- Migration script ready to run after migration 0023 is applied to production
- Run command: `npx tsx scripts/migrate-formats.ts --dry-run` (preview), then `npx tsx scripts/migrate-formats.ts` (execute)
- After migration runs, both leagues will have format values set and OW player stats will reflect CP scoring

## Self-Check: PASSED

---
*Phase: 01-format-system-foundation*
*Completed: 2026-02-06*
