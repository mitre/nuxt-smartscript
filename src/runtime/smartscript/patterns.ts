/**
 * Regex patterns for text transformation
 */

import type { PatternSet, SuperscriptConfig } from './types'
import { logger } from './logger'

// ============================================
// Shared Regex Pattern Sources (DRY)
// ============================================

// Symbol patterns
const TRADEMARK_PATTERN = /™|\(TM\)/ // Only (TM), not standalone TM
const REGISTERED_PATTERN = /®|\(R\)(?!\))/
const COPYRIGHT_PATTERN = /©|\(C\)(?!\))/

// Typography patterns
// Ordinal pattern - matches ANY number with st/nd/rd/th suffix
// Validation of correct suffix happens in processMatch() for simplicity
const ORDINALS_PATTERN = /\b(\d+)(st|nd|rd|th)\b/
// Chemical pattern - standard pattern for all chemicals
// H1-H6 exclusion is handled via context checking in processTextInternal
const CHEMICALS_PATTERN = /([A-Z][a-z]?)(\d+)|\)(\d+)/

// Math notation patterns (with lookbehind for context)
const MATH_SUPER_PATTERN = /(?<=^|[\s=+\-*/().,\da-z])([a-zA-Z])\^(\d+|[a-zA-Z]|\{[^}]+\})/
// Subscript pattern - only match in math context, not within identifiers
// This prevents matching within programming identifiers like MAX_SIZE
const MATH_SUB_PATTERN = /(?<=^|[\s=+\-*/().,])([a-zA-Z])_(\d+|[a-zA-Z]|\{[^}]+\})/

// Utility patterns for validation (used by PatternMatchers)
const TRADEMARK_VALIDATE = /^(?:™|\(TM\))$/ // Only (TM), not standalone TM
const REGISTERED_VALIDATE = /^(?:®|\(R\))$/
const ORDINAL_VALIDATE = /^\d+(?:st|nd|rd|th)$/
// Standard chemical validation - H1-H6 exclusion is handled in processTextInternal
const CHEMICAL_ELEMENT_VALIDATE = /^[A-Z][a-z]?\d+$/
const CHEMICAL_PARENS_VALIDATE = /^\)\d+$/
const MATH_SUPER_VALIDATE = /^[a-z]\^/i
const MATH_SUB_VALIDATE = /^[a-z]_/i

// Extraction patterns (used by PatternExtractors)
const ORDINAL_EXTRACT = /^(\d+)(st|nd|rd|th)$/
// Standard extraction - H1-H6 exclusion is handled in processTextInternal
const CHEMICAL_ELEMENT_EXTRACT = /^([A-Z][a-z]?)(\d+)$/
const CHEMICAL_PARENS_EXTRACT = /^\)(\d+)$/
const MATH_VARIABLE_EXTRACT = /^([a-z])[\^_](.+)$/i

/**
 * Safely create a regex pattern from a string
 */
function safeCreateRegex(pattern: string | undefined, defaultPattern: RegExp, name: string): RegExp {
  if (!pattern) {
    return new RegExp(defaultPattern.source, 'g')
  }

  try {
    // Test if the pattern is valid
    const regex = new RegExp(pattern, 'g')
    // Test it doesn't throw on execution
    'test'.match(regex)
    logger.debug('Custom pattern applied for:', name, '→', pattern)
    return regex
  } catch (error) {
    logger.warn('Invalid custom pattern for:', name, '→', pattern)
    logger.debug('Pattern validation error:', error)
    logger.info('Using default pattern for:', name)
    // Fall back to default pattern
    return new RegExp(defaultPattern.source, 'g')
  }
}

/**
 * Create regex patterns based on configuration
 */
