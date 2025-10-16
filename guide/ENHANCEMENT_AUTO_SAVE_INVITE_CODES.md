# Enhancement: Auto-Save Invite Codes and Share URLs

## Problem
When generating invite codes or share URLs in league settings, the codes were only stored in the local form state and required manually clicking "Save League Settings" to persist them to the database. This created a poor user experience:
- Users could copy codes that weren't saved yet
- Codes would disappear on page refresh
- Confusion about whether codes were actually active

## Solution
Invite codes and share URLs are now **automatically saved to the database** when generated, without requiring a manual save action.

## Changes Made

### 1. Auto-Save on Invite Code Regeneration

**File**: `/app/components/views/LeagueSetupView.vue`

**Before**:
```javascript
const regenerateInviteCode = async () => {
  const newCode = generateInviteCode()
  editableLeague.value.inviteCode = newCode
  inviteCodeCopied.value = false
  // Note: This will be saved when the user saves the league
}
```

**After**:
```javascript
const regenerateInviteCode = async () => {
  if (!editableLeague.value?.id) {
    // If league doesn't exist yet, just generate locally
    const newCode = generateInviteCode()
    editableLeague.value.inviteCode = newCode
    inviteCodeCopied.value = false
    return
  }

  // Get userId from auth store
  const authStore = useAuthStore()
  if (!authStore.user?.id) {
    alert('You must be logged in to regenerate the invite code')
    return
  }

  const newCode = generateInviteCode()
  
  try {
    // Save to database immediately
    const response = await $fetch(`/api/leagues/${editableLeague.value.id}`, {
      method: 'PATCH',
      body: {
        userId: authStore.user.id,
        inviteCode: newCode
      }
    })

    // Update local state with response
    editableLeague.value.inviteCode = response.data.inviteCode
    inviteCodeCopied.value = false
    
    // Show success notification
    alert('Invite code regenerated and saved!')
  } catch (error) {
    console.error('Failed to regenerate invite code:', error)
    alert('Failed to regenerate invite code. Please try again.')
  }
}
```

**Benefits**:
- ✅ Immediately saves to database via PATCH `/api/leagues/:id`
- ✅ Shows success confirmation
- ✅ Handles errors gracefully
- ✅ Works for new leagues (generates locally until saved)
- ✅ Requires authentication

### 2. Auto-Generate and Save on Privacy Toggle

**Added new watcher**:
```javascript
// Watch for isPrivate changes to auto-generate invite code
watch(() => editableLeague.value?.isPrivate, async (newValue, oldValue) => {
  // Only act when switching from false to true
  if (newValue === true && oldValue === false && !editableLeague.value.inviteCode) {
    const newCode = generateInviteCode()
    editableLeague.value.inviteCode = newCode
    
    // Save to database if league exists
    if (editableLeague.value.id) {
      const authStore = useAuthStore()
      if (authStore.user?.id) {
        try {
          await $fetch(`/api/leagues/${editableLeague.value.id}`, {
            method: 'PATCH',
            body: {
              userId: authStore.user.id,
              inviteCode: newCode
            }
          })
        } catch (error) {
          console.error('Failed to save auto-generated invite code:', error)
        }
      }
    }
  }
})
```

**Behavior**:
- When you toggle "Private League" from OFF → ON
- Automatically generates an invite code
- Saves it to the database immediately (if league exists)
- Silent save (no alert) since it's automatic

### 3. Auto-Save on Initial Load for Private Leagues

**Updated `onMounted` hook**:
```javascript
onMounted(async () => {
  if (editableLeague.value?.shareToken) {
    const baseUrl = window.location.origin
    shareUrl.value = `${baseUrl}/join/${editableLeague.value.shareToken}`
  }

  // Generate and save invite code if league is private and doesn't have one
  if (editableLeague.value?.isPrivate && !editableLeague.value.inviteCode) {
    const newCode = generateInviteCode()
    editableLeague.value.inviteCode = newCode
    
    // Save to database if league exists
    if (editableLeague.value.id) {
      const authStore = useAuthStore()
      if (authStore.user?.id) {
        try {
          await $fetch(`/api/leagues/${editableLeague.value.id}`, {
            method: 'PATCH',
            body: {
              userId: authStore.user.id,
              inviteCode: newCode
            }
          })
        } catch (error) {
          console.error('Failed to save auto-generated invite code:', error)
        }
      }
    }
  }
})
```

**Use Case**:
- Handles edge case where a league is marked private but has no invite code
- Generates and saves one automatically on page load
- Silent operation (no user interruption)

### 4. Share URL Generation (Already Working)

The `generateShareUrl` function was **already** saving to the database:

```javascript
const generateShareUrl = async () => {
  if (!editableLeague.value?.id) return

  isGeneratingUrl.value = true
  try {
    const response = await $fetch(`/api/leagues/${editableLeague.value.id}/share-url`, {
      method: 'POST'
    })

    shareUrl.value = response.data.shareUrl
    editableLeague.value.shareToken = response.data.shareToken
  } catch (error) {
    console.error('Failed to generate share URL:', error)
    alert('Failed to generate share URL. Please try again.')
  } finally {
    isGeneratingUrl.value = false
  }
}
```

