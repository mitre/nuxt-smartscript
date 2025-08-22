import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Nuxt SmartScript',
  description: 'Smart typography transformations for Nuxt',

  // Use / for custom domain, /nuxt-smartscript/ for github.io subdirectory
  base: process.env.GITHUB_DEPLOY === 'true' ? '/nuxt-smartscript/' : '/',

  // Clean URLs without .html extension
  cleanUrls: true,

  // Last updated time
  lastUpdated: true,

  // Follow symlinks for linked markdown files
  vite: {
    resolve: {
      preserveSymlinks: true,
    },
  },

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick Start', link: '/quick-start' },
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Vue Integration', link: '/vue-integration' },
          { text: 'Examples', link: '/examples' },
          { text: 'Architecture', link: '/architecture' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: 'Configuration', link: '/api/configuration' },
          { text: 'Composables', link: '/api/composables' },
          { text: 'Plugin API', link: '/api/plugin' },
        ],
      },
      { text: 'Contributing', link: '/contributing' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        collapsed: false,
        items: [
          { text: 'What is SmartScript?', link: '/' },
          { text: 'Quick Start', link: '/quick-start' },
        ],
      },
      {
        text: 'Guide',
        collapsed: false,
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Vue Integration', link: '/vue-integration' },
          { text: 'Patterns & Examples', link: '/examples' },
        ],
      },
      {
        text: 'API Reference',
        collapsed: false,
        items: [
          { text: 'Configuration', link: '/api/configuration' },
          { text: 'Composables', link: '/api/composables' },
          { text: 'Plugin API', link: '/api/plugin' },
        ],
      },
      {
        text: 'Advanced',
        collapsed: true,
        items: [
          { text: 'Architecture', link: '/architecture' },
          { text: 'Custom Patterns', link: '/advanced/custom-patterns' },
          { text: 'Performance', link: '/advanced/performance' },
        ],
      },
      {
        text: 'Resources',
        collapsed: true,
        items: [
          { text: 'Contributing Guide', link: '/contributing' },
          { text: 'Changelog', link: 'https://github.com/mitre/nuxt-smartscript/blob/main/CHANGELOG.md' },
          { text: 'License', link: 'https://github.com/mitre/nuxt-smartscript/blob/main/LICENSE' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/mitre/nuxt-smartscript' },
    ],

    footer: {
      message: 'Apache 2.0 License',
      copyright: '© 2025 MITRE',
    },

    search: {
      provider: 'local',
    },
  },
})
