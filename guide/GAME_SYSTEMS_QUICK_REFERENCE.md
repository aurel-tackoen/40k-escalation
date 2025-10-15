# Game Systems - Quick Reference Guide

**For Developers & Users** - How to work with multi-game system support

---

## 🎮 Supported Game Systems

| ID | Name | Short Name | Factions | Missions |
|----|------|------------|----------|----------|
| 1 | Warhammer 40,000 | `40k` | 41 | 15 |
| 2 | Age of Sigmar | `aos` | 24 | 13 |
| 3 | The Old World | `tow` | 17 | 12 |
| 4 | Middle-Earth Strategy Battle Game | `mesbg` | 33 | 14 |

---

## 🔌 API Usage

### Fetch All Game Systems
```bash
GET /api/game-systems
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Warhammer 40,000",
      "shortName": "40k",
      "isActive": true,
      "createdAt": "2025-10-15T..."
    }
  ],
  "count": 4
}
```

### Fetch Factions (Filtered)
```bash
GET /api/factions?gameSystemId=1
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "gameSystemId": 1,
      "name": "Space Marines",
      "category": "Imperium",
      "isActive": true
    }
  ],
  "count": 41,
  "gameSystemId": 1
}
```

### Fetch Missions (Filtered)
```bash
GET /api/missions?gameSystemId=2
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 16,
      "gameSystemId": 2,
      "name": "Tooth and Nail",
      "category": "Battleplan",
      "isActive": true
    }
  ],
  "count": 13,
  "gameSystemId": 2
}
```

### Create League with Game System
```bash
POST /api/leagues/create
Content-Type: application/json

{
  "name": "My AoS League",
  "gameSystemId": 2,
  "startDate": "2025-11-01",
  "createdBy": 1,
  "isPublic": true,
  "rounds": [...]
}
```

---

## 🏪 Using in Pinia Store

### Initialize Game Systems
```javascript
// In app.vue or layout
import { useLeaguesStore } from '~/stores/leagues'

const leaguesStore = useLeaguesStore()

onMounted(async () => {
  await leaguesStore.fetchGameSystems()
})
```

### Access in Components
```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useLeaguesStore } from '~/stores/leagues'

const leaguesStore = useLeaguesStore()
const {
  gameSystems,
  currentGameSystem,
  availableFactions,
  availableMissions
} = storeToRefs(leaguesStore)
</script>

<template>
  <div>
    <h2>{{ leaguesStore.currentGameSystemName }}</h2>
    
    <!-- Factions dropdown -->
    <select v-model="selectedFaction">
      <option v-for="faction in availableFactions" :key="faction.id" :value="faction.name">
        {{ faction.name }} ({{ faction.category }})
      </option>
    </select>
    
    <!-- Missions dropdown -->
    <select v-model="selectedMission">
      <option v-for="mission in availableMissions" :key="mission.id" :value="mission.name">
        {{ mission.name }} - {{ mission.category }}
      </option>
    </select>
  </div>
</template>
```

---

## 🎨 Component Patterns

### League Creation Form
```vue
<script setup>
const leaguesStore = useLeaguesStore()
const { gameSystems } = storeToRefs(leaguesStore)

const formData = reactive({
  name: '',
  gameSystemId: null,
  // ... other fields
})

// Watch for game system changes
watch(() => formData.gameSystemId, async (newSystemId) => {
  if (newSystemId) {
    // Fetch factions/missions for preview
    await leaguesStore.fetchFactions(newSystemId)
    await leaguesStore.fetchMissions(newSystemId)
  }
})

const createLeague = async () => {
  const response = await leaguesStore.createLeague(formData)
  // ... handle response
}
</script>

<template>
  <form @submit.prevent="createLeague">
    <!-- Game System Selector -->
    <div class="form-group">
      <label>Game System *</label>
      <select v-model="formData.gameSystemId" required>
        <option value="">Select a game system...</option>
        <option v-for="system in gameSystems" :key="system.id" :value="system.id">
          {{ system.name }}
        </option>
      </select>
    </div>
    
    <!-- Rest of form... -->
  </form>
</template>
```

### Player Creation (Dynamic Factions)
```vue
<script setup>
const leaguesStore = useLeaguesStore()
const { availableFactions } = storeToRefs(leaguesStore)

const playerData = reactive({
  name: '',
  faction: ''
})
</script>

<template>
  <form @submit.prevent="addPlayer">
    <select v-model="playerData.faction" required>
      <option value="">Select Faction</option>
      <option v-for="faction in availableFactions" :key="faction.id" :value="faction.name">
        {{ faction.name }}
        <span v-if="faction.category">({{ faction.category }})</span>
      </option>
    </select>
  </form>
</template>
```

