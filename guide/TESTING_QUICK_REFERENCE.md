# Testing Quick Reference

## 🚀 Run Tests

```bash
# Run ALL tests (unit + integration + component + E2E)
npm run test:all

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only  
npm run test:component     # Component tests only
npm run test:e2e           # E2E tests only

# Watch mode (auto-rerun on file changes)
npm test

# Interactive UIs
npm run test:ui            # Vitest UI (for unit/component/integration)
npm run test:e2e:ui        # Playwright UI (for E2E)

# Generate coverage report
npm run test:coverage
```

---

## 📁 Test Structure

```
tests/
├── unit/              # Fast, isolated tests
│   ├── composables/   # Composable functions
│   └── data/          # Static data
├── component/         # Vue component tests
├── integration/       # API + Store tests
│   ├── api/          # API endpoints
│   └── stores/       # Pinia stores
└── e2e/              # Browser automation
```

---

## ✍️ Writing Tests

### Unit Test (Composable)
```typescript
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useMyComposable } from '~/composables/useMyComposable'

describe('useMyComposable', () => {
  it('should do something', () => {
    const data = ref([1, 2, 3])
    const { myFunction } = useMyComposable(data)
    expect(myFunction()).toBe(expected)
  })
})
```

### Integration Test (API)
```typescript
import { describe, it, expect, vi } from 'vitest'
import handler from '../../../server/api/endpoint.get'

vi.mock('../../../db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockResolvedValue([])
  }
}))

describe('GET /api/endpoint', () => {
  it('should return data', async () => {
    const result = await handler({} as any)
    expect(result.success).toBe(true)
  })
})
```

### Component Test
```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '~/components/MyComponent.vue'

describe('MyComponent', () => {
  it('should render', () => {
    const wrapper = mount(MyComponent, {
      props: { title: 'Test' }
    })
    expect(wrapper.text()).toContain('Test')
  })
})
```

### E2E Test
```typescript
import { test, expect } from '@playwright/test'

test('should navigate to page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Expected Title/)
})
```

---

## 🏭 Test Factories

Use factories for consistent test data:

```typescript
import {
  createMockPlayer,
  createMockArmy,
  createMockMatch,
  createMockLeague
} from '../../../test-utils/factories'

// Create with defaults
const player = createMockPlayer()

// Override specific fields
const customPlayer = createMockPlayer({
  name: 'Custom Name',
  wins: 10
})
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

---

## 🐛 Debugging Tests

### Vitest
```bash
# Run single test file
npm test tests/unit/composables/useGameSystems.test.ts

# Run with UI for debugging
npm run test:ui
```

### Playwright
```bash
# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e tests/e2e/health.spec.ts

# Debug with UI
npm run test:e2e:ui
```

---

## 📊 Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

---

## ⚙️ Configuration Files

- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration  
- `tests/setup.ts` - Global test setup
- `test-utils/` - Test utilities and factories

---

## 🎯 Test Naming Convention

- Unit/Component/Integration: `*.test.ts`
- E2E: `*.spec.ts`

---

## 💡 Best Practices

1. **Use factories** for mock data
2. **Mock external dependencies** (DB, APIs)
3. **Test edge cases** (null, empty, invalid)
4. **Keep tests fast** (mock expensive operations)
5. **One assertion per test** (when possible)
6. **Descriptive test names** ("should do X when Y")

---

## 📚 Documentation

- Full guide: `guide/TESTING_SUITE.md`
- Implementation summary: `guide/TESTING_IMPLEMENTATION_SUMMARY.md`
- This quick reference: `guide/TESTING_QUICK_REFERENCE.md`

---

**Last Updated**: October 16, 2025
