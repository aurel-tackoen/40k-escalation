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
    ],
    script: [
      // Load Netlify Identity widget
      {
        type: 'text/javascript',
        src: 'https://identity.netlify.com/v1/netlify-identity-widget.js',
        defer: true
      }
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
