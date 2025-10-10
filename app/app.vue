<script setup>
import '~/assets/css/main.css'
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
