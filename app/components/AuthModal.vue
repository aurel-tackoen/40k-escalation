<script setup>
  import { User, LogIn, UserPlus, X } from 'lucide-vue-next'
  import { useAuth } from '~/composables/useAuth'

  defineProps({
    show: {
      type: Boolean,
      required: true
    },
    mode: {
      type: String,
      default: 'login', // 'login' or 'signup'
      validator: (value) => ['login', 'signup'].includes(value)
    }
  })

  const emit = defineEmits(['close'])

  const { login, signup } = useAuth()

  const handleLogin = () => {
    login()
    emit('close')
  }

  const handleSignup = () => {
    signup()
    emit('close')
  }

  const handleClose = () => {
    emit('close')
  }
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="relative w-full max-w-md p-8 bg-gray-900 border-2 border-amber-500 rounded-lg shadow-2xl">
        <!-- Close button -->
        <button
          @click="handleClose"
          class="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
        >
          <X :size="20" />
        </button>

        <!-- Header -->
        <div class="mb-6 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-amber-500/20 rounded-full">
            <User :size="32" class="text-amber-500" />
          </div>
          <h2 class="text-2xl font-bold text-amber-500">
            {{ mode === 'login' ? 'Welcome Back, Commander' : 'Join the Campaign' }}
          </h2>
          <p class="mt-2 text-gray-400">
            {{ mode === 'login'
              ? 'Log in to manage your armies and record battles'
              : 'Create an account to join the escalation league'
            }}
          </p>
        </div>

        <!-- Buttons -->
        <div class="space-y-3">
          <button
            v-if="mode === 'login'"
            @click="handleLogin"
            class="w-full px-6 py-3 text-white bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogIn :size="20" />
            Log In with Netlify Identity
          </button>

          <button
            v-if="mode === 'signup'"
            @click="handleSignup"
            class="w-full px-6 py-3 text-white bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus :size="20" />
            Sign Up with Netlify Identity
          </button>
        </div>

        <!-- Info -->
        <div class="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <p class="text-sm text-gray-400">
            <strong class="text-amber-500">Note:</strong>
            {{ mode === 'login'
              ? 'Your account is secured with Netlify Identity. Click the button above to open the login modal.'
              : 'After signing up, you\'ll need to complete your player profile with your name and chosen faction.'
            }}
          </p>
        </div>

        <!-- Toggle mode link -->
        <div class="mt-4 text-center">
          <button
            @click="emit('close')"
            class="text-sm text-gray-400 hover:text-amber-500 transition-colors"
          >
            {{ mode === 'login' ? 'Need an account? Sign up instead' : 'Already have an account? Log in instead' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Add subtle animation */
.fixed {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.max-w-md {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
