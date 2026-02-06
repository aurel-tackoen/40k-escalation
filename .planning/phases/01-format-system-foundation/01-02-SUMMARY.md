---
phase: 01-format-system-foundation
plan: 02
subsystem: ui, api
tags: [vue, nuxt, format-registry, league-creation, validation]

# Dependency graph
requires:
  - phase: 01-01
    provides: format-registry.ts with FormatConfig type and helper functions, format column on leagues table
provides:
  - Format selection UI in league creation form (clickable cards)
  - Server-side format validation on league create API
  - Format stored in leagues table on creation
  - Store passes format through creation flow
affects: [01-03 (format display in league views), 01-04 (format-driven behavior)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two-step selection: game system first, then format options filtered by system"
    - "Clickable card grid for format selection (not dropdown)"
    - "Server validates format key against format-registry before insert"

key-files:
  created: []
  modified:
    - app/pages/leagues/create.vue
    - server/api/leagues/create.post.ts

key-decisions:
  - "Store unchanged: leagueData passthrough naturally includes format"
  - "Fixed error handler to re-throw 4xx validation errors instead of swallowing as 500"

patterns-established:
  - "Format selection pattern: computed availableFormats from getFormatsForGameSystem(shortName)"
  - "Server format validation pattern: getFormatConfig(key) null-check for 400 response"

# Metrics
duration: 3min
completed: 2026-02-06
---

# Phase 1 Plan 2: Format Selection in League Creation Summary

**Two-step format selection UI with clickable cards, server-side registry validation, and format storage on league creation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-06T19:50:10Z
- **Completed:** 2026-02-06T19:53:32Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Format selection UI with clickable card grid appears after game system selection
- Client-side and server-side format validation (required + must exist in registry)
- Format field flows through: form -> store -> API -> database
- Changing game system clears format selection
- Even single-format systems (HH) show the format step

## Task Commits

Each task was committed atomically:

1. **Task 1: Add format selection UI to league creation form** - `0c855eb` (feat)
2. **Task 2: Update create API and store to handle format field** - `07d2871` (feat)

## Files Created/Modified
- `app/pages/leagues/create.vue` - Format import, form field, computed availableFormats, watcher, validation, card grid UI, format in submit data
- `server/api/leagues/create.post.ts` - Format registry import, format required check, registry validation, format in insert values, fixed error handler

## Decisions Made
- **Store unchanged:** The leagues store's `createLeague` action passes `leagueData` directly as the POST body, so format flows through naturally without store changes. The response uses `...response.data.league` spread which includes all DB columns including format.
- **Fixed error handler bug:** The catch block was swallowing all errors (including 400 validation errors) and re-throwing as 500. Fixed to re-throw 4xx errors as-is (Rule 1 - Bug).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed error handler swallowing validation errors in create.post.ts**
- **Found during:** Task 2 (API format validation)
- **Issue:** Catch block caught all errors and re-threw as 500, meaning 400 validation errors (missing format, invalid format) would appear as 500 "Failed to create league" to the client
- **Fix:** Added check for `error.statusCode < 500` to re-throw validation errors as-is
- **Files modified:** server/api/leagues/create.post.ts
- **Verification:** Build passes, lint passes
- **Committed in:** 07d2871 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Essential for format validation to return correct HTTP status codes. No scope creep.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Format selection integrated into league creation flow
- Format stored in DB on creation, available for display and behavior
- Ready for 01-03 (format display in existing league views) and 01-04 (format-driven scoring/behavior)
- Pre-existing note: create.vue sends `rounds` but API expects `phases` (incomplete round-to-phase rename from v0.1) - outside scope of this plan

---
*Phase: 01-format-system-foundation*
*Completed: 2026-02-06*

## Self-Check: PASSED
