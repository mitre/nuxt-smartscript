/**
 * Runtime types for the SmartScript plugin
 * These types are used by the runtime code and are separate from module configuration
 */

/**
 * Runtime configuration passed from module to runtime
 * This is what gets set in runtimeConfig.public.smartscript
 */
export interface RuntimeConfig {
  enabled: boolean
  debug: boolean
  ssr: boolean | 'force'
  client: boolean
  positioning: {
    trademark: {
      body: string
      headers: string
      fontSize: string
    }
    registered: {
      body: string
      headers: string
      fontSize: string
    }
    ordinals: {
      fontSize: string
    }
    chemicals: {
      fontSize: string
    }
  }
  selectors: {
    include: string[]
    exclude: string[]
  }
  performance: {
    debounce: number
    batchSize: number
    delay: number
  }
  transformations: {
    trademark: boolean
    registered: boolean
    copyright: boolean
    ordinals: boolean
    chemicals: boolean
    mathSuper: boolean
    mathSub: boolean
  }
  customPatterns?: {
    trademark?: string
    registered?: string
    copyright?: string
    ordinals?: string
    chemicals?: string
    mathSuper?: string
    mathSub?: string
  }
  cssVariables?: Record<string, string>
}

/**
 * Symbols configuration derived from transformations
 * Used internally by the processing engine
 */
export interface SymbolsConfig {
  trademark: string[]
  registered: string[]
  copyright: string[]
  ordinals: boolean
}
