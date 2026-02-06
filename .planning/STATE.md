# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-06)

**Core value:** Players can easily track their league progress and see where they stand
**Current focus:** v0.2 Phase 1 — Format System Foundation

## Current Position

Phase: 1 of 5 (Format System Foundation)
Plan: 3 of 4 in current phase
Status: In progress
Last activity: 2026-02-06 — Completed 01-03-PLAN.md (Format Migration Script)

Progress: v0.2 [███░░░░░░░░░░] 3/13 plans (23%)

## Performance Metrics

**v0.1 Velocity:**
- Total plans completed: 10
- Average duration: 5.3 min
- Total execution time: 0.88 hours

**v0.2 Velocity:**
- Plans completed: 3
- Average duration: 4 min
- Total execution time: 11 min

## Accumulated Context

### Decisions

All v0.1 decisions archived in PROJECT.md Key Decisions table.

| Phase | Plan | Decision | Rationale |
|-------|------|----------|-----------|
| 01 | 01 | Format registry as TypeScript data file, not DB table | Formats are static config versioned in code, not user data |
| 01 | 01 | varchar(50) over pgEnum for format column | Flexible for adding new formats without DB migration |
| 01 | 01 | Nullable format column | Existing leagues get null until migration script sets format |
| 01 | 01 | Manual migration creation | drizzle-kit generate blocked by stale snapshot; manual creation also fixes snapshot |
| 01 | 02 | Store unchanged for format passthrough | leagueData body passthrough and response spread naturally include format |
| 01 | 02 | Fixed error handler to re-throw 4xx errors | Pre-existing bug: catch block swallowed validation errors as 500 |
| 01 | 03 | Auto-discover leagues with explicit ID fallback | Dev DB has multiple leagues per system; --league-40k=ID --league-ow=ID override |
| 01 | 03 | Exclude format column from discovery query | Migration 0023 may not be applied yet; column doesn't exist in DB |
| 01 | 03 | 100% painting threshold for CP bonus | All models painted across all units = fully painted army |

### Pending Todos

None.

### Blockers/Concerns

- 48 pre-existing test failures in UserMenu.test.ts (Pinia store initialization) — carried from v0.1
- Drizzle snapshot was stale from round-to-phase rename (migration 0022); fixed in 0023 snapshot
- create.vue sends `rounds` but API expects `phases` (incomplete round-to-phase rename from v0.1)

## Session Continuity

Last session: 2026-02-06T19:54Z
Stopped at: Completed 01-03-PLAN.md
Resume file: None

---
*State initialized: 2026-02-05*
*Last updated: 2026-02-06 — completed 01-03 (format migration script)*
