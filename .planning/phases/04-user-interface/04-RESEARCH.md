# Phase 4: User Interface - Research

**Researched:** 2026-02-05
**Domain:** Vue 3 component props, template text, and URL routes renaming (round -> phase)
**Confidence:** HIGH

## Summary

This phase involves updating the Vue.js user interface layer to use "Phase" terminology instead of "Round" throughout all components, props, template text, and URL routes. The API layer (Phase 2) and state management layer (Phase 3) have already been updated, so this phase completes the user-facing terminology migration.

The codebase analysis reveals 25+ component files with "round" references, spanning component props, template text, computed properties, and user-facing labels. The changes are straightforward string replacements but require careful attention to ensure all user-visible text and internal component references are updated consistently.

**Primary recommendation:** Start with component props (interface contracts), then update internal component logic, then update template text. This order ensures TypeScript/IDE refactoring can catch cascading issues. Test the application visually after each major component to verify no regressions.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue | 3.5.22 | Reactive framework | Component template and reactive system |
| Nuxt | 4.1.2 | Vue meta-framework | File-based routing, auto-imports |
| lucide-vue-next | 0.545.0 | Icon library | Already in use for all icons |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| storeToRefs | (Pinia) | Reactive store extraction | When accessing renamed store properties |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual find/replace | IDE refactoring | IDE tools catch TypeScript references |
| Gradual migration | Clean break | State already changed; clean break required |

**No installation needed:** All required packages already installed.

## Architecture Patterns

### Component Update Order
```
1. Component Props (contracts)
   ├── currentRound -> currentPhase
   └── rounds -> phases

2. Internal Component Logic
   ├── Computed properties
   ├── Refs (selectedRound -> selectedPhase)
   └── Method parameters

3. Template Text
   ├── User-visible labels ("Round 1" -> "Phase 1")
   ├── Select option text
   └── Empty state messages

4. URL Routes (if applicable)
   └── Verify no /rounds/ routes exist
```

### Pattern 1: Component Prop Renaming
**What:** Props that receive round data from parent components
**When to use:** All components receiving round/phase data as props
**Example:**
```javascript
// Source: app/components/views/ArmyListsView.vue analysis
// BEFORE (line 42-49)
const props = defineProps({
  currentRound: {
    type: Number,
    required: true
  },
  rounds: {
    type: Array,
    required: true
  }
})

// AFTER
const props = defineProps({
  currentPhase: {
    type: Number,
    required: true
  },
  phases: {
    type: Array,
    required: true
  }
})
```

### Pattern 2: Ref and Computed Renaming
**What:** Internal component state using "round" terminology
**When to use:** All refs, computed properties, and methods using round terminology
**Example:**
```javascript
// Source: app/components/views/PairingsView.vue analysis
// BEFORE
const selectedRound = ref(null)
const selectedRoundPairings = computed(() => {
  return props.pairings.filter(p => p.round === selectedRound.value)
})

// AFTER
const selectedPhase = ref(null)
const selectedPhasePairings = computed(() => {
  return props.pairings.filter(p => p.phase === selectedPhase.value)
})
```

### Pattern 3: Template Text Updates
**What:** User-visible text in templates
**When to use:** All labels, headings, messages visible to users
**Example:**
```vue
<!-- BEFORE -->
<option value="">All Rounds</option>
<span>Round {{ match.round }}</span>

<!-- AFTER -->
<option value="">All Phases</option>
<span>Phase {{ match.phase }}</span>
```

### Pattern 4: Parent Component Prop Passing
**What:** Parent pages passing props to view components
**When to use:** All pages that consume view components with renamed props
**Example:**
```vue
<!-- Source: app/pages/armies.vue -->
<!-- BEFORE -->
<ViewsArmyListsView
  :current-round="league.currentRound"
  :rounds="league.rounds"
/>

<!-- AFTER -->
<ViewsArmyListsView
  :current-phase="league.currentPhase"
  :phases="league.phases"
/>
```

### Anti-Patterns to Avoid
- **Partial template updates:** Renaming props without updating all template usages
- **Inconsistent casing:** Mix of "round" and "Round" in text (should be "Phase" capitalized)
- **Breaking composable exports:** Composable exports like `selectedRound` need renaming WITH consumers

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Finding all references | Manual grep | IDE "Find All References" | Catches dynamic references |
| Component props validation | Manual checking | Vue DevTools | Shows prop passing issues |
| Template binding errors | Manual testing | Browser console | Shows Vue warnings |

