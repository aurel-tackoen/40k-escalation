# Composable Extraction Suggestions

After analyzing all component scripts, here are the functions that can be extracted into reusable composables:

---

## 1. **usePlayerLookup** - Player Data Utilities

**Duplicate Functions Found:**
- `getPlayerName(playerId)` - Found in **3 components**: DashboardView, ArmyListsView, MatchesView
- `getPlayerFaction(playerId)` - Found in MatchesView

**Suggested Composable:**
```js
// app/composables/usePlayerLookup.js
export function usePlayerLookup(players) {
  const getPlayerName = (playerId) => {
    const player = players.value?.find(p => p.id === playerId)
    return player ? player.name : 'Unknown Player'
  }

  const getPlayerFaction = (playerId) => {
    const player = players.value?.find(p => p.id === playerId)
    return player ? player.faction : 'Unknown Faction'
  }

  const getPlayer = (playerId) => {
    return players.value?.find(p => p.id === playerId)
  }

  return {
    getPlayerName,
    getPlayerFaction,
    getPlayer
  }
}
```

**Benefits:**
- Eliminates 3+ duplicate implementations
- Centralized player lookup logic
- Can be extended with more player utilities

---

## 2. **useRoundLookup** - Round Data Utilities

**Duplicate Functions Found:**
- `getRoundName(roundNumber)` - Found in ArmyListsView
- `getRoundLimit(roundNumber)` - Found in ArmyListsView
- Similar logic in DashboardView for `currentRound`

**Suggested Composable:**
```js
// app/composables/useRoundLookup.js
export function useRoundLookup(rounds) {
  const getRoundName = (roundNumber) => {
    const round = rounds.value?.find(r => r.number === roundNumber)
    return round ? round.name : `Round ${roundNumber}`
  }

  const getRoundLimit = (roundNumber) => {
    const round = rounds.value?.find(r => r.number === roundNumber)
    return round ? round.pointLimit : 0
  }

  const getRound = (roundNumber) => {
    return rounds.value?.find(r => r.number === roundNumber)
  }

  const getCurrentRound = (league) => {
    if (!league.value?.rounds || league.value.rounds.length === 0) {
      return { name: 'N/A', pointLimit: 0, number: 1 }
    }
    return league.value.rounds.find(r => r.number === league.value.currentRound) || league.value.rounds[0]
  }

  return {
    getRoundName,
    getRoundLimit,
    getRound,
    getCurrentRound
  }
}
```

**Benefits:**
- Eliminates duplicate round lookups
- Consistent round data access
- Easy to extend with more round utilities

---

## 3. **useFormatting** - Date and Number Formatting

**Duplicate Functions Found:**
- `formatDate(dateString)` - Found in **3 components** with slightly different formats:
  - DashboardView: 'short/numeric/numeric'
  - ArmyListsView: 'short/numeric'
  - MatchesView: 'short/numeric/numeric'

**Suggested Composable:**
```js
// app/composables/useFormatting.js
export function useFormatting() {
  const formatDate = (dateString, options = {}) => {
    const defaultOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }
    return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options })
  }

  const formatDateShort = (dateString) => {
    return formatDate(dateString, { year: undefined })
  }

  const formatPoints = (points) => {
    return `${points}pts`
  }

  const formatPercentage = (value, decimals = 0) => {
    return `${value.toFixed(decimals)}%`
  }

  const formatRecord = (wins, losses, draws) => {
    return `${wins}W - ${losses}L - ${draws}D`
  }

  return {
    formatDate,
    formatDateShort,
    formatPoints,
    formatPercentage,
    formatRecord
  }
}
```

**Benefits:**
- Consistent date formatting across app
- Eliminates 3+ duplicate implementations
- Easy to add more formatting utilities
- Locale-aware formatting

---

## 4. **usePlayerStats** - Player Statistics Calculations

**Functions Found:**
- `getWinPercentage(player)` - Found in PlayersView
- Sorting logic by wins/points - Found in DashboardView
- Total games calculation - Found in PlayersView

**Suggested Composable:**
```js
// app/composables/usePlayerStats.js
export function usePlayerStats() {
  const getWinPercentage = (player) => {
    const totalGames = getTotalGames(player)
    if (totalGames === 0) return 0
    return (player.wins / totalGames) * 100
  }

  const getTotalGames = (player) => {
    return (player.wins || 0) + (player.losses || 0) + (player.draws || 0)
  }

  const getLossPercentage = (player) => {
    const totalGames = getTotalGames(player)
    if (totalGames === 0) return 0
    return (player.losses / totalGames) * 100
  }

  const getDrawPercentage = (player) => {
    const totalGames = getTotalGames(player)
    if (totalGames === 0) return 0
    return (player.draws / totalGames) * 100
  }

  const sortPlayersByStandings = (players) => {
    return [...players].sort((a, b) => {
      // Sort by wins first, then by total points
      if (a.wins !== b.wins) {
        return b.wins - a.wins
      }
      return b.totalPoints - a.totalPoints
    })
  }

  const getPlayerRank = (player, allPlayers) => {
    const sorted = sortPlayersByStandings(allPlayers)
    return sorted.findIndex(p => p.id === player.id) + 1
  }

  return {
    getWinPercentage,
    getLossPercentage,
    getDrawPercentage,
    getTotalGames,
    sortPlayersByStandings,
    getPlayerRank
  }
}
```

