# League Rules Component Example

This is a **code example only** - copy/paste into your components as needed.

## Full Component with Tabbed Interface

```vue
<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useLeagueRules } from '~/composables/useLeagueRules'
import { useLeaguesStore } from '~/stores/leagues'
import { BookOpen, Trophy, Users, Shield } from 'lucide-vue-next'

const leaguesStore = useLeaguesStore()
const { currentGameSystem, currentLeague } = storeToRefs(leaguesStore)

// Get game-specific rules
const {
  generatedRules,
  scoringRules,
  armyBuildingRules,
  matchRequirementsRules,
  matchTypeLabel,
  leaguePointsSystem,
  hasRules
} = useLeagueRules(currentGameSystem)

// Active section for tabbed interface
const activeSection = ref('full')
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <BookOpen :size="32" class="text-purple-400" />
        <h1 class="text-3xl font-bold text-white">
          League Rules
        </h1>
      </div>
      
      <p v-if="currentLeague" class="text-gray-400">
        {{ currentLeague.name }} - {{ matchTypeLabel }} System
      </p>
    </div>

    <!-- Quick Stats Card -->
    <div v-if="hasRules && leaguePointsSystem" class="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-6">
      <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Trophy :size="20" class="text-yellow-500" />
        League Points System
      </h3>
      
      <!-- Victory Points / Scenario Systems -->
      <div v-if="leaguePointsSystem.win !== undefined" class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-400">{{ leaguePointsSystem.win }}</div>
          <div class="text-sm text-gray-400">Win</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-yellow-400">{{ leaguePointsSystem.draw }}</div>
          <div class="text-sm text-gray-400">Draw</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-red-400">{{ leaguePointsSystem.loss }}</div>
          <div class="text-sm text-gray-400">Loss</div>
        </div>
      </div>
      
      <!-- The Old World System -->
      <div v-else-if="leaguePointsSystem.massacre !== undefined" class="grid grid-cols-5 gap-3">
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-400">{{ leaguePointsSystem.massacre }}</div>
          <div class="text-xs text-gray-400">Massacre</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-400">{{ leaguePointsSystem.majorVictory }}</div>
          <div class="text-xs text-gray-400">Major</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-400">{{ leaguePointsSystem.minorVictory }}</div>
          <div class="text-xs text-gray-400">Minor</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-yellow-400">{{ leaguePointsSystem.draw }}</div>
          <div class="text-xs text-gray-400">Draw</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-red-400">{{ leaguePointsSystem.loss }}</div>
          <div class="text-xs text-gray-400">Loss</div>
        </div>
      </div>
    </div>

    <!-- Section Tabs -->
    <div class="flex gap-2 mb-6 border-b border-gray-700">
      <button
        @click="activeSection = 'full'"
        :class="[
          'px-4 py-2 font-medium transition-colors',
          activeSection === 'full'
            ? 'text-purple-400 border-b-2 border-purple-400'
            : 'text-gray-400 hover:text-white'
        ]"
      >
        Full Rules
      </button>
      <button
        @click="activeSection = 'scoring'"
        :class="[
          'px-4 py-2 font-medium transition-colors flex items-center gap-2',
          activeSection === 'scoring'
            ? 'text-purple-400 border-b-2 border-purple-400'
            : 'text-gray-400 hover:text-white'
        ]"
      >
        <Trophy :size="16" />
        Scoring
      </button>
      <button
        @click="activeSection = 'army'"
        :class="[
          'px-4 py-2 font-medium transition-colors flex items-center gap-2',
          activeSection === 'army'
            ? 'text-purple-400 border-b-2 border-purple-400'
            : 'text-gray-400 hover:text-white'
        ]"
      >
        <Users :size="16" />
        Army Building
      </button>
      <button
        @click="activeSection = 'matches'"
        :class="[
          'px-4 py-2 font-medium transition-colors flex items-center gap-2',
          activeSection === 'matches'
            ? 'text-purple-400 border-b-2 border-purple-400'
            : 'text-gray-400 hover:text-white'
        ]"
      >
        <Shield :size="16" />
        Match Requirements
      </button>
    </div>

    <!-- Rules Content -->
    <div v-if="hasRules" class="bg-gray-800 border border-gray-600 rounded-lg p-8">
      <!-- Full Rules -->
      <div
        v-if="activeSection === 'full'"
        v-html="generatedRules"
        class="prose prose-invert prose-purple max-w-none"
      />
      
      <!-- Scoring Only -->
      <div
        v-else-if="activeSection === 'scoring'"
        v-html="scoringRules"
        class="prose prose-invert prose-purple max-w-none"
      />
      
      <!-- Army Building Only -->
      <div
        v-else-if="activeSection === 'army'"
        v-html="armyBuildingRules"
        class="prose prose-invert prose-purple max-w-none"
      />
      
      <!-- Match Requirements Only -->
      <div
        v-else-if="activeSection === 'matches'"
        v-html="matchRequirementsRules"
        class="prose prose-invert prose-purple max-w-none"
      />
    </div>

    <!-- No Rules State -->
    <div v-else class="text-center py-12 text-gray-400">
      <BookOpen :size="48" class="mx-auto mb-4 opacity-50" />
      <p>No rules available for this game system</p>
    </div>
  </div>
</template>

<style scoped>
/* Prose styling for markdown content */
.prose {
  @apply text-gray-300;
}

.prose :deep(h2) {
  @apply text-2xl font-bold text-purple-400 mb-3 mt-6 border-b border-gray-700 pb-2;
}

.prose :deep(h3) {
  @apply text-xl font-semibold text-white mb-2 mt-4;
}

.prose :deep(p) {
  @apply mb-4 leading-relaxed;
}

.prose :deep(strong) {
  @apply text-white font-semibold;
}
</style>
```

## Simple Inline Usage

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useLeagueRules } from '~/composables/useLeagueRules'
import { useLeaguesStore } from '~/stores/leagues'

const leaguesStore = useLeaguesStore()
const { currentGameSystem } = storeToRefs(leaguesStore)
const { generatedRules, hasRules } = useLeagueRules(currentGameSystem)
</script>

<template>
  <div v-if="hasRules" v-html="generatedRules" class="prose" />
</template>
```

## API Route Example

```typescript
// server/api/leagues/[id]/rules.get.ts
import { generateLeagueRules } from '~/data/default-rules'
import { db } from '~/db'
import { leagues, gameSystems } from '~/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const leagueId = getRouterParam(event, 'id')
  
  // Fetch league with game system
  const result = await db
    .select()
    .from(leagues)
    .leftJoin(gameSystems, eq(leagues.gameSystemId, gameSystems.id))
    .where(eq(leagues.id, parseInt(leagueId)))
    .get()
  
  if (!result) {
    throw createError({ statusCode: 404, message: 'League not found' })
  }
  
  // Generate rules for this league's game system
  const rules = generateLeagueRules({
    name: result.game_systems.name,
    matchType: result.game_systems.matchType,
    matchConfig: JSON.parse(result.game_systems.matchConfig)
  })
  
  return { success: true, data: rules }
})
```

## Direct Function Usage

```javascript
import { generateLeagueRules } from '~/data/default-rules'
import { gameSystems } from '~/data/game-systems'

// For Warhammer 40k
const fortyKRules = generateLeagueRules(gameSystems[0])

// For The Old World
const towRules = generateLeagueRules(gameSystems[2])

// For custom system
const customRules = generateLeagueRules({
  name: 'My Game',
  matchType: 'victory_points',
  matchConfig: {
    pointsLabel: 'Points',
    pointsRange: { min: 0, max: 100 }
  }
})
```
