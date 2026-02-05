# Phase 3: State Management - Research

**Researched:** 2026-02-05
**Domain:** Pinia state management + Vue composables renaming
**Confidence:** HIGH

## Summary

This phase involves renaming frontend state management terminology from "round" to "phase" across the Pinia store and Vue composables. The work is straightforward but requires careful attention to ensure consistency with the API layer changes completed in Phase 2.

The codebase has a clear pattern: Phase 1 renamed database schema columns, Phase 2 renamed API request/response properties, and now Phase 3 renames the frontend state layer. The store currently uses `currentRound`, `joinedRound`, `leftRound` in getters and references `pairing.round`, `army.round` when filtering data. These now need to match the `phase` terminology returned by the API.

**Primary recommendation:** Update Pinia store state properties and getters first, then rename composables (file and function names), then update composable internals. Run existing tests after each category to catch regressions early.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Pinia | 2.3.1 | Vue state management | Official Vue recommendation, integrated via @pinia/nuxt |
| @pinia/nuxt | 0.9.0 | Nuxt Pinia integration | Auto-imports, SSR support |
| Vue | 3.5.22 | Reactive framework | Composables pattern foundation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vue (ref, computed) | 3.5.22 | Reactive primitives | Inside composables |
| pinia (storeToRefs) | 2.3.1 | Reactive destructuring | When extracting store state |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual find/replace | IDE refactoring tools | IDE tools catch all references automatically |
| Gradual migration | Clean break | API already changed; clean break maintains consistency |

**No installation needed:** All required packages already installed.

## Architecture Patterns

### Current Store Structure
```
app/
├── stores/
│   ├── leagues.js          # Main store - needs round->phase updates
│   └── auth.js             # No changes needed
├── composables/
│   ├── useRoundLookup.js   # Rename to usePhaseLookup.js
│   ├── usePairings.js      # Internal round references
│   ├── useStandings.js     # Internal round references
│   ├── useArmyForm.js      # currentArmy.round property
│   ├── useMatchResults.js  # getRoundMatches function
│   └── [others]            # Various round references
```

### Pattern 1: Pinia Store Property Renaming
**What:** State properties and getter names must match API response shapes
**When to use:** All state that receives data from API or references phase/round concepts
**Example:**
```javascript
// Source: Pinia official documentation patterns
// BEFORE
state: () => ({
  currentRound: 1
})

// AFTER
state: () => ({
  currentPhase: 1  // Matches league.currentPhase from API
})
```

### Pattern 2: Getter Renaming with Internal Logic
**What:** Getters that reference "round" in name and logic
**When to use:** When getter name and implementation both use round terminology
**Example:**
```javascript
// BEFORE
currentRoundPairings(state) {
  const currentRound = this.currentLeague.currentRound || 1
  return state.pairings.filter(p => p.round === currentRound)
}

// AFTER
currentPhasePairings(state) {
  const currentPhase = this.currentLeague.currentPhase || 1
  return state.pairings.filter(p => p.phase === currentPhase)
}
```

### Pattern 3: Composable File and Function Renaming
**What:** Composable file names and exported function names follow `use[Name]` convention
**When to use:** When renaming entire composable concept
**Example:**
```javascript
// BEFORE: app/composables/useRoundLookup.js
export function useRoundLookup(rounds) {
  const getRoundName = (roundNumber) => { ... }
  return { getRoundName, ... }
}

// AFTER: app/composables/usePhaseLookup.js
export function usePhaseLookup(phases) {
  const getPhaseName = (phaseNumber) => { ... }
  return { getPhaseName, ... }
}
```

### Anti-Patterns to Avoid
- **Partial updates:** Don't rename getter without updating internal logic (creates confusing code)
- **Breaking component contracts:** Ensure all components consuming renamed exports are updated
- **Forgetting tests:** Update test files that reference old property names

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Finding all references | Manual grep | IDE "Find All References" | Catches dynamic references |
| Type consistency | Runtime checks | Consistent naming | TypeScript would catch mismatches |
| Computed reactivity | Manual watchers | Pinia getters | Automatic dependency tracking |

**Key insight:** This is a terminology refactoring, not a feature change. The store's behavior stays identical; only names change to match API terminology.

## Common Pitfalls

