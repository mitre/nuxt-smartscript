import { fileURLToPath } from 'node:url'
import { addPlugin, addServerPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { SHARED_DEFAULTS } from './runtime/shared-defaults'

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
   * Enable server-side rendering (SSR) and static generation (SSG) processing
   * When true, processes content during SSR/SSG for better SEO and performance
   * In development, SSR is disabled by default to avoid hydration warnings
   * Use 'force' to enable SSR even in development mode
   * @default true (false in dev unless 'force')
   */
  ssr?: boolean | 'force'

  /**
   * Enable client-side processing for dynamic content
   * When true, processes content in the browser using MutationObserver
   * @default true
   */
  client?: boolean

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-smartscript',
    configKey: 'smartscript',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },

  // Default configuration options - SINGLE SOURCE OF TRUTH
  defaults: SHARED_DEFAULTS,

  setup(options, nuxt) {
    if (!options.enabled) {
      return
    }

    const resolver = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    // Transpile runtime
    nuxt.options.build.transpile.push(runtimeDir)

    // Add client-side plugin if enabled
    if (options.client !== false) {
      addPlugin({
        src: resolver.resolve('./runtime/plugin'),
        mode: 'client',
      })
    }

    // Add server-side plugin for SSR/SSG if enabled
    // In development, disable SSR by default to avoid hydration warnings
    // Only enable in dev if user explicitly forces it with ssr: 'force'
    const shouldEnableSSR = options.ssr !== false && (
      !nuxt.options.dev // Production/generate mode
      || options.ssr === 'force' // Explicitly force SSR in dev
    )

    if (shouldEnableSSR) {
      addServerPlugin(resolver.resolve('./runtime/nitro/plugin'))
    }

    // Add CSS file
    nuxt.options.css.push(resolver.resolve('./runtime/superscript.css'))

    // Pass module options to runtime
    // The options are merged with defaults by Nuxt, so all required fields are present
    // eslint-disable-next-line ts/no-explicit-any
    nuxt.options.runtimeConfig.public.smartscript = options as any
  },
})
