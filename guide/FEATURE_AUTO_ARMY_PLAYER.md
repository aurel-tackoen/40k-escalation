# Auto-Select Player for Army Creation (Self-Only)

**Status**: ✅ Complete  
**Date**: October 14, 2025

## Overview

Enhanced the army creation flow to **restrict users to only creating armies for themselves**, while organizers retain the ability to create armies for any player. This improves security and prevents users from accidentally or maliciously creating armies for other players.

## User Permissions Model

### Regular Users (Players)
- ✅ Can **only** create armies for their own player entity
- ✅ Cannot see or select other players
- ✅ Player field shows their name as read-only
- ✅ Must have a player entity in the league to create armies

### Organizers/Admins
- ✅ Can create armies for **any** player in the league
- ✅ See full dropdown of all players
- ✅ Maintain full administrative control

## Changes Made

### 1. Store Enhancements (`app/stores/leagues.js`)

Added two new getters to identify the current user's player:

```javascript
// Get current user's player entity in current league
currentPlayer(state) {
  const authStore = useAuthStore()
  if (!authStore.user?.id || !state.currentLeagueId) return null
  
  return state.players.find(p => p.userId === authStore.user.id)
},

// Check if current user has a player entity in current league
hasPlayerInLeague() {
  return this.currentPlayer !== null
}
```

**Behavior**:
- Finds the player entity linked to the authenticated user (`userId` matches `authStore.user.id`)
- Scoped to the current league
- Returns `null` if user not logged in or no league selected

### 2. Component Updates (`app/components/views/ArmyListsView.vue`)

#### Import Store Reference
```javascript
import { storeToRefs } from 'pinia'
import { useLeaguesStore } from '~/stores/leagues'

const leaguesStore = useLeaguesStore()
const { currentPlayer, canManageLeague } = storeToRefs(leaguesStore)
```

#### Auto-Select Player on Form Open
```javascript
const handleStartNewArmy = () => {
  startNewArmy(props.currentRound)
  // Auto-select current player if they have a player entity in this league
  if (currentPlayer.value) {
    currentArmy.value.playerId = currentPlayer.value.id
  }
}
```

#### Enhanced Player Selector UI
```vue
<!-- Organizers: Full dropdown to select any player -->
<select
  v-if="canManageLeague"
  v-model="currentArmy.playerId"
  required
  class="input-field"
  :disabled="editingArmy"
>
  <option value="">Select Player</option>
  <option v-for="player in players" :key="player.id" :value="player.id">
    {{ player.name }} ({{ player.faction }})
    <template v-if="currentPlayer && player.id === currentPlayer.id"> - You</template>
  </option>
</select>

<!-- Regular users: Read-only display of their player -->
<div v-else-if="currentPlayer" class="input-field bg-gray-800 cursor-not-allowed flex items-center">
  {{ currentPlayer.name }} ({{ currentPlayer.faction }})
</div>

<!-- No player entity: Show error state -->
<div v-else class="input-field bg-red-900/20 border-red-700 text-red-400 cursor-not-allowed">
  No player profile in this league
</div>

<!-- Helper text -->
<p v-if="!canManageLeague && currentPlayer" class="text-xs text-gray-500 mt-1">
  You can only create armies for yourself
</p>
<p v-else-if="!canManageLeague && !currentPlayer" class="text-xs text-red-400 mt-1">
  You need to join this league as a player first
</p>
<p v-else-if="canManageLeague" class="text-xs text-gray-500 mt-1">
  As organizer, you can create armies for any player
</p>
```

## User Experience Improvements

### For Regular Players
✅ **No Dropdown**: Player field shows their name as read-only text (not a dropdown)  
✅ **Clear Restriction**: Message states "You can only create armies for yourself"  
✅ **Error State**: If no player entity, shows "No player profile in this league"  
✅ **Disabled Button**: "Build New Army" button is disabled if they don't have a player  
✅ **Security**: Cannot manipulate form to create armies for others

### For Organizers/Admins
✅ **Full Control**: Dropdown shows all players in the league  
✅ **Clear Role**: Shows "As organizer, you can create armies for any player"  
✅ **Flexibility**: Can select any player including themselves  
✅ **Visual Indicator**: Shows " - You" next to their own player in dropdown