### Pitfall 1: Mismatched Property Access After API Response
**What goes wrong:** Store accesses `response.data.round` but API now returns `response.data.phase`
**Why it happens:** API response shapes changed in Phase 2 but store code wasn't updated
**How to avoid:** Update all places where API response properties are accessed
**Warning signs:** Data not appearing in UI, undefined values in computed properties

### Pitfall 2: Forgetting Composable Parameter Renames
**What goes wrong:** Composable accepts `rounds` param but callers now pass `phases`
**Why it happens:** Function signature updated but JSDoc and internal usage not updated
**How to avoid:** Update parameter names, JSDoc, and all internal references together
**Warning signs:** Composable receives correct data but internal logic fails

### Pitfall 3: Missing Test Updates
**What goes wrong:** Tests pass but use old terminology, masking actual issues
**Why it happens:** Test mocks may use old property names that coincidentally work
**How to avoid:** Update test files after each category of changes
**Warning signs:** Tests pass but app doesn't work

### Pitfall 4: Player joinedPhase/leftPhase Properties
**What goes wrong:** Player filtering logic breaks because schema renamed `joined_round` to `joined_phase`
**Why it happens:** Database and API changed column names; store still accesses old property names
**How to avoid:** Search for `joinedRound`, `leftRound` in store and composables
**Warning signs:** Active player filtering doesn't work correctly

### Pitfall 5: localStorage Key Confusion
**What goes wrong:** `currentLeagueId` works but similar pattern might suggest `currentRound` storage
**Why it happens:** Assuming consistency where none exists
**How to avoid:** Check actual localStorage usage - current code uses `currentLeagueId`, not `currentRound`
**Warning signs:** N/A - localStorage is fine, just verify no round-based storage exists

## Code Examples

Verified patterns from codebase analysis:

### Store State Property Access Pattern
```javascript
// Source: app/stores/leagues.js analysis
// Current code at line 92-95
// BEFORE
const currentRound = this.currentLeague.currentRound || 1
const army = state.armies.find(a => a.playerId === player.id && a.round === currentRound)

// AFTER
const currentPhase = this.currentLeague.currentPhase || 1
const army = state.armies.find(a => a.playerId === player.id && a.phase === currentPhase)
```

### Player Active Status Check Pattern
```javascript
// Source: app/stores/leagues.js lines 166-170
// BEFORE
const activePlayers = state.players.filter(p =>
  p.isActive &&
  (p.joinedRound || 1) <= currentRound &&
  (!p.leftRound || p.leftRound >= currentRound)
)

// AFTER
const activePlayers = state.players.filter(p =>
  p.isActive &&
  (p.joinedPhase || 1) <= currentPhase &&
  (!p.leftPhase || p.leftPhase >= currentPhase)
)
```

### Composable Function Rename Pattern
```javascript
// Source: app/composables/useRoundLookup.js
// BEFORE
export function useRoundLookup(rounds) {
  const getRoundName = (roundNumber) => {
    const round = rounds.value?.find(r => r.number === roundNumber)
    return round ? round.name : `Round ${roundNumber}`
  }
  return { getRoundName, ... }
}

// AFTER: app/composables/usePhaseLookup.js
export function usePhaseLookup(phases) {
  const getPhaseName = (phaseNumber) => {
    const phase = phases.value?.find(p => p.number === phaseNumber)
    return phase ? phase.name : `Phase ${phaseNumber}`
  }
  return { getPhaseName, ... }
}
```

