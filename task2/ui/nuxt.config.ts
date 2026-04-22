export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    'notivue/nuxt',
    "nitro-cloudflare-dev",
  ],
  css: [
    'notivue/notification.css',
    'notivue/animations.css'
  ],

  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.json', emoji: "🇬🇧" },
      { code: 'de', iso: 'de-DE', file: 'de.json', emoji: "🇩🇪" }
    ],
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: true,
      // fallback if browser lang not supported
      fallbackLocale: 'en'
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.PUBLIC_API_BASE || "https://task2-api.libertypie.com/api"
    }
  },
  nitro: {
     preset: 'cloudflare-pages'
  },
  ssr: true
})
