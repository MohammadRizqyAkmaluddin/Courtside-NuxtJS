// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: ''
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
      Raleway: [300, 400, 500, 600, 700],
      Inter: [400, 500, 600, 700],
    },
    display: 'swap'
  },

  css: [
    'leaflet/dist/leaflet.css'
  ]
})
