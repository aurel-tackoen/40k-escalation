# Feature: Create Player After League Creation

## Overview
When a user creates a new league, they automatically become the league owner and a league member is created. However, they don't have a **player entity** yet, which is required to:
- Record matches
- Build army lists
- Track painting progress
- Appear in league standings

This feature adds an optional prompt to create a player profile immediately after league creation.

---

## User Flow

### 1. League Creation
User fills out the league creation form at `/leagues/create`:
- Game system selection
- League name, description, dates
- Privacy settings
- Round configuration
- League rules

### 2. Success Modal
After successful league creation, instead of immediately redirecting to the dashboard, a modal appears prompting the user to create their player profile.

**Modal Features:**
- ✅ **Optional** - User can skip this step
- ✅ Pre-populated with user's name from Auth0
- ✅ Dynamic faction list based on selected game system
- ✅ Clear explanation of why they need a player profile
- ✅ Can be dismissed with "Skip for Now" button

### 3. Player Creation or Skip
**Option A: Create Player**
- User enters player name (pre-filled with Auth0 name)
- Selects their faction from game system-specific factions
- Enters an army name (e.g., "Emperor's Fist", "Green Tide")
- Submits form
- Player entity created in database
- League membership updated with player ID and army name
- Redirects to dashboard with player profile ready

**Option B: Skip**
- User clicks "Skip for Now"
- Redirects to dashboard without player profile
- Can create player later from Players page

---

## Implementation Details

### Components

#### 1. `CreatePlayerModal.vue`
**Location:** `/app/components/CreatePlayerModal.vue`

**Props:**
- `show` (Boolean) - Controls modal visibility
- `leagueName` (String) - Name of the newly created league
- `userName` (String) - User's name from Auth0 (pre-fill)
- `availableFactions` (Array) - Factions for current game system

**Emits:**
- `create-player` - Emitted with `{ name, faction, armyName }` when user submits
- `skip` - Emitted when user skips player creation
- `close` - Emitted when user closes modal (X button)

**Features:**
- Form validation (name, faction, and army name required)
- Pre-populated player name from Auth0
- Dynamic faction dropdown from league's game system
- Army name input field with helpful placeholder
- Escape key to skip
- Prevents body scroll when open
- Teleported to `<body>` for proper z-index

#### 2. Updated `leagues/create.vue`
**Location:** `/app/pages/leagues/create.vue`

**New State:**
```javascript
const showCreatePlayerModal = ref(false)
const createdLeagueName = ref('')
const creatingPlayer = ref(false)
```

**New Functions:**
```javascript
handleCreatePlayer(playerData) {
  // Creates player entity with:
  // - leagueId (from current league)
  // - userId (from Auth0)
  // - name (from form)
  // - faction (from form)
  // Then refreshes league data and redirects
}

handleSkipPlayer() {
  // Simply closes modal and redirects
}
```

**Modified `handleSubmit()`:**
- After successful league creation, shows modal instead of immediate redirect
- Stores league name for modal display

**New `handleCreatePlayer(playerData)`:**
- Creates player entity via POST `/api/players`
- Updates league membership via PUT `/api/leagues/:id/members/:userId` with:
  - `playerId` - Link to newly created player
  - `armyName` - Persistent army name for this league
- Refreshes league data to include new player
- Redirects to dashboard

**New `handleSkipPlayer()`:**
- Closes modal without creating player
- Redirects to dashboard

---

## Database Impact

### No Schema Changes Required
This feature uses the existing `players` table structure:

```typescript
players: {
  id: integer (PK)
  leagueId: integer (FK -> leagues.id, cascade)
  userId: integer (FK -> users.id, cascade)
  name: varchar(255)
  faction: varchar(100)
  wins, losses, draws, totalPoints: integer (defaults to 0)
  createdAt: timestamp
}
```

### API Endpoint Used
**POST `/api/players`**
```json
{
  "leagueId": 1,
  "userId": 42,
  "name": "John Doe",
  "faction": "Space Marines"
}
```

**PUT `/api/leagues/:id/members/:userId`**
```json
{
  "playerId": 123,
  "armyName": "Emperor's Fist"
}
```
Updates the league membership with the player ID and army name.

---

## User Benefits

### 1. Streamlined Onboarding
- No need to hunt for "Players" page after league creation
- Natural flow: create league → create player → start playing

### 2. Optional & Non-Blocking
- Power users can skip if they want to configure more first
- New users get guided through the necessary step

### 3. Pre-filled Data
- Uses Auth0 name automatically
- Shows only relevant factions for chosen game system
- Reduces user friction

### 4. Clear Value Proposition
Modal explains **why** creating a player is useful:
> "Would you like to create your player profile now so you can start recording matches and building army lists?"

---

## Testing Checklist