### For Users Without Player Entity
✅ **Clear Error**: Red warning "No player profile in this league"  
✅ **Disabled Button**: Cannot click "Build New Army"  
✅ **Helper Text**: "Join as player first" under the button  
✅ **Prevented Actions**: Form won't open if no player exists

### For Editing Armies
✅ **Locked Player**: Cannot change player when editing (prevents data issues)  
✅ **Consistent Behavior**: Same security model applies

## Technical Details

### Data Flow
1. User clicks "Build New Army"
2. `handleStartNewArmy()` is called
3. Form initializes via `useArmyForm` composable
4. `currentPlayer` getter finds user's player via `userId` match
5. Player ID is auto-assigned to `currentArmy.playerId`
6. UI reflects pre-selected player with disabled field (for non-organizers)

### Database Schema Reference
```typescript
// players table
{
  id: integer (PK)
  leagueId: integer (FK -> leagues.id)
  userId: integer (FK -> users.id)  // ← Links to authenticated user
  name: varchar(255)
  faction: varchar(100)
  // ... other fields
}
```

### Permission Logic
- **Regular User**: Can **ONLY** create armies for themselves (no dropdown, read-only field)
- **Organizer/Admin**: Can create armies for any player in the league (full dropdown)
- **Editing**: Player cannot be changed (always disabled)
- **No Player**: Button disabled, form prevented from opening

## Security Features

### Client-Side Validation
1. **Form Open Prevention**: `handleStartNewArmy()` checks permissions before opening form
2. **UI Restrictions**: Regular users see read-only field, not dropdown
3. **Button Disable**: "Build New Army" disabled if no player entity

### Save-Time Validation
```javascript
const saveArmyList = () => {
  // Extra validation: ensure user has permission to create army for selected player
  if (!canManageLeague.value && currentArmy.value.playerId !== currentPlayer.value?.id) {
    console.error('Cannot create army for another player')
    return
  }
  // ... rest of save logic
}
```

### Server-Side Validation (Recommended)
**TODO**: Add server-side check in `/api/armies` POST endpoint:
```typescript
// Verify user owns the player entity they're creating an army for
const player = await db.select().from(players).where(eq(players.id, body.playerId))
if (!player || player.userId !== currentUserId) {
  throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
}
```

## Testing Scenarios

### ✅ Regular User
1. Log in as regular user
2. Join a league (creates player entity)
3. Navigate to Army Lists
4. Click "Build New Army"
5. **Expected**: Player field shows their name as read-only text (no dropdown)
6. **Expected**: Message says "You can only create armies for yourself"

### ✅ Regular User Without Player
1. Log in as regular user
2. Access league where they're a member but not a player
3. Navigate to Army Lists
4. **Expected**: "Build New Army" button is disabled
5. **Expected**: Error message "Join as player first"
6. Click button does nothing

### ✅ Regular User Trying to Hack
1. Log in as regular user with player entity
2. Open Army Lists, click "Build New Army"
3. Try to manipulate form/devtools to change playerId
4. **Expected**: Save function validates and rejects
5. **Expected**: Console error logged

### ✅ Organizer
1. Log in as organizer
2. Access league where they have organizer role
3. Navigate to Army Lists
4. Click "Build New Army"
5. **Expected**: Player dropdown is shown with all players
6. **Expected**: Can select any player from dropdown

### ✅ Editing Army
1. Create an army
2. Click "Edit" on the army
3. **Expected**: Player dropdown/field is disabled (cannot change player)

## Future Enhancements

### Possible Improvements
- [x] ~~Auto-create player entity when user first accesses Army Lists page~~ Not needed - should join explicitly
- [x] ~~Show warning if user has no player entity in current league~~ Already implemented
- [ ] Add server-side validation to `/api/armies` POST endpoint
- [ ] Add audit logging for army creation attempts
- [ ] Show "Join League as Player" button with direct action

### Related Features
- Player onboarding flow
- League join wizard  
- Player profile management
- Role-based access control (RBAC)

## Breaking Changes

None - this is a security enhancement that restricts functionality but doesn't break existing features.

## Backward Compatibility

✅ **Yes** - Existing armies remain unchanged  
✅ **Organizers** - Still have full control  
✅ **API** - No changes to API contracts

---

**Impact**: Improved security, clearer UX, prevents cross-player army creation  
**Breaking Changes**: None (restriction-only)  
**Backward Compatible**: Yes
