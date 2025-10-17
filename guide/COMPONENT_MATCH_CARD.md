# MatchCard Component - Reusable Match Display

**Date**: October 17, 2025  
**Status**: ✅ Complete - Zero Lint Errors

## Overview

Created a reusable `MatchCard` component that displays match information with all the functionality from MatchesView (quality badges, win streaks, factions) and can be used across multiple views with optional delete functionality.

## Files Created

### `/app/components/MatchCard.vue`
**New reusable match card component** with features:
- ✅ Responsive design (mobile + desktop layouts)
- ✅ Match quality badges (Close Game, Decisive Victory)
- ✅ Win streak indicators
- ✅ Player names and factions
- ✅ Score display with winner highlighting
- ✅ Optional delete button (can be hidden)
- ✅ Match notes display
- ✅ Mission display with gradient styling

## Files Modified

### 1. `/app/components/views/MatchesView.vue`
**Changes:**
- ✅ Added `MatchCard` component import
- ✅ Replaced 126 lines of card markup with 13 lines using component
- ✅ Removed unused `Swords` icon import
- ✅ Delete button shown and functional

**Lines saved**: ~113 lines

### 2. `/app/components/views/DashboardView.vue`
**Changes:**
- ✅ Added `MatchCard` component import
- ✅ Added `useMatchResults` composable for match analytics
- ✅ Added `getPlayerFaction` lookup
- ✅ Created `getMatchQualityBadge` function
- ✅ Created `getPlayerStreak` function
- ✅ Replaced 74 lines of card markup with 13 lines using component
- ✅ Delete button hidden (not needed in dashboard)
- ✅ Removed unused `Handshake` icon import

**Lines saved**: ~61 lines  
**Total lines saved**: ~174 lines across both views

## Component API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `match` | Object | Yes | - | Match data object |
| `getPlayerName` | Function | Yes | - | Function to get player name by ID |
| `getPlayerFaction` | Function | Yes | - | Function to get player faction by ID |
| `formatDate` | Function | Yes | - | Function to format date |
| `getMatchQualityBadge` | Function | No | `null` | Function to get match quality badge |
| `getPlayerStreak` | Function | No | `null` | Function to get player win streak |
| `showDelete` | Boolean | No | `false` | Show delete button |
| `canDelete` | Boolean | No | `false` | Can delete this specific match |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `@delete` | `match` | Emitted when delete button clicked |

### Match Object Structure

```javascript
{
  id: 1,
  round: 1,
  player1Id: 1,
  player2Id: 2,
  player1Points: 85,
  player2Points: 60,
  winnerId: 1,         // or null for draw
  mission: "Purge the Enemy",
  datePlayed: "2025-10-15",
  notes: "Close game!" // optional
}
```

## Usage Examples

### 1. MatchesView (With Delete Button)

```vue
<script setup>
  import MatchCard from '~/components/MatchCard.vue'
  import { usePlayerLookup } from '~/composables/usePlayerLookup'
  import { useFormatting } from '~/composables/useFormatting'
  import { useMatchResults } from '~/composables/useMatchResults'

  const { getPlayerName, getPlayerFaction } = usePlayerLookup(toRef(props, 'players'))
  const { formatDate } = useFormatting()

  const getMatchQualityBadge = (match) => {
    const pointDiff = Math.abs(match.player1Points - match.player2Points)
    // ... return badge object
  }

  const getPlayerStreak = (playerId) => {
    // ... return streak object
  }

  const confirmDeleteMatch = (match) => {
    // Handle delete
  }

  const canDeleteMatch = (match) => {
    // Check permissions
    return true
  }
</script>

<template>
  <MatchCard
    v-for="match in matches"
    :key="match.id"
    :match="match"
    :get-player-name="getPlayerName"
    :get-player-faction="getPlayerFaction"
    :format-date="formatDate"
    :get-match-quality-badge="getMatchQualityBadge"
    :get-player-streak="getPlayerStreak"
    :show-delete="true"
    :can-delete="canDeleteMatch(match)"
    @delete="confirmDeleteMatch"
  />
</template>
```

### 2. DashboardView (Without Delete Button)

