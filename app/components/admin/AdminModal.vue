<script setup>
  import { X } from 'lucide-vue-next'
  import { watch, onUnmounted } from 'vue'

  const props = defineProps({
    isOpen: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: 'md', // 'sm', 'md', 'lg', 'xl'
      validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    }
  })

  const emit = defineEmits(['close'])

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  }

  const handleBackdropClick = (event) => {
    // Only close if clicking the backdrop itself, not its children
    if (event.target === event.currentTarget) {
      emit('close')
    }
  }

  const handleEscape = (event) => {
    if (event.key === 'Escape' && props.isOpen) {
      emit('close')
    }
  }

  // Block body scroll when modal is open
  watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Add escape key listener
      document.addEventListener('keydown', handleEscape)
    } else {
      document.body.style.overflow = ''
      // Remove escape key listener
      document.removeEventListener('keydown', handleEscape)
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleEscape)
  })
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto"
        @click="handleBackdropClick"
        @keydown="handleEscape"
        tabindex="0"
      >
        <div
          class="relative w-full bg-gray-800 border border-gray-700 rounded-lg shadow-2xl my-8 flex flex-col max-h-[calc(100vh-4rem)]"
          :class="sizeClasses[size]"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header (fixed) -->
          <div class="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
            <h2 class="text-xl font-bold text-white">{{ title }}</h2>
            <button
              @click="emit('close')"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body (scrollable) -->
          <div class="p-6 overflow-y-auto flex-1">
            <slot />
          </div>

          <!-- Footer (fixed) -->
          <div v-if="$slots.footer" class="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800/50 flex-shrink-0">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  /* Modal transition animations */
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-active > div > div,
  .modal-leave-active > div > div {
    transition: transform 0.3s ease;
  }

  .modal-enter-from > div > div {
    transform: scale(0.95) translateY(-20px);
  }

  .modal-leave-to > div > div {
    transform: scale(0.95) translateY(-20px);
  }
</style>
