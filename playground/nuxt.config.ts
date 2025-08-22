export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  smartscript: {
    // Module is enabled by default
    // You can customize options here for testing
    // positioning: {
    //   trademark: {
    //     body: '-0.6em',
    //     headers: '-0.8em'
    //   }
    // }
  },
})