### Action Parameter Rename Pattern
```javascript
// Source: app/stores/leagues.js line 1140
// BEFORE
async togglePlayerActive(playerId, isActive, currentRound) {
  const response = await $fetch(`/api/players/${playerId}/toggle-active`, {
    method: 'PATCH',
    body: { isActive, currentRound }
  })
}

// AFTER
async togglePlayerActive(playerId, isActive, currentPhase) {
  const response = await $fetch(`/api/players/${playerId}/toggle-active`, {
    method: 'PATCH',
    body: { isActive, currentPhase }
  })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `state.round` | `state.phase` | Phase 3 | State property names |
| `currentRound` getter | `currentPhase` getter | Phase 3 | Getter names |
| `useRoundLookup` | `usePhaseLookup` | Phase 3 | Composable file/function |
| `getRoundMatches` | `getPhaseMatches` | Phase 3 | Function names |

**Deprecated/outdated:**
- `round` terminology in frontend: Replaced with `phase` to match API layer

## Scope Clarification

### In Scope (Phase 3 - State Management)

**STORE-01: Pinia Store State Properties**
1. `currentRound` references in getter calculations -> `currentPhase`
2. `p.joinedRound` filter conditions -> `p.joinedPhase`
3. `p.leftRound` filter conditions -> `p.leftPhase`
4. `p.round` / `a.round` array filtering -> `p.phase` / `a.phase`

**STORE-02: Store Getters and Actions**
1. `currentRoundPairings` getter -> `currentPhasePairings`
2. `paintingLeaderboard` uses `currentRound` -> `currentPhase`
3. `unpairedPlayersCount` uses `currentRound` -> `currentPhase`
4. `activePlayers` uses `currentRound` -> `currentPhase`
5. `togglePlayerActive` action parameter `currentRound` -> `currentPhase`

**STORE-03: Composables**
1. Rename `useRoundLookup.js` -> `usePhaseLookup.js`
2. Rename exported function `useRoundLookup` -> `usePhaseLookup`
3. Rename all internal `round*` functions -> `phase*` functions
4. Update `usePairings.js` internal round references
5. Update `useStandings.js` internal round references
6. Update `useArmyForm.js` round property handling
7. Update `useMatchResults.js` `getRoundMatches` -> `getPhaseMatches`

### Out of Scope (Phase 4 - Frontend Components)
1. Vue components that consume store getters
2. Template bindings using renamed properties
3. Component method parameters

### Edge Cases to Preserve
1. `firstRoundPairingMethod` / `subsequentRoundMethod` in leagueSettings - These refer to "initial round" vs "subsequent rounds" of tournament pairing, not league phases. Keep as-is.
2. `Math.round()` - JavaScript math function, not terminology

## Files Requiring Updates

Based on grep analysis of the codebase:

### Store Files
| File | Updates Needed |
|------|----------------|
| `app/stores/leagues.js` | 15+ round->phase references in getters/actions |

### Composable Files
| File | Updates Needed |
|------|----------------|
| `app/composables/useRoundLookup.js` | Rename file to usePhaseLookup.js, rename all functions |
| `app/composables/usePairings.js` | Internal round parameter and logic |
| `app/composables/useStandings.js` | round parameter in calculateStandings |
| `app/composables/useArmyForm.js` | currentArmy.round property references |
| `app/composables/useMatchResults.js` | getRoundMatches -> getPhaseMatches |

### Test Files
| File | Updates Needed |
|------|----------------|
| `tests/integration/stores/leagues.test.ts` | Update any round-based assertions |

**Total: 1 store file, 5+ composable files, 1 test file**

## Open Questions

Things that couldn't be fully resolved:

1. **Component Import Updates**
   - What we know: Components import composables like `useRoundLookup`
   - What's unclear: Whether to update imports in Phase 3 or Phase 4
   - Recommendation: Update component imports in Phase 4 (Frontend Components) since components are out of scope for Phase 3

2. **Test Coverage Depth**
   - What we know: Integration tests exist for leagues store
   - What's unclear: How comprehensive the test coverage is for renamed functionality
   - Recommendation: Run existing tests after changes; add coverage if gaps found

## Sources

### Primary (HIGH confidence)
- db/schema.ts - Direct codebase inspection showing `phase`, `joinedPhase`, `leftPhase` column names
- app/stores/leagues.js - Direct analysis of current store implementation
- app/composables/*.js - Direct analysis of composable implementations

### Secondary (MEDIUM confidence)
- Pinia documentation (pinia.vuejs.org) - Store patterns and best practices
- Vue documentation (vuejs.org) - Composables naming conventions

### Tertiary (LOW confidence)
- None - All findings verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Directly verified against package.json and codebase
- Architecture: HIGH - Pattern derived from existing codebase structure
- Pitfalls: HIGH - Derived from Phase 1 and Phase 2 experience
- Files to update: HIGH - Complete grep analysis of app/ directory

**Research date:** 2026-02-05
**Valid until:** Indefinite (internal refactoring following established pattern)
