# Returning Users & Army Name Editing - Implementation Complete

**Status**: ✅ Complete  
**Date**: January 2025  
**Type**: UX Enhancement  
**Related**: ENHANCEMENT_ONE_STEP_ONBOARDING.md

## 🎯 Overview

Added two important UX improvements:
1. **Pre-fill form for returning users** - Users who previously left a league see their old data when rejoining
2. **Edit army names in profile** - Users can update their army name for any league from the profile page

---

## 🚀 Feature 1: Pre-fill Form for Returning Users

### Problem
When a user left a league and wants to rejoin:
- They had to re-enter all their information
- No indication of their previous data
- Risk of typos/inconsistent naming

### Solution
- Check for existing (inactive) membership when join page loads
- Pre-fill player name, faction, and army name
- User can edit before rejoining
- API already handles reactivation + updates

---

## 📁 Feature 1 Files Modified

### 1. `app/pages/leagues/join.vue`

**Added Auth Import**:
```javascript
import { useAuthStore } from '~/stores/auth'
```

**Pre-fill Logic in onMounted**:
```javascript
// After fetching league and factions...

// Check for existing inactive membership
try {
  const authStore = useAuthStore()
  const membershipResponse = await $fetch(
    `/api/leagues/${leagueIdFromUrl}/membership?userId=${authStore.user?.id}`
  )

  if (membershipResponse.success && membershipResponse.data) {
    const existingMembership = membershipResponse.data

    // Pre-fill form with existing data
    if (existingMembership.player) {
      playerName.value = existingMembership.player.name || ''
      faction.value = existingMembership.player.faction || ''
    }
    armyName.value = existingMembership.armyName || ''
  }
} catch {
  // No existing membership, that's fine - form stays empty
}
```

**User Experience**:
- User visits join page
- If they previously left, sees their old data pre-filled
- Can edit any field before rejoining
- Submits → API updates player + membership

---

### 2. `server/api/leagues/[id]/membership.get.ts` (NEW)

**Purpose**: Fetch user's membership for a league (any status)

**Endpoint**: `GET /api/leagues/:id/membership?userId=123`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "leagueId": 5,
    "userId": 10,
    "playerId": 15,
    "role": "player",
    "armyName": "Emperor's Fist",
    "joinedAt": "2025-01-15T10:00:00Z",
    "status": "inactive",
    "player": {
      "id": 15,
      "name": "John Doe",
      "faction": "Space Marines",
      "wins": 5,
      "losses": 2,
      ...
    }
  }
}
```

**If no membership**:
```json
{
  "success": true,
  "data": null
}
```

**Key Features**:
- Fetches **any status** (active or inactive)
- Joins with `players` table to get full player data
- Used only for pre-filling form

---

## 🚀 Feature 2: Edit Army Name in Profile

### Problem
Once army name was set during join:
- No way to change it
- Typos were permanent
- Users might want to rebrand their army

### Solution
- Add edit icon next to army name in profile
- Inline editing with save/cancel
- API endpoint to update `leagueMemberships.armyName`
- Immediately updates new armies created

---

## 📁 Feature 2 Files Modified

### 1. `app/components/views/ProfileView.vue`

**New Imports**:
```javascript
import { Mail, Calendar, Save, Shield, Trophy, Users, Target, Flame, Swords, TrendingUp, Edit, X, Check } from 'lucide-vue-next'
```

**New State**:
```javascript
// Army name editing
const editingArmyName = ref(null) // leagueId being edited
const editArmyNameValue = ref('')
const armyNameError = ref(null)
const armyNameSuccess = ref(null)
```

**Edit Functions**:
```javascript
const startEditingArmyName = (player) => {
  editingArmyName.value = player.leagueId
  editArmyNameValue.value = player.armyName || ''
  armyNameError.value = null
  armyNameSuccess.value = null
}

const cancelEditingArmyName = () => {
  editingArmyName.value = null
  editArmyNameValue.value = ''
  armyNameError.value = null
}

