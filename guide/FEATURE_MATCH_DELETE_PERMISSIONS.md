# Feature: Match Deletion with Role-Based Permissions

**Date**: October 17, 2025  
**Status**: ✅ Implemented  
**Priority**: High (Security & UX)

## Overview

Implemented secure match deletion with role-based permissions. Only league owners/organizers and match participants can delete matches.

## Permission Rules

### Who Can Delete a Match?

1. **League Owner** - Can delete any match in their league
2. **League Organizer** - Can delete any match in the league
3. **Match Participants** - Can only delete matches they played in

### Who CANNOT Delete a Match?

- Players who didn't participate in the match
- Users who are not members of the league
- Anonymous/unauthenticated users

## Implementation Details

### API Endpoint

**File**: `server/api/matches.[id].delete.ts`

```typescript
DELETE /api/matches/:id
```

**Authentication**: Required (via Auth0)

**Permission Check Logic**:
1. Verify user is authenticated
2. Fetch the match from database
3. Check if user is owner/organizer of the league
4. OR check if user is a participant (player1 or player2)
5. If neither, return 403 Forbidden

**Response Codes**:
- `200` - Match deleted successfully
- `401` - Not authenticated
- `403` - No permission to delete this match
- `404` - Match not found
- `500` - Server error

### Store Method

**File**: `app/stores/leagues.js`

```javascript
async deleteMatch(matchId) {
  // Calls DELETE /api/matches/:id
  // Updates local matches array
  // Refreshes player stats
}
```

### Component Logic

**File**: `app/components/views/MatchesView.vue`

**Permission Check Function**:
```javascript
const canDeleteMatch = (match) => {
  // Organizers can delete any match
  if (canManageLeague.value) return true
  
  // Participants can delete their own matches
  if (currentPlayer.value) {
    return match.player1Id === currentPlayer.value.id || 
           match.player2Id === currentPlayer.value.id
  }
  
  return false
}
```

**UI Behavior**:
- Delete button only shown if `canDeleteMatch(match)` returns `true`
- Confirmation modal before deletion
- Success: Match removed from list, player stats updated
- Error: Error message displayed to user

### Page Integration

**File**: `app/pages/matches.vue`

```vue
<ViewsMatchesView
  :matches="matches"
  :players="players"
  @add-match="leaguesStore.addMatch"
  @delete-match="leaguesStore.deleteMatch"
/>
```

## Database Impact

**Table**: `matches`

**Delete Behavior**:
- Hard delete (row removed from database)
- Cascade behavior: None (matches are leaf records)
- Player stats recalculated after deletion via `fetchPlayers()`

**Related Tables Updated**:
- `players` - Stats recalculated (wins/losses/draws/totalPoints)

## Security Considerations

### ✅ Security Features

1. **Authentication Required** - Must be logged in via Auth0
2. **Authorization Check** - Verifies user has permission
3. **League Context** - Ensures match belongs to a league user is in
4. **Player Validation** - Confirms user's player entity matches participant

### 🔒 Protection Against

- ❌ Deleting other players' matches (unless organizer)
- ❌ Deleting matches from other leagues
- ❌ Anonymous deletion attempts
- ❌ Bypassing UI permissions via API calls

## User Experience

### For Organizers
- ✅ Can delete any match in their league
- ✅ Delete button visible on all match cards
- ✅ Useful for correcting errors or managing tournament data

### For Players
- ✅ Can delete matches they participated in
- ✅ Delete button only visible on their own matches
- ✅ Gives players control over their own data
- ✅ Useful for removing duplicate entries

### For Observers
- ❌ No delete button shown
- 👁️ Can view match history but not modify

## Testing Scenarios

### Manual Test Cases

**Test 1: Owner Deletes Any Match**
1. Log in as league owner
2. Navigate to Matches page
3. ✅ Delete button visible on all matches
4. Click delete on any match
5. Confirm deletion
6. ✅ Match removed, stats updated

**Test 2: Player Deletes Own Match**
1. Log in as player
2. Navigate to Matches page
3. ✅ Delete button visible only on matches they played
4. Click delete on own match
5. Confirm deletion
6. ✅ Match removed, stats updated

**Test 3: Player Tries to Delete Other's Match**
1. Log in as player
2. Navigate to Matches page
3. ✅ Delete button NOT visible on other players' matches
4. ✅ Cannot delete via UI

**Test 4: API Permission Check**
1. Attempt DELETE request to `/api/matches/:id` for match player didn't participate in
2. ✅ Receives 403 Forbidden
3. ✅ Match not deleted

**Test 5: Stats Recalculation**
1. Delete a match
2. Check player stats
3. ✅ Wins/losses/draws updated correctly
4. ✅ Total points recalculated

## Edge Cases Handled

1. **User not in league** - 403 Forbidden
2. **Match doesn't exist** - 404 Not Found
3. **Invalid match ID** - 400 Bad Request
4. **Database error** - 500 Server Error
5. **User not logged in** - 401 Unauthorized

## Files Modified

1. ✅ `server/api/matches.[id].delete.ts` - New API endpoint
2. ✅ `app/stores/leagues.js` - Added `deleteMatch()` method
3. ✅ `app/components/views/MatchesView.vue` - Added permission check & delete button
4. ✅ `app/pages/matches.vue` - Connected delete event
5. ✅ `app/composables/useConfirmation.js` - Fixed default callback (from previous bug fix)

## Future Enhancements

### Possible Improvements
- [ ] Soft delete with archive functionality
- [ ] Audit log of deleted matches
- [ ] Undo deletion within 5 seconds
- [ ] Batch delete for organizers
- [ ] Match deletion history

### Performance Considerations
- Player stats refresh could be optimized to update only affected players
- Consider caching player stats with invalidation on match changes

## Related Features

- **Match Creation** - Complements the existing add match feature
- **Player Stats** - Automatically recalculates after deletion
- **Role-Based Access** - Uses same permission system as other features
- **League Management** - Respects league ownership hierarchy

## Code Quality

- ✅ Zero lint errors
- ✅ TypeScript type safety
- ✅ Consistent with existing patterns
- ✅ Proper error handling
- ✅ Security best practices
- ✅ Composable reusability

---

**Implemented by**: AI Assistant  
**Verified**: Lint passing, permission logic tested  
**Documentation**: Complete
