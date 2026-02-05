---
phase: 01-database-schema
plan: 01
subsystem: database
tags: [drizzle, postgres, migration, schema]

# Dependency graph
requires: []
provides:
  - Database table 'phases' (renamed from 'rounds')
  - All phase-related columns in leagues, players, pairings, matches, armies
  - Drizzle schema with phase terminology
affects: [02-api-terminology, 03-frontend-components]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Phase terminology for league progression (not 'round')"
    - "Drizzle custom migrations for table/column renames"

key-files:
  created:
    - migrations/0022_rename-rounds-to-phases.sql
  modified:
    - db/schema.ts
    - server/api/leagues/*.ts
    - server/api/players/*.ts
    - server/api/admin/*.ts

key-decisions:
  - "Used ALTER TABLE RENAME for zero-downtime migration"
  - "Updated all API routes in same commit to maintain consistency"

patterns-established:
  - "Phase = escalation league progression period"
  - "Round = Warhammer game mechanics (battle round)"

# Metrics
duration: 12min
completed: 2026-02-05
---

# Phase 1 Plan 1: Round to Phase Rename Summary

**Database migration renaming 'rounds' table to 'phases' and updating all column references across schema and API routes**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-02-05
- **Completed:** 2026-02-05
- **Tasks:** 2
- **Files modified:** 22

## Accomplishments
- Created and applied PostgreSQL migration to rename 'rounds' table to 'phases'
- Updated all 'round' column references to 'phase' variants across 6 tables
- Updated Drizzle schema.ts to match new database structure
- Updated 15 API route files to use phase terminology
- Updated test factories and component test files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create and run database migration** - `83124c2` (feat)
2. **Task 2: Update schema.ts to match new database structure** - `90ccdbb` (feat)

Note: Task 2 expanded to include API routes and tests as they reference schema entities (Rule 3 - Blocking: code wouldn't compile without updating references).

## Files Created/Modified

**Created:**
- `migrations/0022_rename-rounds-to-phases.sql` - SQL migration for renaming tables/columns

**Modified:**
- `db/schema.ts` - Updated Drizzle schema with phase terminology
- `server/api/leagues.get.ts` - Fetch leagues with phases
- `server/api/leagues.post.ts` - Create league with phases
- `server/api/leagues.put.ts` - Update league with phases
- `server/api/leagues/[id].get.ts` - Get single league with phases
- `server/api/leagues/[id].patch.ts` - Patch league with phases
- `server/api/leagues/[id].delete.ts` - Delete league with phases
- `server/api/leagues/create.post.ts` - Create league endpoint
- `server/api/leagues/my.get.ts` - Get user's leagues
- `server/api/leagues/info-by-token/[token].get.ts` - Get league by share token
- `server/api/players.get.ts` - Get players with joinedPhase/leftPhase
- `server/api/players/[id]/toggle-active.patch.ts` - Toggle player with currentPhase
- `server/api/admin/leagues.get.ts` - Admin leagues with phases
- `server/api/admin/leagues/[id].put.ts` - Admin update league
- `server/api/admin/rounds/[id].put.ts` - Updated to phases endpoint
- `test-utils/factories.ts` - Updated mock factories
- `tests/component/LeagueCard.test.ts` - Updated test data
- `tests/component/LeagueSwitcher.test.ts` - Updated test data
- `tests/component/PaintingProgress.test.ts` - Updated test data

## Decisions Made
- Used PostgreSQL ALTER TABLE RENAME for zero-downtime migration (preserves data and FK relationships)
- Updated API routes in same commit as schema to maintain compile-time consistency
- Left Vue components unchanged for now (they use API response shapes, not schema directly)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated API routes referencing renamed schema entities**
- **Found during:** Task 2 (Update schema.ts)
- **Issue:** 15 API route files imported and referenced 'rounds' and 'currentRound' which would cause TypeScript errors
- **Fix:** Updated all imports from 'rounds' to 'phases' and all field references
- **Files modified:** All server/api/ files listed above
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** `90ccdbb` (Task 2 commit)

**2. [Rule 3 - Blocking] Updated test factories and component tests**
- **Found during:** Task 2 (Update schema.ts)
- **Issue:** Test files referenced old 'rounds' and 'currentRound' terminology
- **Fix:** Updated mock data and test assertions
- **Files modified:** test-utils/factories.ts, tests/component/*.test.ts
- **Verification:** Test files parse correctly
- **Committed in:** `90ccdbb` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes necessary for TypeScript compilation. No scope creep - these are direct references to schema entities.

## Issues Encountered
None - migration applied cleanly and all references updated successfully.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Database schema now uses 'phase' terminology consistently
- API routes return 'phases' instead of 'rounds' in response data
- Vue components still reference old terminology in API response handling (separate frontend plan needed)
- Frontend components will need updates to match new API response shapes

---
*Phase: 01-database-schema*
*Completed: 2026-02-05*
