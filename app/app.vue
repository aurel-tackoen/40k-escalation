<script setup>
  import { onMounted } from 'vue'
  import '~/assets/css/main.css'

  // Set page title and meta
  useHead({
    title: 'Warhammer 40K Escalation League',
    meta: [
      { name: 'description', content: 'Manage your Warhammer 40K escalation league with ease' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://unpkg.com/netlify-identity-widget@^1/build/netlify-identity-widget.css' }
    ]
  })

  // Smart widget management: Only close if user is authenticated and widget is stuck open
  onMounted(() => {
    if (typeof window !== 'undefined') {
      const smartCloseWidget = () => {
        const widget = document.querySelector('.netlify-identity-widget')
        if (!widget) return

        const isOpen = widget.classList.contains('netlify-identity-open')
        const isAuthenticated = window.netlifyIdentity?.currentUser?.()

        // Only force close if:
        // 1. Widget is open AND
        // 2. User is already authenticated (no need for widget to be open)
        if (isOpen && isAuthenticated) {
          console.log('User authenticated but widget stuck open - closing...')
          widget.classList.remove('netlify-identity-open')
          widget.style.display = 'none'

          if (window.netlifyIdentity) {
            try {
              window.netlifyIdentity.close()
            } catch (e) {
              console.log('Could not close via API:', e)
            }
          }
        }
      }

      // Check periodically but only close if conditions are met
      setTimeout(smartCloseWidget, 1000)
      setTimeout(smartCloseWidget, 2000)
      setTimeout(smartCloseWidget, 3000)

      // Monitor for stuck widget every 5 seconds for first 30 seconds
      let checks = 0
      const monitorInterval = setInterval(() => {
        smartCloseWidget()
        checks++
        if (checks >= 6) {
          clearInterval(monitorInterval)
        }
      }, 5000)
    }
  })
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
/* Smart Netlify Identity Widget Management */
/* Goal: Hide widget when closed, show when opened, prevent invisible blocking */

.netlify-identity-widget {
  z-index: 9999 !important;
  position: fixed !important;
}

/* When widget is NOT open, make it completely non-interactive */
.netlify-identity-widget:not(.netlify-identity-open) {
  pointer-events: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

/* Hide all child elements when not open */
.netlify-identity-widget:not(.netlify-identity-open) * {
  pointer-events: none !important;
}

/* When widget IS open, allow full interaction */
.netlify-identity-widget.netlify-identity-open {
  pointer-events: auto !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Allow interaction with modal content when open */
.netlify-identity-widget.netlify-identity-open * {
  pointer-events: auto !important;
}

/* Ensure backdrop works correctly */
.netlify-identity-widget.netlify-identity-open .netlify-identity-backdrop {
  display: block !important;
  pointer-events: auto !important;
}

.netlify-identity-widget:not(.netlify-identity-open) .netlify-identity-backdrop {
  display: none !important;
  pointer-events: none !important;
}
</style>
