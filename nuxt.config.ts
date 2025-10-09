// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // SPA mode - no server-side rendering
  ssr: false,

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@pinia/nuxt'
  ],

  nitro: {
    preset: 'netlify',
    // Ensure proper SPA handling
    serveStatic: true,
    compressPublicAssets: true,
    // Prerender the index.html for SPA mode
    prerender: {
      routes: ['/']
    }
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
