# ConfirmationModal Component

**Location**: `app/components/ConfirmationModal.vue`  
**Type**: Reusable Modal Component  
**Status**: ✅ Production Ready

## Overview

A flexible, reusable confirmation modal component used across the application for delete confirmations and other user actions requiring confirmation.

## Features

- ✅ **Teleport to body** - Renders outside component tree for proper z-index
- ✅ **Smooth transitions** - Fade and scale animations
- ✅ **Multiple variants** - Default, danger, and warning styles
- ✅ **Customizable content** - Slots for additional content
- ✅ **Click-outside to close** - Backdrop click cancels action
- ✅ **Accessible** - Proper ARIA labels and semantic HTML

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | Boolean | `false` | Controls modal visibility |
| `title` | String | `'Confirm Action'` | Modal header text |
| `message` | String | `''` | Main message content (supports HTML) |
| `confirmText` | String | `'Confirm'` | Confirm button label |
| `cancelText` | String | `'Cancel'` | Cancel button label |
| `variant` | String | `'default'` | Visual style (`'default'`, `'danger'`, `'warning'`) |
| `maxWidth` | String | `'max-w-md'` | Tailwind max-width class |
| `showClose` | Boolean | `false` | Show close (X) button in header |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `@confirm` | None | Emitted when confirm button clicked |
| `@cancel` | None | Emitted when cancel button or backdrop clicked |
| `@close` | None | Emitted when close (X) button clicked |

## Variants

### Default Variant
```vue
<ConfirmationModal
  :show="showModal"
  title="Confirm Action"
  message="Are you sure?"
  variant="default"
  @confirm="handleConfirm"
  @cancel="handleCancel"
/>
```
- Yellow title (`text-yellow-500`)
- Gray border
- Secondary button style for confirm

### Danger Variant
```vue
<ConfirmationModal
  :show="showModal"
  title="Delete Item?"
  message="This action cannot be undone."
  variant="danger"
  @confirm="handleDelete"
  @cancel="handleCancel"
/>
```
- Red title (`text-red-400`)
- Red border (`border-2 border-red-500`)
- Red button style for confirm

### Warning Variant
```vue
<ConfirmationModal
  :show="showModal"
  title="Warning"
  message="Please review before continuing."
  variant="warning"
  @confirm="handleContinue"
  @cancel="handleCancel"
/>
```
- Yellow title (`text-yellow-400`)
- Yellow border (`border-2 border-yellow-500`)
- Yellow button style for confirm

## Slots

### Default Slot
Use for custom content beyond simple messages (e.g., info boxes, lists).

```vue
<ConfirmationModal
  :show="showModal"
  title="Remove Player?"
  @confirm="handleRemove"
  @cancel="handleCancel"
>
  <p class="text-gray-300 mb-4">
    Are you sure you want to remove <strong>{{ playerName }}</strong>?
  </p>
  
  <div class="bg-gray-700 border border-gray-600 rounded-lg p-4">
    <p class="text-sm text-gray-300 mb-2">
      <strong class="text-yellow-500">Note:</strong> This will:
    </p>
    <ul class="text-sm text-gray-400 space-y-1 ml-4 list-disc">
      <li>Remove the player from the roster</li>
      <li>Preserve all match history</li>
      <li>Preserve all army lists</li>
    </ul>
  </div>
</ConfirmationModal>
```

## Usage Examples

### 1. ArmyListsView (Simple Deletion)

```vue
<script setup>
  const armyToDelete = ref(null)
  const showDeleteModal = ref(false)

  const confirmDeleteArmy = (army) => {
    armyToDelete.value = army
    showDeleteModal.value = true
  }

  const deleteArmyConfirmed = () => {
    if (armyToDelete.value) {
      emit('delete-army', armyToDelete.value.playerId, armyToDelete.value.round)
      armyToDelete.value = null
      showDeleteModal.value = false
    }
  }

  const cancelDeleteArmy = () => {
    armyToDelete.value = null
    showDeleteModal.value = false
  }
</script>

<template>
  <ConfirmationModal
    :show="showDeleteModal"
    title="Confirm Deletion"
    :message="`Are you sure you want to delete <strong>${armyToDelete?.name}</strong>? This action cannot be undone.`"
    confirm-text="Delete Army"
    cancel-text="Cancel"
    variant="default"
    @confirm="deleteArmyConfirmed"
    @cancel="cancelDeleteArmy"
  />
</template>
```

### 2. MatchesView (Danger Variant)

```vue
<script setup>
  const matchToDelete = ref(null)
  const showDeleteModal = ref(false)

  const confirmDeleteMatch = (match) => {
    matchToDelete.value = match
    showDeleteModal.value = true
  }

  const deleteMatchConfirmed = () => {
    if (matchToDelete.value) {
      emit('delete-match', matchToDelete.value.id)
      matchToDelete.value = null
      showDeleteModal.value = false
    }
  }

  const cancelDeleteMatch = () => {
    matchToDelete.value = null
    showDeleteModal.value = false
  }
</script>

<template>
  <ConfirmationModal
    :show="showDeleteModal"
    title="Delete Match?"
    :message="`Are you sure you want to delete this match? This action cannot be undone.`"
    confirm-text="Delete"
    cancel-text="Cancel"
    variant="danger"
    @confirm="deleteMatchConfirmed"
    @cancel="cancelDeleteMatch"
  />
</template>
```