```vue
<script setup>
  import MatchCard from '~/components/MatchCard.vue'
  import { usePlayerLookup } from '~/composables/usePlayerLookup'
  import { useFormatting } from '~/composables/useFormatting'
  import { useMatchResults } from '~/composables/useMatchResults'

  const { getPlayerName, getPlayerFaction } = usePlayerLookup(toRef(props, 'players'))
  const { formatDate } = useFormatting()
  const { getWinStreak } = useMatchResults(toRef(props, 'matches'))

  const getMatchQualityBadge = (match) => {
    const pointDiff = Math.abs(match.player1Points - match.player2Points)
    
    if (pointDiff <= 10) {
      return {
        text: 'Close Game',
        class: 'bg-orange-900/30 text-orange-400 border border-orange-700/50',
        icon: 'Handshake'
      }
    } else if (pointDiff >= 30) {
      return {
        text: 'Decisive Victory',
        class: 'bg-red-900/30 text-red-400 border border-red-700/50',
        icon: 'Trophy'
      }
    }
    return null
  }

  const getPlayerStreak = (playerId) => {
    const streak = getWinStreak(playerId, props.matches)
    if (streak >= 2) {
      return { count: streak }
    }
    return null
  }
</script>

<template>
  <MatchCard
    v-for="match in recentMatches"
    :key="match.id"
    :match="match"
    :get-player-name="getPlayerName"
    :get-player-faction="getPlayerFaction"
    :format-date="formatDate"
    :get-match-quality-badge="getMatchQualityBadge"
    :get-player-streak="getPlayerStreak"
    :show-delete="false"
  />
</template>
```

## Features

### 1. Responsive Layouts

**Mobile View:**
- Vertical scoreboard with VS divider
- Full player names and factions
- Large point display
- Stacked layout

**Desktop View:**
- Horizontal layout
- Compact player info
- All information visible at once

### 2. Match Quality Badges

**Close Game** (point difference ≤ 10):
- Orange styling
- Handshake icon
- "Close Game" text

**Decisive Victory** (point difference ≥ 30):
- Red styling
- Trophy icon
- "Decisive Victory" text

### 3. Win Streak Indicators

- Shows for players with 2+ consecutive wins
- Flame icon (🔥)
- Red styling
- Displays win count (e.g., "3W")

### 4. Winner Highlighting

**Winner Badge:**
- Green styling
- Trophy icon
- "{Player} Wins!" text
- Green background on their score section (mobile)

**Draw Badge:**
- Yellow styling
- Handshake icon
- "Draw" text

### 5. Optional Delete Button

- Red button with trash icon
- Only shown when `showDelete={true}`
- Only enabled when `canDelete={true}`
- Emits `@delete` event with match object

## Component Structure

```
MatchCard.vue
├── Header Row
│   ├── Round & Date
│   └── Mission Badge + Quality Badge + Delete Button (optional)
├── Scoreboard
│   ├── Mobile Layout (sm:hidden)
│   │   ├── Player 1 (with green highlight if winner)
│   │   ├── VS Divider
│   │   └── Player 2 (with green highlight if winner)
│   └── Desktop Layout (hidden sm:flex)
│       ├── Player 1 Info (name, faction, points, streak)
│       ├── VS Separator
│       └── Player 2 Info (name, faction, points, streak)
├── Winner/Draw Badge
└── Notes (if present)
```

## Benefits

### Code Reusability
- ✅ Single source of truth for match display
- ✅ Consistent UI across Dashboard and Matches views
- ✅ Easy to add to new views (e.g., Player Profile, League Summary)

### Maintainability
- ✅ Changes to match display only need one update
- ✅ Centralized styling and layout logic
- ✅ Easier to test and debug

### Flexibility
- ✅ Optional features (delete button, quality badges, streaks)
- ✅ Function props allow custom logic per view
- ✅ Works with any match data source

### Performance
- ✅ Reduced bundle size (less duplicated code)
- ✅ Component-level optimization possible
- ✅ Cleaner parent components

## Future Enhancements

- [ ] Click to expand for detailed unit-by-unit breakdown
- [ ] Link to player profiles
- [ ] Inline editing for match notes
- [ ] Copy match details to clipboard
- [ ] Export match as PDF/image
- [ ] Animation when match is added
- [ ] Skeleton loading state
- [ ] Match replay/timeline feature

## Testing Checklist

- [x] Displays correctly in MatchesView with delete button
- [x] Displays correctly in DashboardView without delete button
- [x] Mobile responsive layout works
- [x] Desktop responsive layout works
- [x] Match quality badges show correctly
- [x] Win streaks display for both players
- [x] Winner highlighting works (green background)
- [x] Draw badge shows when no winner
- [x] Notes display when present
- [x] Delete button emits correct event
- [x] Zero lint errors
- [x] Zero TypeScript errors

## Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total Lines of Match Card Code | ~200 | ~175 (inc. component) | Cleaner overall |
| Duplicated Match Card Markup | 2 instances | 0 instances | ✅ 100% reduction |
| MatchesView Lines | ~712 | ~599 | ✅ 113 lines saved |
| DashboardView Lines | ~305 | ~244 | ✅ 61 lines saved |
| Lint Errors | 0 | 0 | ✅ Maintained |
| Views Using Component | 0 | 2 | ✅ Reusable |

---

**Last Updated**: October 17, 2025  
**Status**: Complete ✅
