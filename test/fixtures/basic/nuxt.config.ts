// @ts-expect-error - defineNuxtConfig is provided by Nuxt at runtime
export default defineNuxtConfig({
  modules: [
    '../../../dist/module.mjs',
  ],
})
