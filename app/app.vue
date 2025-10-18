<script setup>
  import '~/assets/css/main.css'
  import { useLeaguesStore } from '~/stores/leagues'
  import { useAuthStore } from '~/stores/auth'

  // Initialize stores
  const leaguesStore = useLeaguesStore()
  const authStore = useAuthStore()

  // Initialize on app startup (only once)
  const initialized = ref(false)

  onMounted(async () => {
    if (!initialized.value) {
      initialized.value = true
      // Initialize auth first
      await authStore.fetchUser()
      // Then initialize leagues if user is authenticated
      if (authStore.isAuthenticated) {
        await leaguesStore.initialize()
      }
    }
  })

  // Set page title and meta
  useHead({
    title: 'War\'s Path Escalation League',
    meta: [
      { name: 'description', content: 'Manage your Warhammer Escalation League with ease' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  })
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastContainer />
  </div>
</template>
