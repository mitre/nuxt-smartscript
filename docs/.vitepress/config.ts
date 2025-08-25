import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
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
      alias: {
        // Fix for d3-array blur2 export issue
        'd3-array': 'd3-array/dist/d3-array.min.js',
      },
    },
    optimizeDeps: {
      include: ['mermaid'],
    },
  },

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick Start', link: '/quick-start' },
      {
        text: 'Documentation',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Configuration', link: '/api/configuration' },
          { text: 'Selectors', link: '/selectors' },
          { text: 'Examples', link: '/examples' },
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
      {
        text: 'Advanced',
        items: [
          { text: 'Custom Patterns', link: '/advanced/custom-patterns' },
          { text: 'Performance', link: '/advanced/performance' },
          { text: 'Architecture', link: '/architecture' },
        ],
      },
      { text: 'Contributing', link: '/contributing' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        collapsed: false,
        items: [
          { text: 'What is SmartScript?', link: '/' },
          { text: 'Quick Start', link: '/quick-start' },
          { text: 'Installation & Setup', link: '/guide/getting-started' },
        ],
      },
      {
        text: 'Configuration',
        collapsed: false,
        items: [
          { text: 'Configuration Options', link: '/api/configuration' },
          { text: 'Element Selectors', link: '/selectors' },
          { text: 'Deployment Modes', link: '/guide/deployment-modes' },
        ],
      },
      {
        text: 'Usage & Examples',
        collapsed: false,
        items: [
          { text: 'Patterns & Examples', link: '/examples' },
          { text: 'Vue Integration', link: '/vue-integration' },
          { text: 'Composables', link: '/api/composables' },
          { text: 'Plugin API', link: '/api/plugin' },
        ],
      },
      {
        text: 'Advanced',
        collapsed: true,
        items: [
          { text: 'Custom Patterns', link: '/advanced/custom-patterns' },
          { text: 'Pattern Design', link: '/pattern-design' },
          { text: 'Performance Tuning', link: '/advanced/performance' },
        ],
      },
      {
        text: 'Architecture',
        collapsed: true,
        items: [
          { text: 'System Overview', link: '/architecture' },
          { text: 'Architecture Details', link: '/system-architecture' },
          { text: 'Processing Pipeline', link: '/processing-architecture' },
        ],
      },
      {
        text: 'Testing',
        collapsed: true,
        items: [
          { text: 'Testing Guide', link: '/testing/index' },
          { text: 'Testing Architecture', link: '/testing' },
          { text: 'Writing Tests', link: '/testing/writing-tests' },
          { text: 'Unit Tests', link: '/testing/unit-tests' },
          { text: 'Integration Tests', link: '/testing/integration-tests' },
          { text: 'E2E Tests', link: '/testing/e2e-tests' },
        ],
      },
      {
        text: 'Contributing',
        collapsed: true,
        items: [
          { text: 'Contributing Guide', link: '/contributing' },
          { text: 'Development Workflow', link: '/contributing/development-workflow' },
          { text: 'Release Process', link: '/contributing/release-process' },
          { text: 'TypeScript Architecture', link: '/contributing/typescript-architecture' },
        ],
      },
      {
        text: 'Resources',
        collapsed: true,
        items: [
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

  // Mermaid configuration
  mermaid: {
    theme: 'default',
    themeVariables: {
      primaryColor: '#3eaf7c',
      primaryTextColor: '#fff',
      primaryBorderColor: '#2c8658',
      lineColor: '#5c5c5c',
      secondaryColor: '#4fc08d',
      tertiaryColor: '#fff',
    },
  },
}))