export function createPatterns(config: SuperscriptConfig): PatternSet {
  // Create a dummy pattern that never matches
  const NEVER_MATCH = /\b\B/g

  // Get transformation settings with defaults
  const transforms = {
    trademark: config.transformations?.trademark !== false,
    registered: config.transformations?.registered !== false,
    copyright: config.transformations?.copyright !== false,
    ordinals: config.transformations?.ordinals !== false,
    chemicals: config.transformations?.chemicals !== false,
    mathSuper: config.transformations?.mathSuper !== false,
    mathSub: config.transformations?.mathSub !== false,
  }

  // Get custom patterns if provided
  const custom = config.customPatterns || {}

  return {
    // Matches ™, (TM), or standalone TM
    trademark: transforms.trademark
      ? safeCreateRegex(custom.trademark, TRADEMARK_PATTERN, 'trademark')
      : NEVER_MATCH,

    // Matches ®, (R) but not (R))
    registered: transforms.registered
      ? safeCreateRegex(custom.registered, REGISTERED_PATTERN, 'registered')
      : NEVER_MATCH,

    // Matches ©, (C) but not (C))
    copyright: transforms.copyright
      ? safeCreateRegex(custom.copyright, COPYRIGHT_PATTERN, 'copyright')
      : NEVER_MATCH,

    // Matches ordinal numbers (1st, 2nd, 3rd, 4th, etc.)
    ordinals: transforms.ordinals
      ? safeCreateRegex(custom.ordinals, ORDINALS_PATTERN, 'ordinals')
      : NEVER_MATCH,

    // Matches chemical formulas: H2, SO4, )3
    chemicals: transforms.chemicals
      ? safeCreateRegex(custom.chemicals, CHEMICALS_PATTERN, 'chemicals')
      : NEVER_MATCH,

    // Matches math superscript notation: x^2, x^n, x^{expr}
    // Pattern: /(?<=^|[\s=+\-*/().,\d]|[a-z])([a-zA-Z])\^(\d+|[a-zA-Z]|\{[^}]+\})/g
    //
    // Breakdown:
    // - (?<=...) - Positive lookbehind to ensure proper context
    //   - ^|[\s=+\-*/().,\d] - After start of string, whitespace, operators, or digits
    //   - |[a-z] - OR after lowercase letter (enables E=mc^2 to match c^2)
    // - ([a-zA-Z]) - Capture group 1: single letter variable
    // - \^ - Literal caret symbol
    // - (...) - Capture group 2: the exponent, which can be:
    //   - \d+ - One or more digits (x^2, x^10)
    //   - [a-zA-Z] - Single letter (x^n, x^i)
    //   - \{[^}]+\} - Expression in braces (x^{n+1}, x^{10})
    //
    // Examples that MATCH:
    // - "x^2" → ["x^2"]
    // - "E=mc^2" → ["c^2"] (after lowercase 'm')
    // - "2x^2" → ["x^2"] (after digit)
    // - "f(x)=x^2" → ["x^2"] (after equals)
    //
    // Examples that DON'T MATCH:
    // - "file^name" - 'e' is after 'l' but we still match (limitation)
    // - "MAX^2" - 'X' is after uppercase 'A' (blocked by lookbehind)
    mathSuper: transforms.mathSuper
      ? safeCreateRegex(custom.mathSuper, MATH_SUPER_PATTERN, 'mathSuper')
      : NEVER_MATCH,

    // Matches math subscript notation: x_1, x_n, x_{expr}
    // Pattern uses lookbehind to prevent matching in identifiers
    // Examples: "x_1" → match, "file_name" → no match
    mathSub: transforms.mathSub
      ? safeCreateRegex(custom.mathSub, MATH_SUB_PATTERN, 'mathSub')
      : NEVER_MATCH,
  }
}

/**
 * Create combined pattern for efficient matching
 */
export function createCombinedPattern(patterns: PatternSet, config: SuperscriptConfig): RegExp {
  const sources = [
    patterns.trademark.source,
    patterns.registered.source,
    patterns.copyright.source,
    config.symbols.ordinals ? patterns.ordinals.source : null,
    patterns.chemicals.source,
    patterns.mathSuper.source,
    patterns.mathSub.source,
  ].filter(Boolean)

  return new RegExp(sources.join('|'), 'g')
}

/**
 * Utility function to strip braces from math notation
 */
function stripBraces(text: string): string {
  return text.replace(/[{}]/g, '')
}

/**
 * Pattern matching utilities
 * Uses pre-compiled regex constants for better performance
 */
export const PatternMatchers = {
  isTrademark: (text: string): boolean => TRADEMARK_VALIDATE.test(text),
  isRegistered: (text: string): boolean => REGISTERED_VALIDATE.test(text),
  isCopyright: (text: string): boolean => COPYRIGHT_PATTERN.test(text),
  isOrdinal: (text: string): boolean => ORDINAL_VALIDATE.test(text),
  isChemicalElement: (text: string): boolean => CHEMICAL_ELEMENT_VALIDATE.test(text),
  isChemicalParentheses: (text: string): boolean => CHEMICAL_PARENS_VALIDATE.test(text),
  isMathSuperscript: (text: string): boolean => MATH_SUPER_VALIDATE.test(text),
  isMathSubscript: (text: string): boolean => MATH_SUB_VALIDATE.test(text),
}

/**
 * Extract parts from matched patterns
 */
export const PatternExtractors = {
  extractOrdinal: (text: string): { number: string, suffix: string } | null => {
    const match = text.match(ORDINAL_EXTRACT)
    return match && match[1] && match[2] ? { number: match[1], suffix: match[2] } : null
  },

  extractChemicalElement: (text: string): { element: string, count: string } | null => {
    const match = text.match(CHEMICAL_ELEMENT_EXTRACT)
    return match && match[1] && match[2] ? { element: match[1], count: match[2] } : null
  },

  extractChemicalParentheses: (text: string): string | null => {
    const match = text.match(CHEMICAL_PARENS_EXTRACT)
    return match && match[1] ? match[1] : null
  },

  extractMathScript: (text: string): string => {
    return stripBraces(text.substring(1))
  },

  extractMathWithVariable: (text: string): { variable: string, script: string } | null => {
    // Unified pattern for both super (^) and subscript (_)
    const match = text.match(MATH_VARIABLE_EXTRACT)
    if (match && match[1] && match[2]) {
      return {
        variable: match[1],
        script: stripBraces(match[2]),
      }
    }
    return null
  },
}