**Key insight:** This is a terminology refactoring with cascading changes. The changes are straightforward but numerous - thoroughness is more important than cleverness.

## Common Pitfalls

### Pitfall 1: Missing Store Property Access
**What goes wrong:** Component accesses `league.currentRound` but store now returns `league.currentPhase`
**Why it happens:** Phase 3 renamed store getters but component code wasn't updated
**How to avoid:** Update all template bindings that access store data
**Warning signs:** Undefined values in UI, missing data in components

### Pitfall 2: Composable Export Mismatch
**What goes wrong:** Component imports `selectedRound` from composable but composable exports `selectedPhase`
**Why it happens:** Composable internals renamed in Phase 3 but exported names preserved "for Phase 4"
**How to avoid:** Rename composable exports AND update all consumers simultaneously
**Warning signs:** Import errors, undefined function errors

### Pitfall 3: Inconsistent User-Facing Text
**What goes wrong:** Some places say "Round" and others say "Phase"
**Why it happens:** Missed template text during updates
**How to avoid:** Comprehensive grep for user-visible strings
**Warning signs:** Visual inconsistency, user confusion

### Pitfall 4: Form Field Names Not Updated
**What goes wrong:** Form submits `round` but API expects `phase`
**Why it happens:** v-model bindings and form submission data not updated
**How to avoid:** Check all form submissions against API expectations
**Warning signs:** API errors, data not saving

### Pitfall 5: Select/Dropdown Option Values
**What goes wrong:** Dropdown options use `round.number` but filter logic expects `phase.number`
**Why it happens:** Option value bindings not updated
**How to avoid:** Check all select elements for value bindings
**Warning signs:** Filters don't work, wrong options selected

## Code Examples

Verified patterns from codebase analysis:

### Store Property Access in Templates
```vue
<!-- Source: app/pages/armies.vue current state -->
<!-- Parent page must update how it passes league data -->
:current-round="league.currentRound"   <!-- league.currentPhase from store -->
:rounds="league.rounds"                <!-- league.phases from store -->
```

### Composable Return Value Renaming
```javascript
// Source: app/composables/useArmyFiltering.js
// Current exports that need renaming:
return {
  selectedRound,      // -> selectedPhase
  setRoundFilter,     // -> setPhaseFilter
  getArmyCountForRound  // -> getArmyCountForPhase
}
```

### Template Text in Timeline Filter
```vue
<!-- Source: app/components/views/ArmyListsView.vue lines 368-455 -->
<!-- Current template text that needs updating -->
<h4>Filter by Round</h4>                    <!-- Filter by Phase -->
<option value="">All Rounds</option>        <!-- All Phases -->
<div>Round {{ round.number }}</div>         <!-- Phase {{ phase.number }} -->
```

### Match Form Round Selection
```vue
<!-- Source: app/components/views/MatchesView.vue lines 821-827 -->
<label>Round</label>                        <!-- Phase -->
<select v-model.number="newMatch.round">    <!-- newMatch.phase -->
  <option value="">Select Round</option>    <!-- Select Phase -->
  <option v-for="round in leagueRounds">    <!-- phase in leaguePhases -->
    {{ round.name }}
  </option>
</select>
```

## Scope Clarification

### In Scope (Phase 4 - User Interface)

**UI-01: Component Props and Data Properties**
1. ArmyListsView.vue: `currentRound` -> `currentPhase`, `rounds` -> `phases`
2. PairingsView.vue: `selectedRound` -> `selectedPhase`, internal round refs
3. MatchesView.vue: `leagueRounds` -> `leaguePhases`, `newMatch.round` -> `newMatch.phase`
4. PlayersView.vue: `currentRound` prop -> `currentPhase`
5. All parent pages: Update prop bindings

**UI-02: Template Text Updates**
1. All "Round X" labels -> "Phase X"
2. All "Select Round" options -> "Select Phase"
3. All "All Rounds" filters -> "All Phases"
4. Form field labels
5. Empty state messages
6. Timeline filter headers

**UI-03: Composable Export Renaming (with consumers)**
1. `useArmyFiltering.js`: Rename exports AND update ArmyListsView.vue
2. Any other composables with round exports

**UI-03 Alternate: URL Routes**
- Verify no `/rounds/` routes exist in pages directory
- Current analysis shows no round-based routes

