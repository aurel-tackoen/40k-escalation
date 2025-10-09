// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // Enable SSR for proper server function routing
  ssr: true,
  
  // But use SPA routing after initial load
  routeRules: {
    '/**': { ssr: false }
  },

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@pinia/nuxt'
  ],

  nitro: {
    preset: 'netlify',
  },

  app: {
    // Set base URL for client-side routing
    baseURL: '/',
  },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    // Private keys (only available on server-side API routes)
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    // Public keys (exposed to client-side)
    public: {
      apiBase: '/api'
    }
  }
})