const saveArmyName = async (leagueId) => {
  armyNameError.value = null
  armyNameSuccess.value = null

  if (!editArmyNameValue.value || editArmyNameValue.value.trim().length === 0) {
    armyNameError.value = 'Army name cannot be empty'
    return
  }

  try {
    await $fetch(`/api/users/me/army-name`, {
      method: 'PUT',
      body: {
        userId: profile.value.user.id,
        leagueId,
        armyName: editArmyNameValue.value.trim()
      }
    })

    // Refresh profile to show updated name
    await fetchUserProfile()

    armyNameSuccess.value = leagueId
    editingArmyName.value = null
    setTimeout(() => { armyNameSuccess.value = null }, 3000)
  } catch (error) {
    armyNameError.value = 'Failed to update army name'
    console.error('Error updating army name:', error)
  }
}
```

**UI Changes (Mobile)**:
```vue
<!-- Army Name with Edit -->
<div v-if="editingArmyName === player.leagueId" class="mt-2">
  <div class="flex items-center gap-2">
    <input
      v-model="editArmyNameValue"
      type="text"
      class="text-xs px-2 py-1 bg-gray-700 border border-yellow-500 rounded text-yellow-500"
      placeholder="Army name"
      maxlength="255"
      @keyup.enter="saveArmyName(player.leagueId)"
      @keyup.esc="cancelEditingArmyName"
    />
    <button @click="saveArmyName(player.leagueId)" class="text-green-400 hover:text-green-300">
      <Check :size="14" />
    </button>
    <button @click="cancelEditingArmyName" class="text-red-400 hover:text-red-300">
      <X :size="14" />
    </button>
  </div>
  <div v-if="armyNameError" class="text-xs text-red-400 mt-1">{{ armyNameError }}</div>
</div>
<div v-else class="text-xs text-yellow-500 flex items-center gap-1 mt-1">
  <Swords :size="12" />
  <span>{{ player.armyName || 'No army name set' }}</span>
  <button @click="startEditingArmyName(player)" class="text-gray-400 hover:text-yellow-400">
    <Edit :size="12" />
  </button>
</div>
<div v-if="armyNameSuccess === player.leagueId" class="text-xs text-green-400 mt-1">
  ✓ Army name updated!
</div>
```

**Same for Desktop** (slightly larger icons/text)

---

### 2. `server/api/users/me/army-name.put.ts` (NEW)

**Purpose**: Update user's army name for a specific league

**Endpoint**: `PUT /api/users/me/army-name`

**Request Body**:
```json
{
  "userId": 10,
  "leagueId": 5,
  "armyName": "New Army Name"
}
```

**Implementation**:
```typescript
// Update army name in league membership
const [updated] = await db
  .update(leagueMemberships)
  .set({
    armyName: body.armyName.trim()
  })
  .where(
    and(
      eq(leagueMemberships.leagueId, body.leagueId),
      eq(leagueMemberships.userId, body.userId)
    )
  )
  .returning()

if (!updated) {
  throw createError({
    statusCode: 404,
    statusMessage: 'League membership not found'
  })
}
```

**Response**:
```json
{
  "success": true,
  "message": "Army name updated successfully",
  "data": { membership object }
}
```

---

## 🔄 Data Flow

### Pre-fill Flow (Returning User)
```
User visits /leagues/join?leagueId=5
  ↓
onMounted() runs
  ↓
Fetch league data
  ↓
Check for existing membership
  ↓
GET /api/leagues/5/membership?userId=10
  ↓
If found (status=inactive):
  playerName.value = membership.player.name
  faction.value = membership.player.faction
  armyName.value = membership.armyName
  ↓
Form shows pre-filled data
  ↓
User can edit before submitting
  ↓
Submit → POST /api/leagues/5/join
  ↓
API updates player & reactivates membership
```

### Army Name Edit Flow
```
User clicks edit icon on profile
  ↓
editingArmyName = player.leagueId
  ↓
Input field appears with current name
  ↓
User types new name
  ↓
User clicks save (or Enter)
  ↓
PUT /api/users/me/army-name
  {
    userId: 10,
    leagueId: 5,
    armyName: "New Name"
  }
  ↓
Database: UPDATE league_memberships
  SET army_name = "New Name"
  WHERE league_id = 5 AND user_id = 10
  ↓
Refresh profile (fetchUserProfile)
  ↓
Success message shows
  ↓
