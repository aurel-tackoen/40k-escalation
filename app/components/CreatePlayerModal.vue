<script setup>
  import { ref, watch, onUnmounted, computed } from 'vue'
  import { X, UserPlus, User } from 'lucide-vue-next'
  import { usePlaceholders } from '~/composables/usePlaceholders'

  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    leagueName: {
      type: String,
      default: ''
    },
    userName: {
      type: String,
      default: ''
    },
    availableFactions: {
      type: Array,
      default: () => []
    },
    gameSystem: {
      type: Object,
      default: null
    }
  })

  const emit = defineEmits(['create-player', 'skip', 'close'])

  // Get game-system-specific placeholders
  const gameSystemRef = computed(() => props.gameSystem)
  const { placeholders } = usePlaceholders(gameSystemRef)

  // Form data
  const form = ref({
    name: props.userName || '',
    faction: '',
    armyName: ''
  })

  const error = ref('')

  // Watch for userName prop changes
  watch(() => props.userName, (newName) => {
    if (newName && !form.value.name) {
      form.value.name = newName
    }
  })

  // Reset form when modal closes
  watch(() => props.show, (isOpen) => {
    if (!isOpen) {
      error.value = ''
    } else {
      // Populate name when modal opens
      if (props.userName && !form.value.name) {
        form.value.name = props.userName
      }
    }
  })

  // Block body scroll when modal is open
  watch(() => props.show, (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, { immediate: true })

  // Handle Escape key to skip
  const handleEscapeKey = (event) => {
    if (event.key === 'Escape' && props.show) {
      handleSkip()
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

  // Cleanup
  onUnmounted(() => {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleEscapeKey)
  })

  // Validate form
  const validateForm = () => {
    if (!form.value.name?.trim()) {
      error.value = 'Player name is required'
      return false
    }

    if (!form.value.faction) {
      error.value = 'Please select a faction'
      return false
    }

    if (!form.value.armyName?.trim()) {
      error.value = 'Army name is required'
      return false
    }

    error.value = ''
    return true
  }

  // Handle create player
  const handleCreatePlayer = () => {
    if (validateForm()) {
      emit('create-player', {
        name: form.value.name.trim(),
        faction: form.value.faction,
        armyName: form.value.armyName.trim()
      })
    }
  }

  // Handle skip
  const handleSkip = () => {
    emit('skip')
  }

  // Handle close (X button)
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
        @click.self="handleSkip"
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
            class="bg-gray-800 rounded-lg p-5 w-full max-w-lg mx-4 border-2 border-purple-500 max-h-[90vh] overflow-y-auto"
          >
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <UserPlus :size="24" class="text-purple-400" />
                <div>
                  <h3 class="text-xl font-bold text-purple-400">
                    Create Your Player Profile
                  </h3>
                  <p class="text-gray-400 text-sm mt-0.5">
                    for {{ leagueName }}
                  </p>
                </div>
              </div>
              <button
                type="button"
                @click="handleClose"
                class="text-gray-400 hover:text-gray-200 transition-colors p-1"
                aria-label="Close"
              >
                <X :size="20" />
              </button>
            </div>

            <!-- Message -->
            <div class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 mb-4">
              <p class="text-gray-300 text-sm">
                You've successfully created your league! Would you like to create your player profile now so you can start recording matches and building army lists?
              </p>
              <p class="text-gray-400 text-xs mt-1.5">
                You can skip this step and create your player profile later from the Players page.
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
              {{ error }}
            </div>

            <!-- Form -->
            <form @submit.prevent="handleCreatePlayer" class="space-y-3">
              <!-- Player Name -->
              <div>
                <label class="block text-gray-300 font-semibold mb-2">
                  Player Name <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  class="input-field w-full"
                  placeholder="Enter your name"
                  required
                />
                <p class="text-xs text-gray-400 mt-1">
                  This is your display name in the league standings
                </p>
              </div>

              <!-- Faction and Army Name Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Faction -->
                <div>
                  <label class="block text-gray-300 font-semibold mb-2">
                    Faction <span class="text-red-400">*</span>
                  </label>
                  <select
                    v-model="form.faction"
                    class="input-field w-full"
                    required
                  >
                    <option value="">Select faction...</option>
                    <option
                      v-for="faction in availableFactions"
                      :key="faction.name"
                      :value="faction.name"
                    >
                      {{ faction.name }}
                    </option>
                  </select>
                </div>

                <!-- Army Name -->
                <div>
                  <label class="block text-gray-300 font-semibold mb-2">
                    Army Name <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="form.armyName"
                    type="text"
                    class="input-field w-full"
                    :placeholder="placeholders.armyName"
                    required
                  />
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-2 pt-3">
                <button
                  type="button"
                  @click="handleSkip"
                  :disabled="isLoading"
                  class="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <User v-if="!isLoading" :size="18" />
                  <svg v-else class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isLoading ? 'Creating...' : 'Create Player Profile' }}
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Additional modal-specific styles if needed */
</style>