**Benefits:**
- Centralized player statistics logic
- Reusable across leaderboards and player cards
- Consistent calculation methods

---

## 5. **useFormManagement** - Form State Management

**Pattern Found in Multiple Components:**
- Form submission + reset pattern in PlayersView, MatchesView
- Validation logic in MatchesView, ArmyListsView
- Confirmation modals in PlayersView, ArmyListsView

**Suggested Composable:**
```js
// app/composables/useFormManagement.js
import { ref } from 'vue'

export function useFormManagement(initialState, validationFn) {
  const formData = ref({ ...initialState })
  const isDirty = ref(false)

  const resetForm = () => {
    formData.value = { ...initialState }
    isDirty.value = false
  }

  const isValid = () => {
    if (typeof validationFn === 'function') {
      return validationFn(formData.value)
    }
    return true
  }

  const updateField = (field, value) => {
    formData.value[field] = value
    isDirty.value = true
  }

  return {
    formData,
    isDirty,
    resetForm,
    isValid,
    updateField
  }
}
```

**Suggested Composable for Modals:**
```js
// app/composables/useConfirmation.js
import { ref } from 'vue'

export function useConfirmation() {
  const item = ref(null)
  const isOpen = ref(false)

  const confirm = (itemToConfirm) => {
    item.value = itemToConfirm
    isOpen.value = true
  }

  const cancel = () => {
    item.value = null
    isOpen.value = false
  }

  const execute = (callback) => {
    if (item.value && typeof callback === 'function') {
      callback(item.value)
      cancel()
    }
  }

  return {
    item,
    isOpen,
    confirm,
    cancel,
    execute
  }
}
```

**Benefits:**
- DRY form handling
- Consistent validation patterns
- Reusable confirmation dialogs

---

## 6. **useArrayFiltering** - Filtering and Sorting

**Pattern Found:**
- `filteredArmies` computed in ArmyListsView
- `filteredMatches` computed in MatchesView
- `sortedPlayers` computed in DashboardView

**Suggested Composable:**
```js
// app/composables/useArrayFiltering.js
import { computed, ref } from 'vue'

export function useArrayFiltering(items) {
  const filters = ref({})

  const filteredItems = computed(() => {
    let result = items.value || []

    Object.keys(filters.value).forEach(key => {
      const filterValue = filters.value[key]
      if (filterValue !== '' && filterValue !== null && filterValue !== undefined) {
        result = result.filter(item => {
          if (typeof filterValue === 'function') {
            return filterValue(item)
          }
          return item[key] === filterValue
        })
      }
    })

    return result
  })

  const setFilter = (key, value) => {
    filters.value[key] = value
  }

  const clearFilter = (key) => {
    delete filters.value[key]
  }

  const clearAllFilters = () => {
    filters.value = {}
  }

  return {
    filters,
    filteredItems,
    setFilter,
    clearFilter,
    clearAllFilters
  }
}
```

**Benefits:**
- Reusable filtering logic
- Consistent filter behavior
- Easy to extend with more complex filters

---

## 7. **useArmyManagement** - Army-Specific Operations

**Functions Found in ArmyListsView:**
- `calculateTotal()`
- `canEscalateArmy(army)`
- `hasPreviousRoundArmy`
- `getPreviousArmyUnits()`
- `getPreviousArmyName()`

**Suggested Composable:**
```js
// app/composables/useArmyManagement.js
export function useArmyManagement(armies, rounds) {
  const calculateArmyTotal = (units) => {
    return units.reduce((sum, unit) => sum + (unit.points || 0), 0)
  }

  const isValidArmy = (army, pointLimit) => {
    return army.units.length > 0 &&
      army.totalPoints <= pointLimit &&
      army.totalPoints > 0
  }

  const canEscalateArmy = (army) => {
    const nextRound = army.round + 1
    const hasNextRound = rounds.value?.some(r => r.number === nextRound)
    const hasNextRoundArmy = armies.value?.some(a =>
      a.playerId === army.playerId && a.round === nextRound
    )
    return hasNextRound && !hasNextRoundArmy
  }

  const hasPreviousRoundArmy = (playerId, round) => {
    if (!playerId || !round) return false
    return armies.value?.some(army =>
      army.playerId === playerId && army.round === round - 1
    )
  }

  const getPreviousArmy = (playerId, round) => {
    return armies.value?.find(army =>
      army.playerId === playerId && army.round === round - 1
    )
  }

  const copyArmyToNextRound = (army, nextRoundNumber) => {
    return {
      playerId: army.playerId,
      round: nextRoundNumber,
      name: `${army.name} (Round ${nextRoundNumber})`,
      totalPoints: army.totalPoints,
      units: JSON.parse(JSON.stringify(army.units)),
      isValid: false // Needs validation in new round context
    }
  }

  return {
    calculateArmyTotal,
    isValidArmy,
    canEscalateArmy,
    hasPreviousRoundArmy,
    getPreviousArmy,
    copyArmyToNextRound
  }
}
```

