import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export function useToast() {
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = nextId++
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration
    }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const toastSuccess = (message, duration = 3000) => addToast(message, 'success', duration)
  const toastError = (message, duration = 5000) => addToast(message, 'error', duration)
  const toastWarning = (message, duration = 4000) => addToast(message, 'warning', duration)
  const toastInfo = (message, duration = 3000) => addToast(message, 'info', duration)

  return {
    toasts,
    addToast,
    removeToast,
    toastSuccess,
    toastError,
    toastWarning,
    toastInfo
  }
}
