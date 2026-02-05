# Roadmap: Round to Phase Terminology Rename

## Overview

This roadmap covers the systematic renaming of "Round" to "Phase" throughout the 40k Escalation League Manager application. The rename follows the natural dependency chain: database schema first, then API layer, then state management, then UI components, and finally test verification. Each phase delivers a complete, verifiable layer of the rename.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Database Schema** - Rename database columns and update Drizzle queries
- [x] **Phase 2: API Layer** - Rename API routes and update request/response properties
- [ ] **Phase 3: State Management** - Rename Pinia store state, getters, actions, and composables
- [ ] **Phase 4: User Interface** - Update component props, template text, and URL routes
- [ ] **Phase 5: Test Verification** - Update tests and verify full system integrity

## Phase Details

### Phase 1: Database Schema
**Goal**: Database uses "phase" terminology consistently with no data loss
**Depends on**: Nothing (first phase)
**Requirements**: DB-01, DB-02
**Success Criteria** (what must be TRUE):
  1. Database columns use `phase` naming (phase_id, phase_number, current_phase)
  2. Migration runs successfully without data loss on existing leagues
  3. Schema.ts exports `phases` table and uses phase column names
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md - Create migration and update schema.ts

### Phase 2: API Layer
**Goal**: API endpoints use "phases" terminology in routes and payloads
**Depends on**: Phase 1
**Requirements**: DB-03, API-01, API-02, API-03
**Success Criteria** (what must be TRUE):
  1. API routes use `/api/phases` instead of `/api/rounds`
  2. Request and response bodies use `phase` property names
  3. API handlers compile and run without referencing old variable names
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md - Update armies and pairings API handlers
- [x] 02-02-PLAN.md - Update match handlers and rename admin folder

### Phase 3: State Management
**Goal**: Frontend state management uses "phase" terminology throughout
**Depends on**: Phase 2
**Requirements**: STORE-01, STORE-02, STORE-03
**Success Criteria** (what must be TRUE):
  1. Pinia store state uses `phases` and `currentPhase` property names
  2. Store getters and actions reference phase terminology
  3. Composables use phase naming (usePhaseLookup, etc.)
  4. Store fetches data from new API endpoints successfully
**Plans**: 1 plan

Plans:
- [ ] 03-01-PLAN.md - Update Pinia store and composables with phase terminology

### Phase 4: User Interface
**Goal**: Users see "Phase" terminology everywhere in the application
**Depends on**: Phase 3
**Requirements**: UI-01, UI-02, UI-03
**Success Criteria** (what must be TRUE):
  1. All component props and data properties use phase terminology
  2. All user-visible text shows "Phase" instead of "Round"
  3. URL routes use phase terminology (if applicable)
  4. Application renders correctly with no console errors
**Plans**: TBD

Plans:
- [ ] 04-01: Component and template rename

### Phase 5: Test Verification
**Goal**: All tests pass with updated terminology, confirming rename is complete
**Depends on**: Phase 4
**Requirements**: TEST-01, TEST-02
**Success Criteria** (what must be TRUE):
  1. All test files use phase terminology
  2. All existing tests pass with the renamed codebase
  3. No references to "round" remain in active code paths
**Plans**: TBD

Plans:
- [ ] 05-01: Test updates and verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database Schema | 1/1 | Complete | 2026-02-05 |
| 2. API Layer | 2/2 | Complete | 2026-02-05 |
| 3. State Management | 0/1 | Ready to execute | - |
| 4. User Interface | 0/1 | Not started | - |
| 5. Test Verification | 0/1 | Not started | - |

---
*Roadmap created: 2026-02-05*
