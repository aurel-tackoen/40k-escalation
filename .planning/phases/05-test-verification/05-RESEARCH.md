# Phase 5: Test Verification - Research

**Researched:** 2026-02-06
**Domain:** Test verification and Round-to-Phase rename completion
**Confidence:** HIGH

## Summary

Phase 5 focuses on test verification for the Round-to-Phase terminology rename. Research reveals that the existing test suite does NOT contain any "round" terminology that needs updating - the test factories and test files already use "phase" terminology (currentPhase, phase property in mocks).

However, the research uncovered that **the rename is not complete** - there are still 24 source files with "round" references that were not addressed in Phases 1-4. This includes user-visible text like "Round {{ league.currentRound }}" in LeagueCard.vue and LeagueSwitcher.vue.

**Primary recommendation:** Phase 5 should (1) verify tests pass with current codebase, (2) document the remaining "round" references as incomplete work from prior phases, and (3) ensure test coverage exists for the renamed functionality.

## Test Infrastructure Analysis

### Test Framework
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Vitest | 3.2.4 | Unit/component test runner | Active |
| @vue/test-utils | 2.4.6 | Vue component testing | Active |
| @playwright/test | 1.56.0 | E2E testing | Active |
| @vitest/coverage-v8 | 3.2.4 | Code coverage | Active |
| happy-dom | 18.0.0 | DOM environment | Active |

### Test File Inventory

**Unit Tests:** `tests/unit/`
- `composables/useAuth.test.ts`
- `composables/useGameSystems.test.ts`
- `composables/useMatchResults.test.ts`
- `composables/usePaintingStats.test.ts`
- `composables/usePlayerStats.test.ts`
- `data/game-systems.test.ts`

**Component Tests:** `tests/component/`
- `LeagueCard.test.ts` - Comprehensive (517 lines)
- `LeagueSwitcher.test.ts`
- `LoadingSpinner.test.ts`
- `LoginButton.test.ts`
- `Logo.test.ts`
- `PaintingProgress.test.ts`
- `UserMenu.test.ts`

**Integration Tests:** `tests/integration/`
- `api/armies.test.ts`
- `api/factions.test.ts`
- `api/game-systems.test.ts`
- `api/health.test.ts`
- `api/leagues.test.ts`
- `stores/leagues.test.ts`

**E2E Tests:** `tests/e2e/`
- `auth.spec.ts` - Placeholder
- `health.spec.ts` - API health check
- `league-creation.spec.ts` - Placeholder
- `match-recording.spec.ts` - Placeholder
- `navigation.spec.ts` - Navigation and UI

**Configuration:**
- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration
- `tests/setup.ts` - Global test setup with mocks
- `test-utils/factories.ts` - Mock data factories

### Round References in Tests

**Tests:** NONE - No "round" terminology found in test files.

**Test Factories:** Already use phase terminology:
```typescript
// test-utils/factories.ts
export const createMockArmy = (overrides = {}) => ({
  phase: 1,  // Uses "phase" not "round"
  ...
})

export const createMockMatch = (overrides = {}) => ({
  phase: 1,  // Uses "phase" not "round"
  ...
})

export const createMockLeague = (overrides = {}) => ({
  currentPhase: 1,  // Uses "currentPhase" not "currentRound"
  ...
})

export const createMockPhase = (overrides = {}) => ({
  // Named "createMockPhase" not "createMockRound"
  ...
})
```

### Current Test Suite Status

Run command: `npm test -- --run`

**Results:**
- Test Files: 6 failed | 13 passed (19 total)
- Tests: 53 failed | 205 passed | 15 skipped (273 total)

**Failure Analysis:**
The failures are NOT related to Round/Phase rename. They are due to:

1. **Missing Lucide icon mocks** - Tests reference icons (Star, etc.) not included in mocks
2. **Pinia store not initialized** - Some tests don't properly set up Pinia
3. **Component structure changes** - Logo.test.ts expects different sizes than implementation

These are pre-existing test infrastructure issues, not rename-related failures.

## Remaining "Round" References in Codebase

**CRITICAL FINDING:** The rename is incomplete. 24 source files still contain "round" references.

### User-Visible Text Requiring Updates

| File | Line | Current Text | Required Text |
|------|------|--------------|---------------|
| LeagueCard.vue | 177 | `Round {{ league.currentRound }}` | `Phase {{ league.currentPhase }}` |
| LeagueCard.vue | 183 | `Round {{ league.currentRound }}` | `Phase {{ league.currentPhase }}` |
| LeagueSwitcher.vue | 115 | `Round {{ league.currentRound }}` | `Phase {{ league.currentPhase }}` |
| LeaguesManager.vue | 300 | `'Round updated successfully'` | `'Phase updated successfully'` |
| LeaguesManager.vue | 519 | `Phase <span>{{ league.currentRound }}</span>` | `Phase <span>{{ league.currentPhase }}</span>` |

### Property Access Requiring Updates

| File | Pattern | Count |
|------|---------|-------|
| LeagueCard.vue | `league.currentRound` | 4 references |
| LeagueSwitcher.vue | `league.currentRound` | 1 reference |
| LeaguesManager.vue | `currentRound` property/access | 6 references |
| DashboardView.vue | `:currentRound` prop | 1 reference (passing phase as round) |
| PaintingProgress.vue | `currentRound` prop | 1 reference |

### Code Comments and Internal Naming

Many files use "round" in comments or internal variable names (e.g., in usePairings.js, useArmyManagement.js). These don't affect users but represent incomplete rename.

