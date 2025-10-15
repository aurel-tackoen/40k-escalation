<script setup>
  import '~/assets/css/main.css'
  import { useLeaguesStore } from '~/stores/leagues'

  // Initialize stores
  const leaguesStore = useLeaguesStore()

  // Fetch game systems on app startup
  onMounted(async () => {
    await leaguesStore.fetchGameSystems()
  })

  // Set page title and meta
  useHead({
    title: 'Warhammer 40K Escalation League',
    meta: [
      { name: 'description', content: 'Manage your Warhammer 40K escalation league with ease' }
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
  </div>
</template>
