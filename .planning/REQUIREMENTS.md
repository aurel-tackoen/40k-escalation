# Requirements: 40k Escalation League Manager

**Defined:** 2026-02-05
**Core Value:** Players can easily track their league progress and see where they stand

## v1 Requirements

Requirements for the Round → Phase terminology rename.

### Database

- [ ] **DB-01**: Rename `round` columns to `phase` in schema (e.g., round_id → phase_id, round_number → phase_number, current_round → current_phase)
- [ ] **DB-02**: Create migration that renames columns without data loss
- [ ] **DB-03**: Update all Drizzle queries referencing old column names

### API

- [ ] **API-01**: Rename API route files from `rounds` to `phases` (e.g., /api/rounds → /api/phases)
- [ ] **API-02**: Update request/response property names (round → phase)
- [ ] **API-03**: Update internal variable names in API handlers

### Store & Composables

- [ ] **STORE-01**: Rename Pinia store state properties (rounds → phases, currentRound → currentPhase)
- [ ] **STORE-02**: Rename store getters and actions referencing rounds
- [ ] **STORE-03**: Update composables that reference round data (useRoundLookup → usePhaseLookup, etc.)

### UI

- [ ] **UI-01**: Update component props and data properties
- [ ] **UI-02**: Update template text (labels, headings, messages)
- [ ] **UI-03**: Update URL routes if rounds appear in paths

### Testing

- [ ] **TEST-01**: Update test files to use new terminology
- [ ] **TEST-02**: Verify all existing tests pass after rename

## v2 Requirements

(None — this is a focused refactoring task)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backwards-compatible API | Clean break — no legacy support needed |
| URL redirects | Internal app, no external links to preserve |
| i18n/localization | English only for now |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DB-01 | Phase 1 | Complete |
| DB-02 | Phase 1 | Complete |
| DB-03 | Phase 2 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 2 | Pending |
| STORE-01 | Phase 3 | Pending |
| STORE-02 | Phase 3 | Pending |
| STORE-03 | Phase 3 | Pending |
| UI-01 | Phase 4 | Pending |
| UI-02 | Phase 4 | Pending |
| UI-03 | Phase 4 | Pending |
| TEST-01 | Phase 5 | Pending |
| TEST-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-02-05 after initial definition*