**How it works**:
- Calls `POST /api/leagues/:id/share-url`
- Server generates secure token with `crypto.randomBytes(16)`
- Saves token to database
- Returns full share URL
- No manual save required ✅

## User Experience Flow

### Creating a New Private League

1. **Create League Form** (before league exists)
   - Toggle "Private League" → ON
   - Invite code generates locally (not saved yet - league doesn't exist)
   - Click "Create League"
   - League created with invite code in database

2. **League Settings Page** (existing league)
   - Toggle "Private League" → ON
   - Invite code generates and **saves immediately** ✅
   - No need to click "Save League Settings"
   - Ready to share instantly

### Regenerating Invite Code

1. Click "Regenerate" button
2. **Code immediately saved to database** ✅
3. Success alert shown
4. New code is active immediately
5. Old code is invalidated

### Generating Share URL

1. Click "Generate" button
2. **URL immediately saved to database** ✅
3. Displays in read-only input field
4. Can copy and share right away
5. No manual save required

## API Endpoints Used

### Update League (PATCH `/api/leagues/:id`)
```typescript
// Updates specific fields without affecting others
PATCH /api/leagues/:id
Body: {
  userId: 123,
  inviteCode: "ABC123XY"  // Only update invite code
}
```

**Features**:
- Partial updates (only provided fields)
- Requires authentication (userId)
- Permission check (owner/organizer only)
- Returns updated league data

### Generate Share URL (POST `/api/leagues/:id/share-url`)
```typescript
// Generates new share token and saves it
POST /api/leagues/:id/share-url

Response: {
  success: true,
  data: {
    shareUrl: "https://yoursite.com/join/abc123...",
    shareToken: "abc123def456..."
  }
}
```

**Features**:
- Generates cryptographically secure token
- Saves to database immediately
- Returns full share URL
- Invalidates previous share URL

## Testing Checklist

### Test 1: Regenerate Invite Code
1. ✅ Go to League Settings for existing league
2. ✅ League is set to Private
3. ✅ Click "Regenerate" button
4. ✅ Should see "Invite code regenerated and saved!" alert
5. ✅ Refresh page - code should persist
6. ✅ Try joining with new code - should work

### Test 2: Toggle Private On
1. ✅ Go to League Settings for existing PUBLIC league
2. ✅ Toggle "Private League" to ON
3. ✅ Invite code should appear immediately
4. ✅ Refresh page - code should persist
5. ✅ No need to click "Save League Settings"

### Test 3: Generate Share URL
1. ✅ Set league to Private
2. ✅ Enable "Allow direct join via share link"
3. ✅ Click "Generate" button
4. ✅ Share URL should appear immediately
5. ✅ Copy and open in new browser tab/incognito
6. ✅ Should be able to join league

### Test 4: New Private League
1. ✅ Create new league, set to Private
2. ✅ Invite code generates in form
3. ✅ Click "Create League"
4. ✅ Go to league settings
5. ✅ Invite code should be saved in database

### Test 5: Private League Without Code (Edge Case)
1. ✅ Manually set a league to `isPrivate: true` in database with `inviteCode: null`
2. ✅ Open League Settings page
3. ✅ Should auto-generate and save invite code on mount
4. ✅ Check database - code should be saved

## Implementation Details

### Dependencies Added
- Added `useAuthStore` import to `LeagueSetupView.vue`
- Uses existing `PATCH /api/leagues/:id` endpoint
- Uses existing `POST /api/leagues/:id/share-url` endpoint

### Error Handling
- **Authentication check**: Alerts user if not logged in
- **Network errors**: Shows alert with error message
- **Silent errors**: Console logs for automatic saves (on mount/toggle)
- **Graceful fallback**: New leagues generate locally until created

### Security
- All saves require valid user session
- Permission checks (owner/organizer only)
- Uses existing authentication system
- Cryptographically secure share tokens

## Files Modified
- ✅ `/app/components/views/LeagueSetupView.vue` - Main implementation
  - Added `useAuthStore` import
  - Updated `regenerateInviteCode()` with auto-save
  - Added watcher for `isPrivate` changes
  - Updated `onMounted()` with auto-save
  - No changes to `generateShareUrl()` (already worked correctly)

## API Endpoints (No Changes Required)
- ✅ `PATCH /api/leagues/:id` - Already supports `inviteCode` field
- ✅ `POST /api/leagues/:id/share-url` - Already saves to database

## Related Documentation
- See `BUG_FIX_INVITE_CODE_JOIN.md` for invite code join fixes
- See `FEATURE_PUBLIC_LEAGUES_DISCOVERY.md` for league discovery features

## Status
✅ **COMPLETE** - Invite codes and share URLs now auto-save immediately

**Last Updated**: January 16, 2025