### Manual Testing
- [ ] Create new league
- [ ] Modal appears after submission
- [ ] User name is pre-filled from Auth0
- [ ] Faction dropdown shows correct game system factions
- [ ] Army name field is present and required
- [ ] "Create Player Profile" button works
- [ ] Player entity created in database
- [ ] League membership updated with player ID and army name
- [ ] Redirects to dashboard with player visible
- [ ] "Skip for Now" button works
- [ ] Redirects to dashboard without player
- [ ] Can create player later from Players page
- [ ] Escape key closes modal (skip behavior)
- [ ] X button closes modal (skip behavior)
- [ ] Clicking outside modal closes it (skip behavior)

### Edge Cases
- [ ] No factions available (shouldn't happen, but handle gracefully)
- [ ] API error when creating player (show error message)
- [ ] User already has player in league (API handles this)
- [ ] Multiple rapid clicks on submit (loading state prevents)

---

## Future Enhancements

### Possible Improvements
1. **Remember Choice** - Store in localStorage if user frequently skips
2. **Army Name Input** - Add optional army name field to modal
3. **Faction Hint** - Show faction descriptions/icons
4. **Player Avatar** - Allow avatar selection in modal
5. **Multi-Step Wizard** - Create player → Create first army → Record first match

### Related Features
- Could extend to other "first-time" experiences
- Similar pattern for joining a league
- Could be used for league settings tour

---

## Code Examples

### Opening the Modal (in parent component)
```vue
<script setup>
const showCreatePlayerModal = ref(false)
const createdLeagueName = ref('')

const onLeagueCreated = (leagueName) => {
  createdLeagueName.value = leagueName
  showCreatePlayerModal.value = true
}
</script>

<template>
  <CreatePlayerModal
    :show="showCreatePlayerModal"
    :league-name="createdLeagueName"
    :user-name="authStore.user?.name"
    :available-factions="leaguesStore.factions"
    @create-player="handleCreatePlayer"
    @skip="handleSkipPlayer"
    @close="handleSkipPlayer"
  />
</template>
```

### Handling Player Creation
```javascript
const handleCreatePlayer = async (playerData) => {
  creatingPlayer.value = true
  try {
    // Step 1: Create player entity
    const playerResponse = await $fetch('/api/players', {
      method: 'POST',
      body: {
        leagueId: currentLeague.id,
        userId: authStore.user.id,
        name: playerData.name,
        faction: playerData.faction
      }
    })

    if (playerResponse.success) {
      // Step 2: Update league membership with player ID and army name
      const membershipResponse = await $fetch(`/api/leagues/${currentLeague.id}/members/${authStore.user.id}`, {
        method: 'PUT',
        body: {
          playerId: playerResponse.data.id,
          armyName: playerData.armyName
        }
      })

      if (membershipResponse.success) {
        await leaguesStore.fetchLeagueData()
        showCreatePlayerModal.value = false
        navigateTo('/dashboard')
      }
    }
  } catch (err) {
    alert('Failed to create player: ' + err.message)
  } finally {
    creatingPlayer.value = false
  }
}
```

---

## Files Modified

### New Files
- `/app/components/CreatePlayerModal.vue` - Modal component with player name, faction, and army name fields
- `/server/api/leagues/[id]/members/[userId]/index.put.ts` - Update membership endpoint

### Modified Files
- `/app/pages/leagues/create.vue` - League creation page with modal integration

### No Changes Required
- `/api/players` POST endpoint (uses existing endpoint)
- Database schema (uses existing `players` and `leagueMemberships` tables)
- Stores (uses existing `leaguesStore` and `authStore`)

---

## Accessibility

### Keyboard Navigation
- ✅ Escape key closes modal
- ✅ Tab navigation through form fields
- ✅ Enter key submits form

### Screen Readers
- ✅ Modal has proper ARIA labels
- ✅ Close button has `aria-label="Close"`
- ✅ Required fields marked with asterisks
- ✅ Error messages announced

### Visual Design
- ✅ High contrast borders (purple accent)
- ✅ Clear button hierarchy (primary vs secondary)
- ✅ Descriptive helper text
- ✅ Loading states for async actions

---

## Deployment Notes

### Zero Breaking Changes
- Feature is additive only
- No database migrations needed
- Existing users unaffected
- Can be deployed without downtime

### Rollback Plan
If issues arise, simply revert the two file changes:
1. Delete `CreatePlayerModal.vue`
2. Restore original `leagues/create.vue`

### Performance Impact
- Minimal (one additional modal component loaded)
- No additional API calls unless user creates player
- Modal uses Vue Teleport for optimal rendering

---

## Success Metrics

### How to Measure Success
1. **Adoption Rate** - % of league creators who create player immediately
2. **Time to First Match** - Reduced if users have player ready
3. **Support Tickets** - Reduced "how do I record matches?" questions
4. **User Feedback** - Positive sentiment about onboarding flow

### Expected Outcomes
- 60%+ of users will create player immediately
- 30%+ reduction in "getting started" support questions
- Improved user retention in first session

---

**Status:** ✅ Implemented  
**Last Updated:** October 18, 2025  
**Author:** AI Assistant