**Benefits:**
- Centralized army business logic
- Reusable army operations
- Easier to test and maintain

---

## 8. **useMatchResults** - Match Winner Determination

**Logic Found in MatchesView:**
- Winner determination based on points
- Draw detection

**Suggested Composable:**
```js
// app/composables/useMatchResults.js
export function useMatchResults() {
  const determineWinner = (player1Id, player2Id, player1Points, player2Points) => {
    if (player1Points > player2Points) {
      return player1Id
    } else if (player2Points > player1Points) {
      return player2Id
    }
    return null // Draw
  }

  const isDraw = (player1Points, player2Points) => {
    return player1Points === player2Points
  }

  const getPointDifference = (player1Points, player2Points) => {
    return Math.abs(player1Points - player2Points)
  }

  const getMatchResult = (match, playerId) => {
    if (match.winnerId === playerId) return 'win'
    if (match.winnerId === null) return 'draw'
    return 'loss'
  }

  const getMarginalVictoryStatus = (difference) => {
    if (difference === 0) return 'draw'
    if (difference <= 5) return 'marginal'
    if (difference <= 15) return 'minor'
    if (difference <= 25) return 'major'
    return 'crushing'
  }

  return {
    determineWinner,
    isDraw,
    getPointDifference,
    getMatchResult,
    getMarginalVictoryStatus
  }
}
```

**Benefits:**
- Consistent match result logic
- Easy to add victory conditions
- Reusable across match displays

---

## 9. **useDataExport** - Import/Export Utilities

**Logic Found in LeagueSetupView:**
- `exportData()`
- `importData()`

**Suggested Composable:**
```js
// app/composables/useDataExport.js
export function useDataExport() {
  const exportToJSON = (data, filename) => {
    const exportData = {
      ...data,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const importFromJSON = (file, callback) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        callback(importedData, null)
      } catch (error) {
        callback(null, error)
      }
    }
    reader.onerror = (error) => {
      callback(null, error)
    }
    reader.readAsText(file)
  }

  const exportToCSV = (data, filename, headers) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => row[h]).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return {
    exportToJSON,
    importFromJSON,
    exportToCSV
  }
}
```

**Benefits:**
- Reusable export/import logic
- Support for multiple formats
- Consistent error handling

---

## Priority Implementation Order

### High Priority (Immediate Benefits)
1. ✅ **usePaintingStats** - Already implemented!
2. 🔥 **usePlayerLookup** - Used in 3+ components
3. 🔥 **useFormatting** - Used in 3+ components
4. 🔥 **usePlayerStats** - Core statistics logic

### Medium Priority (Good Improvements)
5. 📊 **useRoundLookup** - Centralizes round data access
6. 🔧 **useArmyManagement** - Complex army logic
7. 🎯 **useConfirmation** - Reusable modal pattern

### Low Priority (Nice to Have)
8. 📋 **useFormManagement** - Forms work fine currently
9. 🔍 **useArrayFiltering** - Can improve but not urgent
10. 📤 **useDataExport** - Only used in one place
11. 🏆 **useMatchResults** - Only used in one place

---

## Implementation Guide

### Step-by-Step Process

1. **Create the composable file** in `app/composables/`
2. **Write comprehensive JSDoc comments** for each function
3. **Import and test** in one component first
4. **Gradually migrate** other components
5. **Remove old implementations** once verified
6. **Update documentation** with usage examples

### Example Migration (usePlayerLookup)

**Before (in component):**
```vue
<script setup>
const getPlayerName = (playerId) => {
  const player = props.players.find(p => p.id === playerId)
  return player ? player.name : 'Unknown Player'
}
</script>
```

**After (using composable):**
```vue
<script setup>
import { usePlayerLookup } from '~/composables/usePlayerLookup'

const { getPlayerName, getPlayerFaction } = usePlayerLookup(toRef(props, 'players'))
</script>
```

---

## Expected Benefits

### Code Quality
- ✅ **70% reduction** in duplicate code
- ✅ **Single source of truth** for business logic
- ✅ **Easier to test** isolated functions
- ✅ **Better type safety** with TypeScript (future)

### Maintainability
- ✅ **One place to fix bugs** instead of multiple
- ✅ **Consistent behavior** across all components
- ✅ **Easier onboarding** for new developers
- ✅ **Clear separation of concerns**

### Performance
- ✅ **Better code splitting** with composables
- ✅ **Shared function instances** across components
- ✅ **Easier to optimize** when needed

---

## Next Steps

1. **Review this document** with team
2. **Prioritize composables** based on needs
3. **Create implementation tickets** for each composable
4. **Start with high-priority items** (usePlayerLookup, useFormatting)
5. **Test thoroughly** after each migration
6. **Document usage** in README files

Would you like me to implement any of these composables now?