### 3. PlayersView (With Custom Content Slot)

```vue
<script setup>
  const playerToRemove = ref(null)
  const showRemovalModal = ref(false)

  const confirmRemoval = (player) => {
    playerToRemove.value = player
    showRemovalModal.value = true
  }

  const removePlayer = () => {
    if (playerToRemove.value) {
      emit('remove-player', playerToRemove.value.id)
      playerToRemove.value = null
      showRemovalModal.value = false
    }
  }

  const cancelRemoval = () => {
    playerToRemove.value = null
    showRemovalModal.value = false
  }
</script>

<template>
  <ConfirmationModal
    :show="showRemovalModal"
    :title="playerToRemove?.isSelf ? 'Leave League?' : 'Remove Player?'"
    variant="default"
    confirm-text="Confirm"
    cancel-text="Cancel"
    @confirm="removePlayer"
    @cancel="cancelRemoval"
  >
    <p class="text-gray-300 mb-4">
      Are you sure you want to remove <strong>{{ playerToRemove?.name }}</strong>?
    </p>

    <div class="bg-gray-700 border border-gray-600 rounded-lg p-4">
      <p class="text-sm text-gray-300 mb-2">
        <strong class="text-yellow-500">Note:</strong> This will:
      </p>
      <ul class="text-sm text-gray-400 space-y-1 ml-4 list-disc">
        <li>Remove the player from the roster</li>
        <li><strong class="text-green-400">Preserve</strong> all match history</li>
      </ul>
    </div>
  </ConfirmationModal>
</template>
```

## State Management Pattern

**Recommended pattern** for managing modal state in parent components:

```vue
<script setup>
  import { ref } from 'vue'
  import ConfirmationModal from '~/components/ConfirmationModal.vue'

  // Modal state
  const itemToDelete = ref(null)
  const showModal = ref(false)

  // Show modal
  const confirmDelete = (item) => {
    itemToDelete.value = item
    showModal.value = true
  }

  // Handle confirm
  const handleDelete = () => {
    if (itemToDelete.value) {
      // Perform deletion
      deleteItem(itemToDelete.value)
      
      // Reset state
      itemToDelete.value = null
      showModal.value = false
    }
  }

  // Handle cancel
  const handleCancel = () => {
    itemToDelete.value = null
    showModal.value = false
  }
</script>

<template>
  <button @click="confirmDelete(item)">Delete</button>

  <ConfirmationModal
    :show="showModal"
    title="Confirm Deletion"
    message="Are you sure?"
    @confirm="handleDelete"
    @cancel="handleCancel"
  />
</template>
```

## Styling

The component uses Tailwind CSS classes and integrates with the Warhammer 40k theme:

- Background: `bg-gray-800`
- Text: `text-gray-300`
- Title colors: Variant-specific (`text-yellow-500`, `text-red-400`, etc.)
- Borders: Variant-specific
- Transitions: Opacity and scale animations

## Accessibility

- Uses semantic HTML (`<h3>` for title, etc.)
- Click-outside backdrop to cancel
- Keyboard-friendly (buttons)
- ARIA label on close button when `showClose` is true

## Migration from useConfirmation

**Before** (using `useConfirmation` composable):
```vue
<script setup>
  import { useConfirmation } from '~/composables/useConfirmation'

  const {
    item: itemToDelete,
    confirm: confirmDelete,
    execute: deleteConfirmed
  } = useConfirmation((item) => {
    emit('delete-item', item.id)
  })
</script>

<template>
  <div v-if="itemToDelete" class="fixed inset-0 ...">
    <!-- Custom modal markup -->
  </div>
</template>
```

**After** (using `ConfirmationModal` component):
```vue
<script setup>
  import ConfirmationModal from '~/components/ConfirmationModal.vue'

  const itemToDelete = ref(null)
  const showDeleteModal = ref(false)

  const confirmDelete = (item) => {
    itemToDelete.value = item
    showDeleteModal.value = true
  }

  const deleteConfirmed = () => {
    if (itemToDelete.value) {
      emit('delete-item', itemToDelete.value.id)
      itemToDelete.value = null
      showDeleteModal.value = false
    }
  }

  const cancelDelete = () => {
    itemToDelete.value = null
    showDeleteModal.value = false
  }
</script>

<template>
  <ConfirmationModal
    :show="showDeleteModal"
    title="Confirm Deletion"
    message="Are you sure?"
    @confirm="deleteConfirmed"
    @cancel="cancelDelete"
  />
</template>
```

## Future Enhancements

- [ ] Add keyboard shortcuts (Escape to cancel, Enter to confirm)
- [ ] Add focus trap for accessibility
- [ ] Support for async confirm actions (loading state)
- [ ] Support for custom button classes
- [ ] Animation customization props

---

**Last Updated**: October 2025  
**Status**: Production Ready ✅
