# Coding Conventions

**Analysis Date:** 2026-02-05

## Naming Patterns

**Files:**
- Vue components: PascalCase (e.g., `LeagueCard.vue`, `LoadingSpinner.vue`)
- Composables: camelCase with `use` prefix (e.g., `useAuth.js`, `useToast.js`, `usePlayerStats.js`)
- API routes: kebab-case with file extension as HTTP method (e.g., `leagues.get.ts`, `leagues.post.ts`, `factions/[id].delete.ts`)
- Stores: camelCase with file naming (e.g., `leagues` and `auth` in `app/stores/`)
- Data/utility files: camelCase (e.g., `game-systems.test.ts`)

**Functions:**
- Composables export named functions with `use` prefix: `export function useAuth() {}`
- API handlers use default export: `export default defineEventHandler(async (event) => {})`
- Helper functions: camelCase (e.g., `getRoleBadgeClass()`, `getWinPercentage()`)
- Private/internal functions: camelCase (e.g., `formatDate()`, `handleClick()`)

**Variables:**
- Reactive refs and state: camelCase (e.g., `initialized`, `toasts`, `gameSystems`)
- Constants: camelCase within module scope (e.g., `nextId`, `mockMyLeague`)
- Props/computed properties: camelCase (e.g., `isAuthenticated`, `isCurrent`, `isMyLeague`)
- Destructured values: preserve original naming (e.g., `{ storeToRefs, ref, computed }`)

**Types:**
- Interface names: PascalCase (implicit from generic usage)
- Type aliases: PascalCase (not explicitly used; relies on TypeScript inference)

## Code Style

**Formatting:**
- Indentation: 2 spaces (enforced by ESLint rule `"indent": ["error", 2, { "SwitchCase": 1 }]`)
- Vue script indent: 2 spaces with baseIndent 1
- Vue HTML indent: 2 spaces
- No trailing spaces (enforced by `"no-trailing-spaces": "error"`)
- Newline at end of file (enforced by `"eol-last": ["error", "always"]`)

**Linting:**
- Tool: ESLint with TypeScript support and Vue plugin
- Config: `/Users/aurel/Documents/works/40k-escalation/eslint.config.ts`
- Key rules enforced:
  - `@typescript-eslint/no-unused-vars`: Error, ignoring parameters starting with `_`
  - `@typescript-eslint/no-explicit-any`: Warn
  - `@typescript-eslint/ban-ts-comment`: Warn
  - `vue/multi-word-component-names`: Off
  - Indentation: 2 spaces with switch case at 1 level
  - No trailing spaces
  - Always end with newline

**Format Command:**
```bash
npm run lint:fix    # Fix linting issues
```

## Import Organization

**Order:**
1. Vue/Nuxt imports (e.g., `import { ref, computed } from 'vue'`)
2. Library imports (e.g., `import { storeToRefs } from 'pinia'`)
3. Icon library imports (e.g., `import { Users, Calendar } from 'lucide-vue-next'`)
4. Store imports (e.g., `import { useLeaguesStore } from '~/stores/leagues'`)
5. Composable imports (e.g., `import { useFormatting } from '~/composables/useFormatting'`)
6. Relative/local imports (e.g., `import { db } from '../../../db'`)

**Path Aliases:**
- `~`: Aliases to `/Users/aurel/Documents/works/40k-escalation/app/` (client code)
- `@`: Aliases to `/Users/aurel/Documents/works/40k-escalation/app/` (same as ~)
- Configured in `vitest.config.ts` and used throughout the codebase

## Error Handling

**Patterns in Server (API Routes):**
- Validation happens first with custom errors:
  ```typescript
  if (!name || !gameSystemId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name and gameSystemId are required'
    })
  }
  ```
- Try-catch blocks wrap all operations:
  ```typescript
  try {
    // Operation
  } catch (error) {
    console.error('Error creating faction:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create faction'
    })
  }
  ```
- Response format: `{ success: true, data: result, message?: string }`
- All database operations in try-catch with generic 500 errors

