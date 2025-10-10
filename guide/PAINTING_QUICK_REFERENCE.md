# 🎨 Painting Feature - Quick Reference

## Quick Start

### 1. Apply Database Migration
```bash
npm run db:migrate
```

### 2. Start Dev Server  
```bash
npm run dev
```

### 3. Access Painting Page
Navigate to: `http://localhost:3000/painting`

## API Quick Reference

### GET `/api/painting-progress`
```javascript
// Get all painting progress
$fetch('/api/painting-progress')

// Get progress for a player
$fetch('/api/painting-progress?playerId=1')

// Get progress for a player and round
$fetch('/api/painting-progress?playerId=1&round=2')
```

### POST `/api/painting-progress`
```javascript
await $fetch('/api/painting-progress', {
  method: 'POST',
  body: {
    playerId: 1,
    round: 2,
    unitName: 'Intercessors',
    totalModels: 10,
    paintedModels: 7,
    points: 100
  }
})
```

### DELETE `/api/painting-progress`
```javascript
await $fetch('/api/painting-progress?playerId=1&round=2&unitName=Intercessors', {
  method: 'DELETE'
})
```

## Store Quick Reference

### State
```javascript
store.paintingProgress // Array of all painting progress
```

### Getters
```javascript
// Get stats for a player and round
store.getPaintingStats(playerId, round)
// Returns: { totalModels, paintedModels, paintedPercentage, 
//            paintedPoints, totalPoints, isFullyPainted, units }

// Get painting leaderboard
store.paintingLeaderboard
// Returns: Array sorted by painted percentage

// Get overall stats for a player
store.getOverallPaintingStats(playerId)
// Returns: { totalModels, paintedModels, paintedPercentage, isFullyPainted }
```

### Actions
```javascript
// Fetch all painting progress
await store.fetchPaintingProgress()

// Update/create painting progress
await store.updatePaintingProgress({
  playerId, round, unitName, totalModels, paintedModels, points
})

// Delete painting progress
await store.deletePaintingProgress(playerId, round, unitName)

// Fetch everything
await store.fetchAll()
```

## Component Quick Reference

### PaintingProgress.vue
```vue
<PaintingProgress 
  :stats="paintingStats"
  :editable="true"
  @add-unit="handleAddUnit"
  @edit-unit="handleEditUnit"
/>
```

Props:
- `stats` (Object): Stats from `getPaintingStats()`
- `editable` (Boolean): Show edit/add buttons

Events:
- `@add-unit`: Fired when user clicks add button
- `@edit-unit`: Fired when user clicks edit button (passes unit)

### PaintingProgressModal.vue
```vue
<PaintingProgressModal
  :show="showModal"
  :playerId="playerId"
  :round="round"
  :editingUnit="unit"
  @save="handleSave"
  @delete="handleDelete"
  @close="handleClose"
/>
```

Props:
- `show` (Boolean): Show/hide modal
- `playerId` (Number): Player ID
- `round` (Number): Round number
- `editingUnit` (Object|null): Unit to edit, or null for new

Events:
- `@save`: Fired when user saves (passes data object)
- `@delete`: Fired when user deletes (passes data object)
- `@close`: Fired when user closes modal

## Color Coding

| Percentage | Color | Class |
|------------|-------|-------|
| 0-30% | 🔴 Red | `.low` |
| 31-70% | 🟡 Orange | `.medium` |
| 71-99% | 🟢 Green | `.high` |
| 100% | 🟣 Purple | `.complete` |

## Database Schema

```sql
CREATE TABLE painting_progress (
  id INTEGER PRIMARY KEY,
  playerId INTEGER NOT NULL,
  round INTEGER NOT NULL,
  unitName VARCHAR(255) NOT NULL,
  totalModels INTEGER NOT NULL,
  paintedModels INTEGER NOT NULL,
  points INTEGER NOT NULL,
  lastUpdated TIMESTAMP DEFAULT NOW(),
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (playerId) REFERENCES players(id)
);
```

## Navigation

The painting page is accessible via:
- Navigation bar: Click "🎨 Painting"
- Direct URL: `/painting`
- Component: `app/pages/painting.vue`

## Files to Know

| File | Purpose |
|------|---------|
| `app/stores/league.js` | State management |
| `app/pages/painting.vue` | Main painting page |
| `app/components/PaintingProgress.vue` | Display component |
| `app/components/PaintingProgressModal.vue` | Edit modal |
| `server/api/painting-progress.*.ts` | API endpoints |
| `db/schema.ts` | Database schema |
| `migrations/0003_*.sql` | Database migration |

## Common Tasks

### Add painting progress to another page
```vue
<script setup>
import PaintingProgress from '~/components/PaintingProgress.vue'
import { useLeagueStore } from '~/stores/league'

const store = useLeagueStore()
const stats = computed(() => store.getPaintingStats(playerId, round))
</script>

<template>
  <PaintingProgress :stats="stats" :editable="true" />
</template>
```

### Get leaderboard on dashboard
```javascript
const leaderboard = computed(() => store.paintingLeaderboard)
```

### Check if army is fully painted
```javascript
const stats = store.getPaintingStats(playerId, round)
if (stats?.isFullyPainted) {
  console.log('🎉 Fully painted!')
}
```

## Tips

- Always call `fetchAll()` or `fetchPaintingProgress()` before accessing painting data
- Use `getPaintingStats()` getter rather than manually calculating stats
- The painting leaderboard auto-updates when progress changes
- Unit names should be unique per player/round combination
- Painted models cannot exceed total models (validated by API)

## Support

See full documentation:
- `PAINTING_FEATURE.md` - Complete feature documentation
- `INTEGRATION_GUIDE.md` - Integration examples
- `PAINTING_IMPLEMENTATION_COMPLETE.md` - Implementation summary
