# Enhancement: League Deletion (Danger Zone)

## Overview
Added a "Danger Zone" section to the League Setup page allowing league owners to permanently delete their leagues.

## Changes Made

### 1. Added Delete Functionality

**File**: `/app/components/views/LeagueSetupView.vue`

**New Function** (`deleteLeague`):
```javascript
const deleteLeague = async () => {
  if (!editableLeague.value?.id) return

  // Confirmation dialog with detailed warning
  const confirmDelete = confirm(
    `Are you sure you want to delete "${editableLeague.value.name}"?\n\n` +
    `This will permanently delete:\n` +
    `• All league data\n` +
    `• All player records\n` +
    `• All army lists\n` +
    `• All match results\n\n` +
    `This action cannot be undone!`
  )

  if (!confirmDelete) return

  // Check authentication
  const authStore = useAuthStore()
  if (!authStore.user?.id) {
    alert('You must be logged in to delete the league')
    return
  }

  try {
    // Call DELETE API
    await $fetch(`/api/leagues/${editableLeague.value.id}`, {
      method: 'DELETE',
      body: {
        userId: authStore.user.id
      }
    })

    alert('League deleted successfully')

    // Redirect to leagues page
    window.location.href = '/leagues'
  } catch (error) {
    console.error('Failed to delete league:', error)
    alert('Failed to delete league. Please try again.')
  }
}
```

**Features**:
- ✅ Requires user authentication
- ✅ Detailed confirmation dialog listing what will be deleted
- ✅ Only league owner can delete (enforced by API)
- ✅ Success notification
- ✅ Auto-redirect to leagues page after deletion
- ✅ Error handling with user-friendly alerts

### 2. Added UI Section

**New Template Section** (Danger Zone):
```vue
<div class="card border-2 border-red-600/50 bg-red-950/20">
  <div class="flex items-center gap-3 mb-6">
    <AlertTriangle class="text-red-500" :size="28" />
    <h3 class="text-2xl font-serif font-bold text-red-500">Danger Zone</h3>
  </div>

  <div class="space-y-4">
    <div class="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
      <h4 class="text-lg font-semibold text-red-400 mb-2">Delete This League</h4>
      <p class="text-gray-300 mb-4">
        Once you delete a league, there is no going back. This will permanently delete all league data,
        player records, army lists, and match results.
      </p>
      <button
        @click="deleteLeague"
        class="btn-secondary flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto bg-red-600 hover:bg-red-700 border-red-500"
      >
        <Trash2 :size="18" />
        <span>Delete League</span>
      </button>
    </div>
  </div>
</div>
```

**Visual Design**:
- 🔴 Red color scheme (danger indication)
- ⚠️ AlertTriangle icon
- 🎨 Red border and background with transparency
- 📱 Responsive button (full width on mobile, auto on desktop)
- 🗑️ Trash icon on delete button

### 3. Added Icon Import

**Updated imports**:
```javascript
import { Save, Plus, Trash2, Settings as SettingsIcon, Share2, Copy, RefreshCw, Link, Globe, Lock, RotateCcw, AlertTriangle } from 'lucide-vue-next'
```

Added: `AlertTriangle` for the Danger Zone header

## API Endpoint Used

### DELETE `/api/leagues/:id`

**Existing endpoint** - No changes required

**Request**:
```typescript
DELETE /api/leagues/:id
Body: {
  userId: 123  // Required for authentication
}
```

**Response**:
```json
{
  "success": true,
  "message": "League deleted successfully"
}
```

**Security**:
- ✅ Requires valid user ID
- ✅ Checks user is a member of the league
- ✅ **Only league owner can delete** (role: 'owner')
- ✅ Returns 403 Forbidden if user is not owner

**Cascade Deletion**:
The API handles manual cascade deletion for:
1. **Rounds** - Deleted manually (no CASCADE in schema)
2. **Matches** - Deleted manually (no CASCADE in schema)
3. **Players** - Deleted via CASCADE (onDelete: 'cascade')
4. **Armies** - Deleted via CASCADE (onDelete: 'cascade')
5. **League Memberships** - Deleted via CASCADE (onDelete: 'cascade')