### Data Files

| File | Issue |
|------|-------|
| default-rules.js | Multiple "round" references in user-visible rule text |
| placeholders.js | "Round 1" in placeholder strings |

### Database Comment

| File | Issue |
|------|-------|
| db/schema.ts | Comment says "BYE round" (line 132) |

## Architecture Patterns

### Test Structure

```
tests/
├── setup.ts                  # Global mocks for Nuxt auto-imports
├── unit/                     # Pure function tests
│   └── composables/          # Composable logic tests
├── component/                # Vue component tests with mocks
├── integration/              # Store and API tests
└── e2e/                      # Playwright browser tests
```

### Verification Approach

For a terminology rename, verification should check:

1. **Test files use correct terminology** - Already satisfied
2. **Test factories use correct terminology** - Already satisfied
3. **All tests pass** - BLOCKED by pre-existing test issues
4. **Source code has no remaining "round" references** - NOT SATISFIED (24 files remain)

### Recommended Verification Strategy

Given the findings, Phase 5 should:

1. **Document incomplete rename** - The prior phases did not complete the rename
2. **Fix remaining source code** - Update the 24 files with "round" references
3. **Run tests** - Verify tests pass after all fixes
4. **Grep verification** - Confirm no "round" in active code paths

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Finding "round" references | Manual search | `grep -ri "round" --include="*.{ts,js,vue}"` | Comprehensive, repeatable |
| Running tests | Manual clicks | `npm test -- --run` | Consistent results |
| Test coverage | Manual counting | `npm run test:coverage` | Automatic tracking |

## Common Pitfalls

### Pitfall 1: Assuming Prior Phases Complete
**What goes wrong:** Believing Phases 1-4 fully completed the rename
**Why it happens:** Verification reports showed "complete" but missed files
**How to avoid:** Run fresh grep search before starting Phase 5
**Warning signs:** Finding "Round" in UI when testing

### Pitfall 2: Confusing Test Failures with Rename Issues
**What goes wrong:** Assuming test failures are from rename when they're pre-existing
**Why it happens:** Tests fail, we assume it's our change
**How to avoid:** Run tests before making changes to establish baseline
**Warning signs:** Failures about icons, Pinia, unrelated to terminology

### Pitfall 3: Missing Non-Obvious References
**What goes wrong:** Only searching for "Round" and missing "currentRound"
**Why it happens:** Camel case variations don't match simple searches
**How to avoid:** Search for multiple patterns: "round", "Round", "currentRound", "rounds"
**Warning signs:** UI still shows old terminology after "all" fixes

## Code Examples

### Running Tests

```bash
# Run all tests (watch mode)
npm test

# Run all tests once
npm test -- --run

# Run specific test types
npm run test:unit
npm run test:component
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

### Verifying No "Round" References

```bash
# Search for "round" (case-insensitive) in source files
grep -ri "round" --include="*.ts" --include="*.js" --include="*.vue" \
  app/ server/ db/ tests/ test-utils/ | \
  grep -v "node_modules" | \
  grep -v "Math.round"

# Search for specific patterns
grep -rE "(currentRound|Round |\"Round)" app/ server/
```

### Test Factory Usage

```typescript
// Creating test data with phase terminology
import { createMockLeague, createMockPhase, createMockMatch } from '../../../test-utils/factories'

describe('League with phases', () => {
  it('should display current phase', () => {
    const league = createMockLeague({ currentPhase: 2 })
    const phases = [
      createMockPhase({ number: 1, name: '500 Points' }),
      createMockPhase({ number: 2, name: '1000 Points' })
    ]
    // ... test implementation
  })
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| "Round" terminology | "Phase" terminology | This project | Avoids confusion with Warhammer battle rounds |
| createMockRound | createMockPhase | Already done | Test factories aligned |
| currentRound prop | currentPhase prop | Partially done | 5 components still need update |

## Open Questions

### Question 1: Should we fix remaining source code in Phase 5?

**What we know:**
- Test files are clean - no "round" references
- Source code has 24 files with "round" references
- Phase 5 requirements (TEST-01, TEST-02) only mention tests

**What's unclear:**
- Whether Phase 5 scope should expand to fix source code
- Or whether this should be documented as incomplete prior phases

**Recommendation:** Document the incomplete state and either:
- (A) Expand Phase 5 to include source fixes, or
- (B) Create a follow-up task to complete Phases 2-4

### Question 2: How to handle pre-existing test failures?

**What we know:**
- 53 tests currently fail due to missing mocks and Pinia setup
- These are not related to Round/Phase rename

**What's unclear:**
- Whether TEST-02 ("all tests pass") requires fixing these issues
- Or whether it means "no regressions from rename"

**Recommendation:** Establish a baseline and ensure no new failures from rename work

## Sources

### Primary (HIGH confidence)
- `tests/` directory - Direct file inspection
- `test-utils/factories.ts` - Direct file inspection
- `vitest.config.ts` - Direct file inspection
- `npm test -- --run` - Actual test execution

### Secondary (MEDIUM confidence)
- `.planning/codebase/TESTING.md` - Project testing documentation
- `.planning/phases/04-user-interface/04-VERIFICATION-v2.md` - Prior phase verification

## Metadata

**Confidence breakdown:**
- Test inventory: HIGH - Direct file inspection
- Round references in tests: HIGH - Grep verification
- Remaining source issues: HIGH - Grep verification
- Test failure analysis: HIGH - Actual test execution

**Research date:** 2026-02-06
**Valid until:** Project completion (static analysis, no external dependencies)