### Out of Scope
1. Database schema (Phase 1 - complete)
2. API endpoints (Phase 2 - complete)
3. Store state/getters (Phase 3 - complete)
4. Backend logic

### Items Already Complete from Phase 3
1. `usePhaseLookup.js` - Already renamed and using phase terminology
2. `useMatchResults.js` - Already has `getPhaseMatches()` function
3. Store getters: `currentPhasePairings`, `activePlayers` - Already use phase
4. `useArmyManagement.js` - Partial updates done in Phase 3

### Items Partially Updated (Verify Complete)
1. `ArmyListsView.vue` - Partially updated in Phase 3 blocking fix
2. `useArmyFiltering.js` - Internal logic uses `phase` but exports use `round`

## Files Requiring Updates

Based on comprehensive grep analysis:

### High Priority - Component Props
| File | Updates Needed |
|------|----------------|
| `app/pages/armies.vue` | `:current-round` -> `:current-phase`, `:rounds` -> `:phases` |
| `app/pages/players.vue` | `:currentRound` -> `:currentPhase` |
| `app/components/views/ArmyListsView.vue` | Props definition, internal refs |
| `app/components/views/PairingsView.vue` | `selectedRound` refs, round options |
| `app/components/views/MatchesView.vue` | `leagueRounds`, form fields |
| `app/components/views/PlayersView.vue` | `currentRound` prop |

### Medium Priority - Template Text
| File | Updates Needed |
|------|----------------|
| `app/components/views/ArmyListsView.vue` | 20+ template text occurrences |
| `app/components/views/MatchesView.vue` | Filter labels, table headers |
| `app/components/views/PairingsView.vue` | Round selector, labels |
| `app/components/MatchCard.vue` | Round badge display |
| `app/pages/leagues/create.vue` | Round configuration section |
| `app/pages/leagues/join.vue` | Current Round display |
| `app/pages/join/[token].vue` | Current Round display |
| `app/pages/index.vue` | Marketing text about rounds |

### Lower Priority - Composable Exports
| File | Updates Needed |
|------|----------------|
| `app/composables/useArmyFiltering.js` | `selectedRound` -> `selectedPhase`, etc. |

### Admin Components (Lower Priority)
| File | Updates Needed |
|------|----------------|
| `app/components/admin/LeaguesManager.vue` | Round references |
| `app/components/admin/MatchesManager.vue` | Round references |

**Total: 15+ component/page files, 1 composable file**

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `currentRound` prop | `currentPhase` prop | Phase 4 | Component interface |
| `rounds` prop | `phases` prop | Phase 4 | Component interface |
| "Round X" text | "Phase X" text | Phase 4 | User experience |
| `selectedRound` ref | `selectedPhase` ref | Phase 4 | Internal state naming |

**Preserved (not round->phase):**
- `firstRoundPairingMethod` / `subsequentRoundMethod` - Tournament pairing settings, not phase terminology

## Open Questions

Things that couldn't be fully resolved:

1. **League Creation Form ("rounds" section)**
   - What we know: `app/pages/leagues/create.vue` has extensive "round" terminology in its form
   - What's unclear: Whether to rename this section to "phases" or keep UI separate from internal naming
   - Recommendation: Rename to "Phases" section for consistency; user creates "phases" not "rounds"

2. **Marketing/Landing Page Text**
   - What we know: `app/pages/index.vue` mentions "rounds" in marketing copy
   - What's unclear: Exact wording for user-facing marketing
   - Recommendation: Change to "phases" but review final wording for marketing appeal

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of app/components/views/*.vue
- Direct codebase analysis of app/pages/*.vue
- Direct codebase analysis of app/composables/*.js
- app/stores/leagues.js (Phase 3 completed updates)

### Secondary (MEDIUM confidence)
- Vue 3 documentation (component props patterns)
- Phase 3 RESEARCH.md (prior decisions, patterns)

### Tertiary (LOW confidence)
- None - All findings verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Directly verified against package.json and codebase
- Architecture: HIGH - Pattern derived from existing codebase structure
- Pitfalls: HIGH - Derived from Phase 1-3 experience and codebase analysis
- Files to update: HIGH - Complete grep analysis of app/ directory

**Research date:** 2026-02-05
**Valid until:** Indefinite (internal refactoring following established pattern)