New armies will use "New Name - Round X"
```

---

## 🎨 UI Components

### Join Page (Returning User)
```
┌─────────────────────────────────────┐
│ 👤 Your Player Profile              │
│                                     │
│ Player Name *                       │
│ [John Doe________________]  ← PRE-FILLED
│                                     │
│ Faction *                           │
│ [Space Marines ▼]           ← PRE-FILLED
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🛡️  Your Army                        │
│                                     │
│ Army Name *                         │
│ [Emperor's Fist__________]  ← PRE-FILLED
└─────────────────────────────────────┘
```

### Profile Page (Army Name Editing)
```
┌─────────────────────────────────────┐
│ Linked Players (3)                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🛡️  John Doe                     │ │
│ │ Space Marines                   │ │
│ │ ⚔️  Emperor's Fist  ✏️  ← CLICK   │ │
│ │                                 │ │
│ │ When editing:                   │ │
│ │ [New Army Name____] ✓ ✗         │ │
│ │                                 │ │
│ │ After save:                     │ │
│ │ ✓ Army name updated!            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## ✅ Benefits

### Pre-fill for Returning Users
- **Convenience** - Don't have to remember/retype everything
- **Consistency** - Less risk of typos or variations
- **Clarity** - User sees their previous identity
- **Flexibility** - Can still edit before rejoining

### Army Name Editing
- **Fix Typos** - Correct mistakes after joining
- **Rebrand** - Change army identity mid-league
- **Immediate Effect** - New armies use updated name
- **Persistent** - Existing armies keep their names
- **User Control** - Full control over army identity

---

## 🧪 Testing Checklist

### Pre-fill Feature
1. **New User**
   - Join league → Form is empty ✓

2. **Returning User**
   - Join league A as "Player 1", faction "Space Marines", army "Test Army"
   - Leave league A (set membership inactive)
   - Go to join page for league A
   - Verify form pre-filled with "Player 1", "Space Marines", "Test Army"
   - Edit one or more fields
   - Submit → Verify updates applied

3. **Error Cases**
   - API fails → Form stays empty (no crash)
   - No previous membership → Form empty

### Army Name Editing
1. **Edit Army Name**
   - Go to profile
   - Click edit icon next to army name
   - Input field appears with current name
   - Type new name
   - Click save → See success message
   - Refresh page → New name persists

2. **Validation**
   - Try to save empty name → Error message
   - Type new name, press Enter → Saves
   - Type new name, press Esc → Cancels

3. **Integration**
   - Update army name in profile
   - Go to Armies page, create new army
   - Verify name is "{new name} - Round X"
   - Escalate army → Verify still uses new name

4. **Edge Cases**
   - Edit army name for league A → Only affects league A
   - Edit army name → Existing armies unchanged
   - Edit army name with 255 characters → Works

---

## 🚀 Deployment Notes

### No Breaking Changes
- All changes are backward compatible
- New API endpoints (don't break existing)
- UI enhancements (progressive)

### New API Endpoints
1. `GET /api/leagues/:id/membership?userId=X`
   - Optional endpoint for pre-filling
   - Returns null if no membership

2. `PUT /api/users/me/army-name`
   - Updates `league_memberships.army_name`
   - Requires userId, leagueId, armyName

---

## 📊 Summary

| Feature | Before | After |
|---------|--------|-------|
| **Rejoining League** | Re-enter all info manually | Form pre-filled with old data |
| **Army Name Mistakes** | Permanent typos | Edit anytime in profile |
| **User Control** | Set once during join | Full control over army identity |
| **UI Feedback** | No indication of previous data | Clear pre-filled values + edit UI |
| **Data Consistency** | Risk of variations | Maintain consistency or intentionally change |

---

## 💡 Future Enhancements

1. **Show Previous Stats**
   - When rejoining, show "You had 5 wins, 2 losses before leaving"
   - Option to reset stats or continue

2. **Army Name History**
   - Track name changes over time
   - "Previously known as..."

3. **Bulk Edit**
   - Edit multiple league army names at once
   - "Apply to all leagues"

4. **Army Name Suggestions**
   - AI-powered suggestions based on faction
   - "Popular names for Space Marines"

5. **Name Validation**
   - Check for duplicates in league
   - Character restrictions
   - Profanity filter

---

**Implementation Complete**: All 4 files updated ✅  
**Ready for Testing**: Manual testing required  
**Documentation**: Complete reference for both features
