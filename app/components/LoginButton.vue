<script setup>
  import { LogIn } from 'lucide-vue-next'
  import { useAuth } from '~/composables/useAuth'

  const { login } = useAuth()
</script>

<template>
  <div>
    <!-- Login Button (when not authenticated) -->
    <button
      @click="login"
      class="btn-primary flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
    >
      <LogIn :size="20" />
      <span class="hidden sm:inline-block">Login</span>
    </button>
  </div>
</template>
