import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { fileURLToPath } from 'node:url'

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Enable or disable the smartscript plugin
   * @default true
   */
  enabled?: boolean

  /**
   * CSS positioning configuration for different elements
   */
  positioning?: {
    trademark?: {
      body?: string // e.g., '-0.5em'
      headers?: string // e.g., '-0.7em'
      fontSize?: string // e.g., '0.8em'
    }
    registered?: {
      body?: string // e.g., '-0.25em'
      headers?: string // e.g., '-0.45em'
      fontSize?: string // e.g., '0.8em'
    }
    ordinals?: {
      fontSize?: string // e.g., '0.75em'
    }
    chemicals?: {
      fontSize?: string // e.g., '0.75em'
    }
  }

  /**
   * Selectors configuration
   */
  selectors?: {
    include?: string[]
    exclude?: string[]
  }

  /**
   * Performance configuration
   */
  performance?: {
    debounce?: number
    batchSize?: number
    delay?: number
  }

  /**
   * Enable/disable specific transformations
   * Set to false to disable specific transformation types
   */
  transformations?: {
    trademark?: boolean // Transform (TM) and ™ - Default: true
    registered?: boolean // Transform (R) and ® - Default: true
    copyright?: boolean // Transform (C) and © - Default: true
    ordinals?: boolean // Transform 1st, 2nd, etc. - Default: true
    chemicals?: boolean // Transform H2O, CO2, etc. - Default: true
    mathSuper?: boolean // Transform x^2, E=mc^2 - Default: true
    mathSub?: boolean // Transform x_1, x_n - Default: true
  }

  /**
   * Custom pattern overrides for advanced users
   * WARNING: Use with caution - invalid regex can break the plugin
   * Patterns should be provided as strings (will be compiled with 'g' flag)
   */
  customPatterns?: {
    trademark?: string // Override trademark pattern
    registered?: string // Override registered pattern
    copyright?: string // Override copyright pattern
    ordinals?: string // Override ordinals pattern
    chemicals?: string // Override chemicals pattern
    mathSuper?: string // Override math superscript pattern
    mathSub?: string // Override math subscript pattern
  }

  /**
   * CSS Variables configuration
   * Allows runtime customization of CSS values via custom properties
   * These values override the default CSS variables defined in the stylesheet
   * Example: { 'sup-font-size': '0.8em', 'sup-top': '0.2em' }
   */
  cssVariables?: Record<string, string>

  /**
   * Enable static site processing
   * When true, processes content during build/generation for SSG sites
   * This ensures transformed content is in the HTML (better SEO, no FOUC)
   * @default false
   */
  processStatic?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-smartscript',
    configKey: 'smartscript',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },

  // Default configuration options
  defaults: {
    enabled: true,
    positioning: {
      trademark: {
        body: '-0.5em',
        headers: '-0.7em',
        fontSize: '0.8em',
      },
      registered: {
        body: '-0.25em',
        headers: '-0.45em',
        fontSize: '0.8em',
      },
      ordinals: {
        fontSize: '0.75em',
      },
      chemicals: {
        fontSize: '0.75em',
      },
    },
    selectors: {
      include: [
        'main',
        'article',
        '.content',
        '[role="main"]',
        '.prose',
        '.blog-post',
        '.blog-content',
        'section',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'header',
      ],
      exclude: [
        'pre',
        'code',
        'script',
        'style',
        '.no-superscript',
        '[data-no-superscript]',
      ],
    },
    performance: {
      debounce: 100,
      batchSize: 50,
      delay: 1500,
    },
    transformations: {
      trademark: true,
      registered: true,
      copyright: true,
      ordinals: true,
      chemicals: true,
      mathSuper: true,
      mathSub: true,
    },
    processStatic: false,
  },

  setup(options, nuxt) {
    if (!options.enabled) {
      return
    }

    const resolver = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    // Transpile runtime
    nuxt.options.build.transpile.push(runtimeDir)

    // Add the plugin (client-side only)
    addPlugin({
      src: resolver.resolve('./runtime/plugin'),
      mode: 'client',
    })

    // Add CSS file
    nuxt.options.css.push(resolver.resolve('./runtime/superscript.css'))

    // Pass module options to runtime
    nuxt.options.runtimeConfig.public.smartscript = options
  },
})
