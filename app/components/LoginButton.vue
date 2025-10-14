<script setup>
  import { LogIn, LogOut } from 'lucide-vue-next'
  import { useAuth } from '~/composables/useAuth'

  const { isAuthenticated, login, logout } = useAuth()
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

    <!-- Logout Button (when authenticated) -->
    <button
      v-else
      @click="logout"
      class="btn-secondary flex items-center gap-2"
    >
      <LogOut :size="20" />
      <span>Logout</span>
    </button>
  </div>
</template>
