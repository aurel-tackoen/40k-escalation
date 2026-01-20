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
    title: 'War\'s Path - Warhammer Escalation League Manager',
    meta: [
      { name: 'description', content: 'Organize and track Warhammer escalation campaigns for 40k, Age of Sigmar, The Old World, MESBG, and The Horus Heresy. Manage players, armies, matches, pairings, and painting progress all in one place.' },
      { name: 'keywords', content: 'Warhammer 40k, Age of Sigmar, The Old World, MESBG, Horus Heresy, escalation league, tournament organizer, army list builder, match tracker, painting tracker' },
      // Open Graph / Facebook
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'War\'s Path - Warhammer Escalation League Manager' },
      { property: 'og:description', content: 'Organize and track Warhammer escalation campaigns for 40k, Age of Sigmar, The Old World, MESBG, and The Horus Heresy. Manage players, armies, matches, pairings, and painting progress all in one place.' },
      { property: 'og:image', content: '/logo.png' },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'War\'s Path - Warhammer Escalation League Manager' },
      { name: 'twitter:description', content: 'Organize and track Warhammer escalation campaigns for 40k, Age of Sigmar, The Old World, MESBG, and The Horus Heresy.' },
      { name: 'twitter:image', content: '/logo.png' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'canonical', href: 'https://warspath.netlify.app' }
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
