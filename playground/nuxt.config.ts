// @ts-expect-error - defineNuxtConfig is provided by Nuxt at runtime
export default defineNuxtConfig({
  modules: ['../dist/module.mjs'],
  devtools: { enabled: true },
  compatibilityDate: '2025-08-22',
  smartscript: {
    // Test configuration for E2E tests
    debug: true,

    // Enable both SSR and client for testing
    // In dev mode, you'll see client-side processing
    // In generate mode, SSR will pre-process content
    ssr: true,
    client: true,

    cssVariables: {
      'sup-top': '0.08em', // Default from CSS
      'sup-font-size': '0.75em', // Default from CSS
      'tm-top': '-0.4em', // Adjust this to see TM positioning
      'reg-top': '-0.4em', // For registered symbol positioning
    },
  },
})
