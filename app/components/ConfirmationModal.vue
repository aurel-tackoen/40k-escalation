<script setup>
  import { watch, onUnmounted, computed } from 'vue'
  import { X } from 'lucide-vue-next'

  const props = defineProps({
    // Control visibility
    show: {
      type: Boolean,
      default: false
    },
    // Modal title
    title: {
      type: String,
      default: 'Confirm Action'
    },
    // Main message content
    message: {
      type: String,
      default: ''
    },
    // Confirm button text
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    // Cancel button text
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    // Variant for styling (default, danger, warning)
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'danger', 'warning'].includes(value)
    },
    // Max width class
    maxWidth: {
      type: String,
      default: 'max-w-md'
    },
    // Show close button in header
    showClose: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['confirm', 'cancel', 'close'])

  // Block body scroll when modal is open
  watch(() => props.show, (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, { immediate: true })

  // Handle Escape key to cancel
  const handleEscapeKey = (event) => {
    if (event.key === 'Escape' && props.show) {
      handleCancel()
    }
  }

  // Add/remove keyboard listener when modal opens/closes
  watch(() => props.show, (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleEscapeKey)
    } else {
      window.removeEventListener('keydown', handleEscapeKey)
    }
  })

  // Cleanup: restore scroll and remove listener on unmount
  onUnmounted(() => {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleEscapeKey)
  })

  // Get variant-specific classes
  const variantClasses = computed(() => {
    switch (props.variant) {
      case 'danger':
        return {
          border: 'border-2 border-red-500',
          title: 'text-red-400',
          confirmBtn: 'btn-secondary'
        }
      case 'warning':
        return {
          border: 'border-2 border-yellow-500',
          title: 'text-yellow-400',
          confirmBtn: 'btn-secondary'
        }
      default:
        return {
          border: 'border-2 border-gray-600',
          title: 'text-yellow-500',
          confirmBtn: 'btn-primary'
        }
    }
  })

  const handleConfirm = () => {
    emit('confirm')
  }

  const handleCancel = () => {
    emit('cancel')
  }

  const handleClose = () => {
    emit('close')
  }
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50"
        @click.self="handleCancel"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="show"
            :class="[
              'bg-gray-800 rounded-lg p-6 w-full mx-4',
              maxWidth,
              variantClasses.border
            ]"
          >
            <!-- Header -->
            <div class="flex justify-between items-start mb-4">
              <h3 :class="['text-xl font-bold', variantClasses.title]">
                {{ title }}
              </h3>
              <button
                v-if="showClose"
                @click="handleClose"
                class="text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                <X :size="24" />
              </button>
            </div>

            <!-- Message -->
            <p v-if="message" class="text-gray-300 mb-6" v-html="message"></p>

            <!-- Slot for additional content (info boxes, lists, etc.) -->
            <slot></slot>

            <!-- Actions -->
            <div class="flex gap-3 mt-6">
              <button
                @click="handleCancel"
                class="btn-login flex-1"
              >
                {{ cancelText }}
              </button>
              <button
                @click="handleConfirm"
                :class="[
                  'btn-primary flex-1 ',
                  variantClasses.confirmBtn
                ]"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
