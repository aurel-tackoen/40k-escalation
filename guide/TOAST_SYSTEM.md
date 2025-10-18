# Toast Notification System

## Overview
A lightweight, reusable toast notification system that replaces browser `alert()` calls with elegant, non-blocking notifications.

## Components

### 1. **useToast.js** Composable
Location: `app/composables/useToast.js`

Provides a reactive toast management system with clear, descriptive function names.

**Exported Functions:**
```javascript
const {
  toasts,          // Reactive array of active toasts
  addToast,        // Add a custom toast
  removeToast,     // Remove a toast by ID
  toastSuccess,    // Show success message (green, 3s)
  toastError,      // Show error message (red, 5s)
  toastWarning,    // Show warning message (yellow, 4s)
  toastInfo        // Show info message (blue, 3s)
} = useToast()
```

### 2. **ToastContainer.vue** Component
Location: `app/components/ToastContainer.vue`

A fixed-position container that displays toast notifications in the top-right corner.

**Features:**
- ✅ Smooth slide-in/slide-out animations
- ✅ Auto-dismiss with configurable duration
- ✅ Manual dismiss via close button
- ✅ Color-coded by type (success/error/warning/info)
- ✅ Icon indicators (CheckCircle, XCircle, AlertTriangle, Info)
- ✅ Stacking support for multiple toasts
- ✅ Backdrop blur effect
- ✅ Responsive max-width

## Usage

### Basic Usage
```vue
<script setup>
import { useToast } from '~/composables/useToast'

const { toastSuccess, toastError, toastWarning, toastInfo } = useToast()

const saveData = async () => {
  try {
    await $fetch('/api/save', { method: 'POST' })
    toastSuccess('Data saved successfully!')
  } catch (error) {
    toastError('Failed to save data. Please try again.')
  }
}

const validateForm = () => {
  if (!formValid) {
    toastWarning('Please fill in all required fields')
    return false
  }
  return true
}

const showInfo = () => {
  toastInfo('Round 2 starts tomorrow!')
}
</script>
```

### Custom Duration
```javascript
// Success toast for 1 second
toastSuccess('Saved!', 1000)

// Error toast for 10 seconds
toastError('Critical server error', 10000)

// Permanent toast (duration = 0, must be manually dismissed)
toastError('Action required!', 0)
```

### Custom Toast
```javascript
const { addToast } = useToast()

// Custom toast with full control
addToast('Custom message', 'warning', 5000)
```

## Toast Types

### Success (Green)
- **Duration**: 3 seconds (default)
- **Icon**: CheckCircle ✓
- **Use for**: Successful operations, confirmations
- **Example**: "League settings saved successfully!"

### Error (Red)
- **Duration**: 5 seconds (default)
- **Icon**: XCircle ✗
- **Use for**: Errors, failures, critical issues
- **Example**: "Failed to delete league. Please try again."

### Warning (Yellow)
- **Duration**: 4 seconds (default)
- **Icon**: AlertTriangle ⚠
- **Use for**: Warnings, validation errors, important notices
- **Example**: "Point limit exceeded by 150 points"

### Info (Blue)
- **Duration**: 3 seconds (default)
- **Icon**: Info ℹ
- **Use for**: Informational messages, tips, updates
- **Example**: "Round 2 starts tomorrow"

## Integration

### Adding Toast to a Component
1. Import the composable:
   ```vue
   <script setup>
   import { useToast } from '~/composables/useToast'
   
   const { toastSuccess, toastError } = useToast()
   </script>
   ```

2. Replace `alert()` calls:
   ```javascript
   // Before
   alert('League deleted successfully')
   
   // After
   toastSuccess('League deleted successfully')
   ```

## Styling

### Color Scheme (Warhammer 40k Theme)
- **Success**: Green 900/90 background, Green 500 border, Green 400 icon
- **Error**: Red 900/90 background, Red 500 border, Red 400 icon
- **Warning**: Yellow 900/90 background, Yellow 500 border, Yellow 400 icon
- **Info**: Blue 900/90 background, Blue 500 border, Blue 400 icon

### Animations
- **Enter**: Slide from right (translateX 100%) + fade in
- **Leave**: Slide to right + scale down + fade out
- **Duration**: 300ms ease transition

## Examples from Codebase

### LeagueSetupView.vue
```javascript
// Save league settings
const saveLeague = () => {
  editableLeague.value.rounds.sort((a, b) => a.number - b.number)
  emit('update-league', editableLeague.value)
  toastSuccess('League settings saved successfully!')
}

// Generate share URL
const generateShareUrl = async () => {
  try {
    const response = await $fetch(`/api/leagues/${id}/share-url`, { method: 'POST' })
    shareUrl.value = response.data.shareUrl
    toastSuccess('Share URL generated successfully!')
  } catch (error) {
    toastError('Failed to generate share URL. Please try again.')
  }
}

// Copy to clipboard
const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    toastSuccess('Share URL copied to clipboard!')
  } catch (err) {
    toastError('Failed to copy share URL')
  }
}

// Transfer ownership
const confirmTransferOwnership = async () => {
  try {
    await $fetch(`/api/leagues/${id}/transfer-ownership`, { method: 'POST', body })
    toastSuccess('Ownership transferred successfully! The new owner will now have full control.')
  } catch (error) {
    toastError('Failed to transfer ownership. Please try again.')
  }
}

// Delete league
const confirmDeleteLeague = async () => {
  try {
    await $fetch(`/api/leagues/${id}`, { method: 'DELETE' })
    toastSuccess('League deleted successfully')
    setTimeout(() => window.location.href = '/leagues', 1000)
  } catch (error) {
    toastError('Failed to delete league. Please try again.')
  }
}
```

## Benefits Over Browser Alerts

✅ **Non-blocking** - User can continue working while toast is visible  
✅ **Better UX** - Smooth animations, color-coded, less intrusive  
✅ **Consistent branding** - Matches Warhammer 40k theme  
✅ **Auto-dismiss** - No user action required for success messages  
✅ **Multiple toasts** - Can show several notifications at once  
✅ **Accessible** - Proper color contrast, semantic HTML  
✅ **Configurable** - Duration, type, message easily customized  
✅ **State management** - Centralized toast state across app  

## Future Enhancements

Potential improvements for the toast system:
- Add action buttons (e.g., "Undo", "View Details")
- Add progress bar for duration visualization
- Add position variants (top-left, bottom-right, etc.)
- Add sound effects for different toast types
- Add rich content support (icons, images, links)
- Add queue management for many simultaneous toasts
- Add accessibility announcements (ARIA live regions)

## Migration Checklist

To replace all `alert()` calls in the codebase:

- [x] LeagueSetupView.vue - All 6 alerts replaced ✅
- [x] PlayersView.vue - 1 alert replaced ✅
- [x] MatchesView.vue - 1 alert replaced ✅
- [x] leagues/create.vue - 1 alert replaced ✅
- [x] **COMPLETE** - All alerts in app directory converted to toast notifications! 🎉

**Last Updated**: October 2025  
**Status**: Production Ready ✅ - Zero `alert()` calls remaining
