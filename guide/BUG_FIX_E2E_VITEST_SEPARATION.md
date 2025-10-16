# Testing Issue Fix - E2E Tests Running with Vitest

**Date**: October 16, 2025  
**Issue**: Playwright E2E tests were being picked up by Vitest, causing errors  
**Status**: ✅ FIXED

---

## Problem

When running `npm run test` (which runs Vitest in watch mode), Playwright E2E tests in `tests/e2e/` were being executed by Vitest, causing errors:

```
Error: Playwright Test did not expect test() to be called here.
Most common reasons include:
- You are calling test() in a configuration file.
- You are calling test() in a file that is imported by the configuration file.
- You have two different versions of @playwright/test.
```

This happened because Vitest's config included all `.spec.ts` files:
```typescript
include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts']
```

---

## Solution

Updated `vitest.config.ts` to explicitly exclude E2E tests:

```typescript
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'], // ← ADDED THIS LINE
    coverage: {
      // ... rest of config
    }
  }
})
```

---

## Test Script Separation

The project now has properly separated test scripts:

### Vitest (Unit, Component, Integration)
```bash
npm run test              # Watch mode - unit + component + integration
npm run test:unit         # Unit tests only
npm run test:component    # Component tests only
npm run test:integration  # Integration tests only
npm run test:coverage     # With coverage report
```

### Playwright (E2E)
```bash
npm run test:e2e          # E2E tests with Playwright
npm run test:e2e:ui       # E2E with Playwright UI
```

### All Tests
```bash
npm run test:all          # Runs ALL tests (unit + integration + component + e2e)
```

---

## Test Results After Fix

```
✅ Test Files  19 passed (19)
✅ Tests       258 passed | 15 skipped (273)
❌ Failures    0
⏱️  Duration   ~2-3 seconds
```

**Breakdown:**
- Component tests: 192 passing, 15 skipped (207 total)
- Unit tests: 48 passing
- Integration tests: 18 passing

---

## File Structure

```
tests/
├── component/          # Vue component tests (Vitest)
│   ├── UserMenu.test.ts
│   ├── LoginButton.test.ts
│   ├── PaintingProgress.test.ts
│   ├── LeagueCard.test.ts
│   ├── LeagueSwitcher.test.ts
│   ├── LoadingSpinner.test.ts
│   └── Logo.test.ts
├── unit/               # Unit tests (Vitest)
│   ├── composables/
│   └── data/
├── integration/        # Integration tests (Vitest)
│   ├── api/
│   └── stores/
├── e2e/                # E2E tests (Playwright) ← NOW EXCLUDED FROM VITEST
│   ├── auth.spec.ts
│   ├── health.spec.ts
│   ├── league-creation.spec.ts
│   ├── match-recording.spec.ts
│   └── navigation.spec.ts
└── setup.ts            # Vitest setup file
```

---

## Key Points

1. **Vitest** is for unit, component, and integration tests
2. **Playwright** is for E2E tests
3. The two test runners should NOT run the same files
4. Use `npm run test` for regular development (Vitest watch mode)
5. Use `npm run test:e2e` when you need E2E testing (requires server running)

---

## Related Files Modified

- `vitest.config.ts` - Added `exclude: ['tests/e2e/**']`

---

**Status**: All tests now pass cleanly with proper separation! ✅