### Match Recording (Dynamic Missions)
```vue
<script setup>
const leaguesStore = useLeaguesStore()
const { availableMissions } = storeToRefs(leaguesStore)

const matchData = reactive({
  mission: '',
  // ... other fields
})
</script>

<template>
  <form @submit.prevent="recordMatch">
    <select v-model="matchData.mission" required>
      <option value="">Select Mission</option>
      <optgroup v-for="category in missionCategories" :key="category" :label="category">
        <option 
          v-for="mission in getMissionsByCategory(category)" 
          :key="mission.id" 
          :value="mission.name"
        >
          {{ mission.name }}
        </option>
      </optgroup>
    </select>
  </form>
</template>
```

---

## 📊 Faction Categories by Game System

### Warhammer 40,000
- **Imperium**: Space Marines, Imperial Guard, Custodes, etc.
- **Chaos**: Chaos Space Marines, Daemons, Death Guard, etc.
- **Xenos**: Orks, Eldar, Tau, Necrons, Tyranids, etc.

### Age of Sigmar
- **Order**: Stormcast Eternals, Cities of Sigmar, Lumineth, etc.
- **Chaos**: Khorne, Tzeentch, Nurgle, Slaanesh, Slaves to Darkness
- **Death**: Nighthaunt, Ossiarch Bonereapers, Soulblight
- **Destruction**: Orruk Warclans, Gloomspite Gitz, Ogors

### The Old World
- **Order**: Empire, Bretonnia, High Elves, Dwarfs
- **Chaos**: Warriors of Chaos, Daemons, Beastmen
- **Death**: Vampire Counts, Tomb Kings
- **Destruction**: Orcs & Goblins, Ogre Kingdoms

### Middle-Earth SBG
- **Free Peoples**: Minas Tirith, Rohan, Gondor, Arnor
- **Elves**: Rivendell, Lothlórien, Mirkwood
- **Dwarves**: Erebor, Iron Hills, Durin's Folk
- **Evil**: Mordor, Isengard, Angmar, Moria, Harad

---

## 🔄 Migration Workflow

### For Existing Leagues
All existing leagues are automatically assigned to **Warhammer 40,000** (gameSystemId = 1) during migration.

**To change a league's game system**:
```bash
PATCH /api/leagues/{id}
Content-Type: application/json

{
  "userId": 1,
  "gameSystemId": 2  # Change to Age of Sigmar
}
```

⚠️ **Warning**: Changing a league's game system will affect:
- Available factions for new players
- Available missions for new matches
- Existing players' factions may become invalid

---

## 🧪 Testing Commands

```bash
# 1. Seed game systems (run once)
curl -X POST http://localhost:8888/api/seed-game-systems

# 2. Verify game systems
curl http://localhost:8888/api/game-systems | jq

# 3. Check 40k factions
curl "http://localhost:8888/api/factions?gameSystemId=1" | jq '.count'

# 4. Check AoS missions
curl "http://localhost:8888/api/missions?gameSystemId=2" | jq '.data[].name'

# 5. Create test league (40k)
curl -X POST http://localhost:8888/api/leagues/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test 40k League",
    "gameSystemId": 1,
    "startDate": "2025-11-01",
    "createdBy": 1,
    "isPublic": true,
    "rounds": [{"number": 1, "name": "500pts", "pointLimit": 500, "startDate": "2025-11-01", "endDate": "2025-11-15"}]
  }'
```

---

## 🎯 Composables Integration

All existing composables remain game-agnostic and work across all systems:

- ✅ `useArmyManagement` - Points validation (universal)
- ✅ `usePlayerStats` - Win/loss tracking (universal)
- ✅ `usePaintingStats` - Painting progress (universal)
- ✅ `useMatchResults` - Match quality analysis (universal)
- ✅ No composable changes required!

---

## 🚀 Deployment Checklist

1. ✅ Apply database migration
2. ⏳ Run seed endpoint (`POST /api/seed-game-systems`)
3. ⏳ Update frontend components
4. ⏳ Test league creation with each game system
5. ⏳ Verify faction/mission filtering works
6. ⏳ Test switching between leagues with different systems
7. ⏳ Update documentation (AGENTS.md)

---

## 📚 Related Files

- `db/schema.ts` - Database schema
- `migrations/0008_nostalgic_human_cannonball.sql` - Migration
- `app/data/game-systems.js` - Game systems data
- `app/data/factions-by-system.js` - Factions data
- `app/data/missions-by-system.js` - Missions data
- `app/stores/leagues.js` - Pinia store
- `server/api/game-systems.get.ts` - Game systems endpoint
- `server/api/factions.get.ts` - Factions endpoint
- `server/api/missions.get.ts` - Missions endpoint
- `server/api/seed-game-systems.post.ts` - Seed endpoint

---

**Last Updated**: October 15, 2025  
**Version**: 1.0  
**Status**: Backend Complete, Frontend In Progress
