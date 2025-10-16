# Testing Suite Documentation

## Overview

This project uses a **4-layer testing approach** for comprehensive coverage:

1. **Unit Tests** - Fast, isolated tests for composables and utilities
2. **Component Tests** - Vue component testing with mocked dependencies
3. **Integration Tests** - API endpoint testing with mocked database
4. **E2E Tests** - Full browser automation for critical user journeys

---

## Test Structure

```
tests/
├── unit/
│   ├── composables/          # Composable function tests
│   │   ├── useGameSystems.test.ts
│   │   ├── usePaintingStats.test.ts
│   │   ├── usePlayerStats.test.ts
│   │   └── useMatchResults.test.ts
│   └── data/                 # Static data tests
│       └── game-systems.test.ts
├── component/
│   ├── LeagueCard.test.ts
│   ├── LoginButton.test.ts
│   └── PaintingProgress.test.ts
├── integration/
│   ├── api/                  # API endpoint tests
│   │   ├── health.test.ts
│   │   ├── leagues.test.ts
│   │   ├── armies.test.ts
│   │   ├── game-systems.test.ts
│   │   └── factions.test.ts
│   └── stores/               # Pinia store tests
│       └── leagues.test.ts
└── e2e/
    ├── health.spec.ts
    ├── navigation.spec.ts
    ├── auth.spec.ts
    ├── league-creation.spec.ts
    └── match-recording.spec.ts
```

---

## Quick Start

### Run All Tests
```bash
npm run test:all
```

### Run Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Component tests only
npm run test:component

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e
```

### Watch Mode (Development)
```bash
# Run tests in watch mode
npm test

# Open Vitest UI
npm run test:ui

# Open Playwright UI
npm run test:e2e:ui
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
# Open coverage/index.html in browser
```

---

## Test Technologies

### Unit/Component/Integration Testing
- **Vitest** - Fast unit test framework (Vite-powered)
- **@vue/test-utils** - Official Vue component testing library
- **happy-dom** - Lightweight DOM implementation
- **@vitest/ui** - Interactive UI for test exploration
- **@vitest/coverage-v8** - Code coverage reporting

### E2E Testing
- **Playwright** - Modern browser automation
- **@playwright/test** - Test runner with fixtures
- **@nuxt/test-utils** - Nuxt-specific testing utilities

---

## Writing Tests

### Unit Test Example (Composable)

```typescript
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useGameSystems } from '~/composables/useGameSystems'
import { createMockGameSystem } from '../../../test-utils/factories'

describe('useGameSystems', () => {
  const mockGameSystems = ref([
    createMockGameSystem({ id: 1, name: 'Warhammer 40,000' })
  ])

  it('should return game system name', () => {
    const { getGameSystemName } = useGameSystems(mockGameSystems)
    expect(getGameSystemName(1)).toBe('40k')
  })
})
```

### Integration Test Example (API Endpoint)

```typescript
import { describe, it, expect, vi } from 'vitest'
import handler from '../../../server/api/health.get'

vi.mock('../../../db', () => ({
  db: {
    execute: vi.fn().mockResolvedValue([{ health: 1 }])
  }
}))

describe('GET /api/health', () => {
  it('should return ok status', async () => {
    const result = await handler({} as any)
    expect(result.status).toBe('ok')
  })
})
```

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PaintingProgress from '~/components/PaintingProgress.vue'

describe('PaintingProgress', () => {
  it('should render leaderboard', () => {
    const wrapper = mount(PaintingProgress, {
      props: {
        leaderboard: [],
        currentRound: 1
      }
    })
    expect(wrapper.find('h3').text()).toContain('Painting Progress')
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('should load home page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Escalation League/)
})
```

---

## Test Utilities

### Factories (`test-utils/factories.ts`)

Mock data generators for consistent test data:

```typescript
import { createMockPlayer, createMockArmy, createMockLeague } from '../test-utils/factories'

const player = createMockPlayer({ name: 'Custom Name' })
const army = createMockArmy({ totalPoints: 1000 })
const league = createMockLeague({ gameSystemId: 2 })
```

Available factories:
- `createMockPlayer()`
- `createMockArmy()`
- `createMockMatch()`
- `createMockLeague()`
- `createMockRound()`
- `createMockGameSystem()`
- `createMockFaction()`
- `createMockMission()`
- `createMockUser()`

### Vue Test Utils Config (`test-utils/vue-test-utils.ts`)

Global configuration for component tests:
- Component stubs (NuxtLink, ClientOnly)
- Global mocks ($route, $router)

---

## Configuration Files

### `vitest.config.ts`
- Test environment: happy-dom
- Coverage provider: v8
- Path aliases: `~` and `@` point to `./app`
- Setup file: `./tests/setup.ts`

### `playwright.config.ts`
- Test directory: `./tests/e2e`
- Base URL: `http://localhost:3000`
- Browsers: Chromium, Firefox, WebKit
- Auto-starts dev server before tests

### `tests/setup.ts`
- Global mocks for Nuxt auto-imports
- Suppresses console warnings in tests

---

## Best Practices

### 1. Test File Naming
- Unit tests: `*.test.ts`
- E2E tests: `*.spec.ts`
- Match filename to tested file

### 2. Test Organization
```typescript
describe('ComponentName or FunctionName', () => {
  describe('specific feature', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### 3. Use Test Factories
Always use factory functions for mock data to ensure consistency:
```typescript
// ✅ Good
const player = createMockPlayer({ wins: 5 })

// ❌ Avoid
const player = { id: 1, name: 'Test', wins: 5, ... }
```

### 4. Mock External Dependencies
```typescript
vi.mock('~/composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: { name: 'Test User' }
  }))
}))
```

### 5. Test Edge Cases
- Null/undefined inputs
- Empty arrays
- Invalid IDs
- Boundary conditions

### 6. Keep Tests Fast
- Mock expensive operations (API calls, database queries)
- Use unit tests for business logic
- Reserve E2E tests for critical user flows only

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - run: npm run test:coverage
```

---

## Coverage Goals

| Test Type | Target Coverage |
|-----------|----------------|
| Unit Tests | 80%+ |
| Integration Tests | 70%+ |
| Component Tests | 60%+ |
| E2E Tests | Critical paths |

---

## Troubleshooting

### Tests Fail on Import
**Issue**: `Cannot find module '~/composables/...'`

**Solution**: Check alias configuration in `vitest.config.ts`:
```typescript
resolve: {
  alias: {
    '~': resolve(__dirname, './app'),
    '@': resolve(__dirname, './app')
  }
}
```

### E2E Tests Timeout
**Issue**: Playwright tests timeout waiting for server

**Solution**: Increase timeout in `playwright.config.ts`:
```typescript
webServer: {
  timeout: 120000 // 2 minutes
}
```

### Database Mocks Not Working
**Issue**: Database calls fail in tests

**Solution**: Ensure proper vi.mock() syntax:
```typescript
vi.mock('../../../db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([])
  }
}))
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## Next Steps

1. ✅ All test infrastructure is set up
2. ✅ Sample tests created for each layer
3. 📝 Add more tests for remaining composables
4. 📝 Add tests for remaining API endpoints
5. 📝 Add tests for remaining components
6. 📝 Add E2E tests for critical user flows (auth, league creation, match recording)
7. 📝 Integrate tests into CI/CD pipeline
8. 📝 Set up coverage thresholds

---

**Last Updated**: October 16, 2025  
**Maintained By**: Development Team
