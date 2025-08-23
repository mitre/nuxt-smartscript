/**
 * Type definitions for the SmartScript plugin
 */

export interface SuperscriptConfig {
  debug?: boolean // Enable debug logging
  symbols: {
    trademark: string[]
    registered: string[]
    copyright: string[]
    ordinals: boolean
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
  positioning?: {
    trademark?: {
      body?: string
      headers?: string
      fontSize?: string
    }
    registered?: {
      body?: string
      headers?: string
      fontSize?: string
    }
    ordinals?: {
      fontSize?: string
    }
    chemicals?: {
      fontSize?: string
    }
  }
  transformations?: {
    trademark?: boolean
    registered?: boolean
    copyright?: boolean
    ordinals?: boolean
    chemicals?: boolean
    mathSuper?: boolean
    mathSub?: boolean
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

export interface TextPart {
  type: 'text' | 'super' | 'sub'
  content: string
}

export interface PatternSet {
  trademark: RegExp
  registered: RegExp
  copyright: RegExp
  ordinals: RegExp
  chemicals: RegExp
  mathSuper: RegExp
  mathSub: RegExp
}

export type ProcessingResult = {
  modified: boolean
  parts: TextPart[]
}

export interface ProcessingOptions {
  element: Element
  config: SuperscriptConfig
  patterns: PatternSet
  combinedPattern: RegExp
}