**Patterns in Client (Composables):**
- Toast notifications for user feedback:
  ```typescript
  const { toastSuccess, toastError } = useToast()
  toastSuccess('Operation completed')
  toastError('Something went wrong', 5000)
  ```
- Store mutations handle state changes
- Composables expose error state (e.g., `isLoading`, `error` refs)
- No console.error in production code; logging only for debugging

**Authentication/Authorization:**
- Server-side guard: `await requireAdmin(event)` in `server/utils/auth.ts`
- Used in admin API routes (e.g., `server/api/admin/factions.post.ts`)

## Logging

**Framework:** console methods (native)

**Patterns:**
- Server routes: Log errors with `console.error('Error [context]:', error)`
- Client code: Minimal logging; use toast notifications for user feedback
- No console logs in production code except error cases
- Test setup suppresses console warnings: `console.warn = vi.fn()`, `console.error = vi.fn()`

## Comments

**When to Comment:**
- JSDoc for exported functions in composables (e.g., `usePlayerStats.js`)
- Function parameter documentation:
  ```javascript
  /**
   * Calculate win percentage for a player
   * @param {Object} player - Player object with wins, losses, draws
   * @returns {number} Win percentage (0-100)
   */
  ```
- Inline comments for non-obvious logic in components
- Section comments for template blocks in Vue (e.g., `<!-- League Header -->`)
- TODO comments for future work (e.g., `// TODO: Add authentication when Auth0 is implemented`)

**JSDoc/TSDoc:**
- Used in composables but inconsistent in API routes
- Parameter types documented in composables (see `usePlayerStats.js`)
- Vue components use less documentation; props validated inline

## Function Design

**Size:**
- Composable functions: 20-100 lines typically
- API handlers: 20-50 lines with error handling
- Helper methods: 5-20 lines

**Parameters:**
- API handlers receive `event` parameter from Nuxt
- Composables receive no parameters; return object with methods/refs
- Helper functions receive specific parameters (e.g., `getRoleBadgeClass(role)`)
- Use object destructuring for multiple parameters

**Return Values:**
- Composables return objects: `{ method1, method2, ref1, ref2 }`
- API routes return objects: `{ success: boolean, data: any, message?: string }`
- Helper functions return primitive values or computed results
- Vue computed properties return single values

## Module Design

**Exports:**
- Composables: Default export is function, usually named `use[Feature]`
  ```javascript
  export function useAuth() { ... }
  ```
- API routes: Default export is event handler
  ```typescript
  export default defineEventHandler(async (event) => { ... })
  ```
- Test utilities: Named exports for factories
  ```typescript
  export const createMockPlayer = (overrides = {}) => { ... }
  ```

**Barrel Files:**
- Not observed in current codebase
- Stores and composables imported directly from their files

**Single Responsibility:**
- Each composable has one concern (e.g., `useToast` for notifications, `useAuth` for auth state)
- Each API route handles one operation (GET, POST, DELETE, etc.)
- Components are focused on rendering and emitting events

## Specific Language Notes

**Vue 3 Composition API:**
- Use `<script setup>` syntax in components (`LeagueCard.vue`)
- Reactive state with `ref()` and `computed()`
- Import Pinia store and use `storeToRefs()` for reactivity:
  ```typescript
  const store = useLeaguesStore()
  const { gameSystems } = storeToRefs(store)
  ```
- Define props and emits at top of script:
  ```typescript
  const props = defineProps({ league: { type: Object, required: true } })
  const emit = defineEmits(['click', 'settings', 'leave', 'delete', 'join'])
  ```

**TypeScript:**
- Optional/loose typing; `@typescript-eslint/no-explicit-any` is warning, not error
- Implicit any for function parameters in some composables (JavaScript style)
- API routes import from `~/db/schema` for type information

**Error Handling with defineError:**
- Nuxt's `createError()` used for HTTP errors
- Custom status codes and messages
- Caught and logged in try-catch blocks

---

*Convention analysis: 2026-02-05*
