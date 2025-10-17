import { ref } from 'vue'

/**
 * Composable for confirmation dialog management
 * Provides reusable pattern for confirmation modals
 */
export function useConfirmation(defaultCallback = null) {
  const item = ref(null)
  const isOpen = ref(false)
  const confirmCallback = ref(null)

  /**
   * Open confirmation dialog with an item
   * @param {any} itemToConfirm - Item to confirm action on
   * @param {Function} callback - Optional callback to execute on confirm
   */
  const confirm = (itemToConfirm, callback = null) => {
    item.value = itemToConfirm
    isOpen.value = true
    if (callback && typeof callback === 'function') {
      confirmCallback.value = callback
    }
  }

  /**
   * Cancel and close the confirmation dialog
   */
  const cancel = () => {
    item.value = null
    isOpen.value = false
    confirmCallback.value = null
  }

  /**
   * Execute the confirmation action
   * @param {Function} callbackOverride - Override callback (optional)
   */
  const execute = (callbackOverride = null) => {
    const callback = callbackOverride || confirmCallback.value || defaultCallback

    if (item.value && callback && typeof callback === 'function') {
      callback(item.value)
    }

    cancel()
  }

  /**
   * Get display name for the item (useful for showing in modal)
   * @param {string} nameKey - Key to access name property (default: 'name')
   * @returns {string} Item name or 'this item'
   */
  const getItemName = (nameKey = 'name') => {
    if (!item.value) return 'this item'
    return item.value[nameKey] || 'this item'
  }

  return {
    item,
    isOpen,
    confirm,
    cancel,
    execute,
    getItemName
  }
}
