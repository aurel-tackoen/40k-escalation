<script setup>
  import { LogIn } from 'lucide-vue-next'
  import { useAuth } from '~/composables/useAuth'

  const { isAuthenticated, login } = useAuth()
</script>

<template>
  <div>
    <!-- Login Button (when not authenticated) -->
    <button
      v-if="!isAuthenticated"
      @click="login"
      class="btn-primary flex items-center gap-2"
    >
      <LogIn :size="20" />
      <span>Login</span>
    </button>
  </div>
</template>
