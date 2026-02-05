# Testing Patterns

**Analysis Date:** 2026-02-05

## Test Framework

**Runner:**
- Vitest 3.2.4
- Config: `vitest.config.ts`
- Environment: happy-dom (lightweight DOM for component testing)

**Assertion Library:**
- Vitest built-in expect API (compatible with Jest syntax)

**Component Testing Library:**
- @vue/test-utils 2.4.6 - Mount and test Vue components

**E2E Testing:**
- @playwright/test 1.56.0 - End-to-end testing (not currently active)

**Run Commands:**
```bash
npm run test              # Run all tests in watch mode
npm run test:unit        # Run unit tests only
npm run test:component   # Run component tests only
npm run test:integration # Run integration tests only
npm run test:e2e         # Run Playwright E2E tests
npm run test:ui          # Run tests with Vitest UI
npm run test:coverage    # Run tests with coverage report
npm run test:all         # Run unit + integration + component + e2e sequentially
```

## Test File Organization

**Location:**
- Unit tests: `tests/unit/[feature]/[name].test.ts`
- Component tests: `tests/component/[component].test.ts`
- Integration tests: `tests/integration/api/[endpoint].test.ts` or `stores/[store].test.ts`
- E2E tests: `tests/e2e/[feature].spec.ts` (Playwright)

**Naming:**
- Test files: `[name].test.ts` or `[name].spec.ts`
- Test suites: Organized in subdirectories by feature

**Structure:**
```
tests/
├── setup.ts                              # Global test setup
├── unit/
│   ├── composables/
│   │   ├── useAuth.test.ts
│   │   ├── usePlayerStats.test.ts
│   │   └── ...
│   └── data/
│       └── game-systems.test.ts
├── component/
│   ├── LeagueCard.test.ts
│   ├── LoadingSpinner.test.ts
│   └── ...
└── integration/
    ├── api/
    │   ├── armies.test.ts
    │   ├── leagues.test.ts
    │   └── health.test.ts
    └── stores/
        └── leagues.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      const wrapper = mount(Component)
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Features', () => {
    it('should do something', () => {
      // Test implementation
    })
  })
})
```

**Patterns:**
- Use `describe()` to organize tests logically into groups
- Use `it()` for individual test cases (or `test()`)
- Use `beforeEach()` for setup that runs before each test
- Use `afterEach()` for cleanup (not commonly used)
- Organize tests by feature/behavior within describe blocks

## Mocking

**Framework:** Vitest's `vi` object (compatible with Jest API)

**Patterns - Component Mocks:**
```typescript
// Mock stores
vi.mock('pinia', () => ({
  storeToRefs: () => ({
    gameSystems: ref([
      { id: 1, name: 'Warhammer 40,000', shortName: '40k' }
    ])
  })
}))

// Mock composables
vi.mock('~/composables/useFormatting', () => ({
  useFormatting: () => ({
    formatDate: (date: string) => new Date(date).toLocaleDateString()
  })
}))

// Mock icon libraries
vi.mock('lucide-vue-next', () => ({
  Users: { name: 'Users', template: '<svg data-testid="users-icon"></svg>' },
  Calendar: { name: 'Calendar', template: '<svg data-testid="calendar-icon"></svg>' }
}))
```

**Patterns - Function Mocks:**
```typescript
// Create a spy
const mockFetchUser = vi.fn().mockResolvedValue(undefined)

// Clear all mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})

// Verify calls
expect(mockFetchUser).toHaveBeenCalled()
expect(mockFetchUser).toHaveBeenCalledWith(expectedArg)
expect(mockFetchUser).toHaveBeenCalledTimes(1)
```

**What to Mock:**
- External dependencies (API calls, libraries)
- Pinia stores (wrap with `storeToRefs()`)
- Composables that have side effects
- Icon components (replace with simple SVG stubs)
- Nuxt auto-imports (`defineEventHandler`, `createError`, `useState`, `useRoute`, `useRouter`)

**What NOT to Mock:**
- The component/function being tested
- Built-in JavaScript functions
- Data/utility functions without side effects
- Vue reactive utilities (ref, computed, watch)

## Fixtures and Factories

**Test Data:**
```typescript
// From test-utils/factories.ts
export const createMockPlayer = (overrides = {}) => ({
  id: 1,
  name: 'Test Player',
  faction: 'Space Marines',
  wins: 5,
  losses: 2,
  draws: 1,
  totalPoints: 500,
  createdAt: new Date('2025-01-01'),
  ...overrides
})

export const createMockLeague = (overrides = {}) => ({
  id: 1,
  name: 'Test League',
  description: 'A test league',
  gameSystemId: 1,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-03-31'),
  currentRound: 1,
  createdAt: new Date('2025-01-01'),
  ...overrides
})

// Usage in tests
const player = createMockPlayer({ wins: 10, losses: 0 })
const league = createMockLeague({ name: 'My Custom League' })
```

**Available Factories in `test-utils/factories.ts`:**
- `createMockPlayer(overrides)` - Player with stats
- `createMockArmy(overrides)` - Army list with units
- `createMockMatch(overrides)` - Match result
- `createMockLeague(overrides)` - League metadata
- `createMockRound(overrides)` - League round
- `createMockGameSystem(overrides)` - Game system
- `createMockFaction(overrides)` - Faction
- `createMockMission(overrides)` - Mission
- `createMockUser(overrides)` - User with auth data

