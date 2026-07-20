// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
      pusherKey: process.env.NUXT_PUBLIC_PUSHER_APP_KEY || '',
      pusherCluster: process.env.NUXT_PUBLIC_PUSHER_APP_CLUSTER || '',
      pusherHost: process.env.NUXT_PUBLIC_PUSHER_HOST || '',
      pusherPort: Number(process.env.NUXT_PUBLIC_PUSHER_PORT || 6001),
      pusherScheme: process.env.NUXT_PUBLIC_PUSHER_SCHEME || 'http'
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxtjs/google-fonts'],
  
  googleFonts: {
    families: {
      'Bebas Neue': true,
      'Bungee': true,
      'Koulen': true,
      'Afacad': true,
      'Plus Jakarta Sans': [300, 400, 500, 600, 700],
      'DM Serif Display': true,
      'Montserrat': [400, 500, 600, 700],
      'Gelasio': true,
      Raleway: [300, 400, 500, 600, 700],
      Inter: [400, 500, 600, 700],
    },
    display: 'swap'
  },

  css: [
    'leaflet/dist/leaflet.css'
  ]
})