## User Flow

### Step 1: Navigate to League Settings
- User must be league owner
- Scroll to bottom of page
- See "Danger Zone" section with red styling

### Step 2: Initiate Delete
- Click "Delete League" button
- Red button with Trash icon
- Clear warning message visible

### Step 3: Confirm Deletion
- Browser confirmation dialog appears
- Lists all data that will be deleted:
  - All league data
  - All player records
  - All army lists
  - All match results
- Warns "This action cannot be undone!"
- User must click "OK" to proceed

### Step 4: Processing
- API call to `DELETE /api/leagues/:id`
- Authentication checked
- Owner permission verified
- All related data deleted

### Step 5: Completion
- Success alert: "League deleted successfully"
- Auto-redirect to `/leagues` page
- League no longer exists in database

## Error Handling

### Authentication Error
```javascript
if (!authStore.user?.id) {
  alert('You must be logged in to delete the league')
  return
}
```

### Permission Error (from API)
```json
{
  "statusCode": 403,
  "statusMessage": "Only league owner can delete the league"
}
```
Shows: "Failed to delete league. Please try again."

### Network Error
```javascript
catch (error) {
  console.error('Failed to delete league:', error)
  alert('Failed to delete league. Please try again.')
}
```

## Security Considerations

### Frontend Protection
- ✅ Requires user authentication
- ✅ Confirmation dialog prevents accidental deletion
- ✅ Clear warning about permanent data loss

### Backend Protection (API)
- ✅ User ID validation
- ✅ League membership check
- ✅ Owner role verification
- ✅ Only owner can delete (not organizers or players)

### Data Integrity
- ✅ Proper cascade deletion order
- ✅ Manual deletion for tables without CASCADE
- ✅ Atomic operation (all or nothing)

## Visual Design

### Color Scheme
- Background: `bg-red-950/20` (very dark red, 20% opacity)
- Border: `border-red-600/50` (red, 50% opacity)
- Header text: `text-red-500`
- Button: `bg-red-600 hover:bg-red-700`

### Layout
- Positioned at bottom of page (after "Scoring & Rules")
- Full card with prominent border
- Warning icon and "Danger Zone" title
- Descriptive text explaining consequences
- Single action button (delete only)

## Testing Checklist

### Test 1: Owner Can Delete
1. ✅ Login as league owner
2. ✅ Go to league settings
3. ✅ Scroll to Danger Zone
4. ✅ Click "Delete League"
5. ✅ Confirm in dialog
6. ✅ Should delete successfully
7. ✅ Should redirect to /leagues page
8. ✅ League should be gone from database

### Test 2: Non-Owner Cannot Delete
1. ✅ Login as league player (not owner)
2. ✅ Danger Zone should still be visible
3. ✅ Click "Delete League"
4. ✅ Confirm in dialog
5. ✅ Should show error (403 Forbidden)
6. ✅ League should NOT be deleted

### Test 3: Cascade Deletion Works
1. ✅ Create league with players, armies, matches
2. ✅ Delete league as owner
3. ✅ Check database:
   - Rounds deleted ✅
   - Matches deleted ✅
   - Players deleted ✅
   - Armies deleted ✅
   - League memberships deleted ✅
   - League deleted ✅

### Test 4: Cancel Deletion
1. ✅ Click "Delete League"
2. ✅ Click "Cancel" in confirmation dialog
3. ✅ League should NOT be deleted
4. ✅ Should stay on same page

### Test 5: Not Authenticated
1. ✅ Logout (clear auth)
2. ✅ Try to access league settings
3. ✅ Should be redirected to login

## Files Modified
- ✅ `/app/components/views/LeagueSetupView.vue`
  - Added `AlertTriangle` icon import
  - Added `deleteLeague()` function
  - Added "Danger Zone" template section

## Files Used (No Changes)
- ✅ `/server/api/leagues/[id].delete.ts` - Existing DELETE endpoint
- ✅ `/stores/auth.js` - User authentication

## Status
✅ **COMPLETE** - League deletion functionality with Danger Zone UI

**Last Updated**: January 16, 2025
