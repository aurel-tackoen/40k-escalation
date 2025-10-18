<script setup>
  import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-vue-next'
  import { useToast } from '~/composables/useToast'

  const { toasts, removeToast } = useToast()

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'error': return XCircle
      case 'warning': return AlertTriangle
      default: return Info
    }
  }

  const getToastClasses = (type) => {
    const baseClasses = 'border-l-4 shadow-lg'
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-900/90 border-green-500 text-green-100`
      case 'error':
        return `${baseClasses} bg-red-900/90 border-red-500 text-red-100`
      case 'warning':
        return `${baseClasses} bg-yellow-900/90 border-yellow-500 text-yellow-100`
      default:
        return `${baseClasses} bg-blue-900/90 border-blue-500 text-blue-100`
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400'
      case 'error': return 'text-red-400'
      case 'warning': return 'text-yellow-400'
      default: return 'text-blue-400'
    }
  }
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'flex items-start gap-3 p-4 rounded-lg backdrop-blur-sm pointer-events-auto',
          getToastClasses(toast.type)
        ]"
      >
        <component
          :is="getToastIcon(toast.type)"
          :size="20"
          :class="['flex-shrink-0 mt-0.5', getIconColor(toast.type)]"
        />
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X :size="18" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
