---
phase: 01-format-system-foundation
plan: 01
subsystem: database
tags: [typescript, drizzle, postgresql, format-registry, schema]

# Dependency graph
requires: []
provides:
  - "FormatConfig interface and FORMAT_REGISTRY with 7 format configs"
  - "getFormatsForGameSystem, getFormatConfig, getFormatDisplayName helpers"
  - "Nullable format varchar(50) column on leagues table"
  - "Migration 0023 for ALTER TABLE ADD COLUMN"
affects:
  - 01-format-system-foundation (plans 02-04 depend on registry and schema)
  - 02-api-layer (endpoints need format column in queries)
  - 03-state-management (store needs format field)
  - 04-user-interface (components use format display name)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Static TypeScript registry pattern for game-system-specific config"
    - "Format key as varchar FK to in-code registry (not DB table)"

key-files:
  created:
    - app/data/format-registry.ts
    - migrations/0023_add-format-to-leagues.sql
    - migrations/meta/0023_snapshot.json
  modified:
    - db/schema.ts
    - migrations/meta/_journal.json

key-decisions:
  - "Format registry as TypeScript data file, not DB table -- formats are static config versioned in code"
  - "varchar(50) over pgEnum -- flexible for adding new formats without DB migration"
  - "Nullable column -- existing leagues get null until migration script sets format"
  - "Manual migration creation -- drizzle-kit generate blocked by stale snapshot from round-to-phase rename"

patterns-established:
  - "Format key pattern: '{system-prefix}-{format-type}' e.g. 'ow-ptg', '40k-matched'"
  - "Registry lookup pattern: getFormatConfig(key) returns null for invalid keys"

# Metrics
duration: 5min
completed: 2026-02-06
---

# Phase 1 Plan 1: Format Registry and Schema Summary

**Static format registry with 7 format configs (4 game systems) and nullable format column on leagues table with Drizzle migration**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-06T19:44:22Z
- **Completed:** 2026-02-06T19:49:22Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created FormatConfig interface and FORMAT_REGISTRY with all 7 formats across tow, 40k, aos, hh game systems
- Added 3 helper functions for format lookup, filtering by game system, and display name resolution
- Added nullable format varchar(50) column to leagues table schema
- Generated migration 0023 with correct ALTER TABLE SQL and updated Drizzle snapshot

## Task Commits

Each task was committed atomically:

1. **Task 1: Create format registry data file** - `5275eeb` (feat)
2. **Task 2: Add format column to leagues table and generate migration** - `f7e77b7` (feat)

## Files Created/Modified
- `app/data/format-registry.ts` - Format configuration registry with FormatConfig interface, FORMAT_REGISTRY map (7 entries), and 3 helper functions
- `db/schema.ts` - Added nullable format varchar(50) column to leagues table after gameSystemId
- `migrations/0023_add-format-to-leagues.sql` - ALTER TABLE "leagues" ADD COLUMN "format" varchar(50)
- `migrations/meta/0023_snapshot.json` - Updated Drizzle snapshot reflecting phase renames and format column
- `migrations/meta/_journal.json` - Added migration 0023 entry

## Decisions Made
- **Manual migration creation instead of drizzle-kit generate**: The `drizzle-kit generate` command enters an interactive prompt due to the stale 0022 snapshot (which still references `rounds` table and `round` columns from before the manual rename migration). Created migration SQL, snapshot, and journal entry manually following exact Drizzle conventions. The snapshot was updated to correctly reflect both the phase renames from migration 0022 AND the new format column.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Manual migration creation due to drizzle-kit interactive prompt**
- **Found during:** Task 2 (migration generation)
- **Issue:** `npm run db:generate` enters an interactive prompt asking "Is phases table created or renamed from another table?" because the 0022 snapshot still references the old `rounds` table. Cannot respond to interactive prompts in this environment.
- **Fix:** Created migration SQL file, snapshot JSON, and journal entry manually, following the exact same patterns as existing migrations. The snapshot was properly updated to reflect the round-to-phase renames that migration 0022 performed, plus the new format column.
- **Files created:** migrations/0023_add-format-to-leagues.sql, migrations/meta/0023_snapshot.json
- **Files modified:** migrations/meta/_journal.json
- **Verification:** Schema imports work, format column accessible via TypeScript
- **Committed in:** f7e77b7 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Migration is functionally identical to what drizzle-kit would generate. Snapshot also fixes the stale round-to-phase state, which will prevent the interactive prompt in future migrations.

## Issues Encountered
- Drizzle-kit's stale snapshot from the manual round-to-phase rename (migration 0022) causes interactive prompts during `drizzle-kit generate`. The manually created snapshot for 0023 resolves this by correctly reflecting the current schema state.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Format registry ready for import in league creation form (Plan 02)
- Schema ready for API endpoints to read/write format field (Plan 02)
- Migration ready to be applied to production database
- Helper functions ready for format display in UI components (Plan 04)

## Self-Check: PASSED

---
*Phase: 01-format-system-foundation*
*Completed: 2026-02-06*