**Location:**
- `/Users/aurel/Documents/works/40k-escalation/test-utils/factories.ts` - Mock data factories
- Imported as: `import { createMockPlayer } from '../../../test-utils/factories'`

## Coverage

**Requirements:** No hard target enforced; optional measurement

**Configuration in `vitest.config.ts`:**
```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  include: [
    'app/**/*.{js,ts,vue}',
    'server/**/*.{js,ts}'
  ],
  exclude: [
    'node_modules/',
    '.nuxt/',
    'tests/',
    '*.config.ts',
    'migrations/',
    'guide/'
  ]
}
```

**View Coverage:**
```bash
npm run test:coverage
# Coverage reports generated in coverage/ directory
# HTML report available at coverage/index.html
```

## Test Types

**Unit Tests:**
- Scope: Individual composables and utility functions
- Approach: Test pure functions with mocked dependencies
- Location: `tests/unit/composables/`, `tests/unit/data/`
- Example: `tests/unit/composables/usePlayerStats.test.ts`
  - Tests calculation functions: `getWinPercentage()`, `getTotalGames()`
  - Uses mock players from factories
  - No API calls or external dependencies
  - Direct function calls: `const { getWinPercentage } = usePlayerStats()`

**Component Tests:**
- Scope: Vue components in isolation
- Approach: Mount component with mocked dependencies, test rendering and events
- Location: `tests/component/`
- Example: `tests/component/LeagueCard.test.ts` (517 lines)
  - Tests rendering logic (badges, stats, dates)
  - Tests prop variants (my-league, public, public-guest)
  - Tests user interactions (button clicks, event emission)
  - Tests conditional rendering based on props
  - Mocks stores, composables, and icon libraries
  - Uses `mountWithMocks()` helper function

**Integration Tests:**
- Scope: API endpoints or store interactions
- Approach: Test data flow between components/stores
- Location: `tests/integration/api/`, `tests/integration/stores/`
- Current state: Minimal implementation
  - Example: `tests/integration/api/health.test.ts` - Placeholder test
  - Note: "Integration tests require dev server running. Run `npm run dev` then `npm run test:integration`"

## Common Patterns

**Async Testing:**
```typescript
it('should handle async operations', async () => {
  const mockFn = vi.fn().mockResolvedValue({ data: 'test' })
  await mockFn()
  expect(mockFn).toHaveBeenCalled()
})

// In component tests with onMounted
it('should fetch on mount', async () => {
  const wrapper = mount(Component)
  await wrapper.vm.$nextTick()
  expect(mockFetch).toHaveBeenCalled()
})
```

**Error Testing:**
```typescript
it('should handle errors gracefully', () => {
  const mockFn = vi.fn().mockRejectedValue(new Error('API Error'))
  // Test error handling
})

it('should show error message', () => {
  const wrapper = mount(Component)
  // Trigger error condition
  expect(wrapper.find('.error-message').exists()).toBe(true)
})
```

**Event Testing:**
```typescript
it('emits click event', async () => {
  const wrapper = mount(LeagueCard, {
    props: { league: mockMyLeague }
  })
  await wrapper.trigger('click')
  expect(wrapper.emitted('click')).toBeTruthy()
  expect(wrapper.emitted('click')?.[0]).toEqual([1])
})

it('stops event propagation', async () => {
  const wrapper = mount(Component)
  await wrapper.find('[data-testid="button"]').trigger('click')
  // Event should not propagate up
  expect(wrapper.emitted('parent-event')).toBeFalsy()
})
```

**Prop Validation:**
```typescript
it('validates props with validator function', () => {
  const wrapper = mount(LeagueCard, {
    props: {
      league: { id: 1, name: 'Test' },
      variant: 'my-league'
    }
  })
  expect(wrapper.props('variant')).toBe('my-league')
})
```

**Pinia Store Setup in Tests:**
```typescript
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
  setActivePinia(createPinia())
})

it('should use auth store', async () => {
  const { useAuth } = await import('../../../app/composables/useAuth')
  const auth = useAuth()
  expect(auth.user.value).toBeNull()
})
```

## Setup Files

**Global Setup: `tests/setup.ts`**
- Mocks Nuxt auto-imports: `defineEventHandler`, `createError`, `useState`, `useRoute`, `useRouter`, `navigateTo`
- Mocks runtime config: `useRuntimeConfig()`
- Suppresses console warnings/errors during tests
- Allows tests to use Nuxt functions without special setup

## Test Database

**Configuration: `test-utils/test-db.ts`**
- Provides database connection for integration tests
- Can be used for testing database queries

## Vue Test Utils Configuration

**Location: `test-utils/vue-test-utils.ts`**
- Global component stubs:
  - `NuxtLink` → Simple `<a>` tag
  - `ClientOnly` → Div wrapper
- Global mocks for router and route objects
- Helper function `createWrapper()` for consistent mount setup

## Testing Best Practices Observed

1. **Descriptive test names** - Tests describe what should happen
2. **Arrange-Act-Assert pattern** - Setup, execute, verify
3. **One assertion concept per test** - Though some tests verify multiple related assertions
4. **Fixtures for reusable data** - Mock factories used across tests
5. **Isolated test scope** - Each test independent with beforeEach cleanup
6. **Meaningful test descriptions** - Using `describe()` to organize logically

---

*Testing analysis: 2026-02-05*
