/**
 * Regex patterns for text transformation
 */

import type { PatternSet, SuperscriptConfig } from './types'

// ============================================
// Shared Regex Pattern Sources (DRY)
// ============================================

// Symbol patterns
const TRADEMARK_PATTERN = /™|\(TM\)|\bTM\b/
const REGISTERED_PATTERN = /®|\(R\)(?!\))/
const COPYRIGHT_PATTERN = /©|\(C\)(?!\))/

// Typography patterns
const ORDINALS_PATTERN = /\b(\d+)(st|nd|rd|th)\b/
const CHEMICALS_PATTERN = /([A-Z][a-z]?)(\d+)|\)(\d+)/

// Math notation patterns (with lookbehind for context)
const MATH_SUPER_PATTERN = /(?<=^|[\s=+\-*/().,\da-z])([a-zA-Z])\^(\d+|[a-zA-Z]|\{[^}]+\})/
const MATH_SUB_PATTERN = /(?<=^|[\s=+\-*/().,])([a-z])_(\d+|[a-z]|\{[^}]+\})/i

// Utility patterns for validation (used by PatternMatchers)
const TRADEMARK_VALIDATE = /^(?:™|\(TM\)|TM)$/
const REGISTERED_VALIDATE = /^(?:®|\(R\))$/
const ORDINAL_VALIDATE = /^\d+(?:st|nd|rd|th)$/
const CHEMICAL_ELEMENT_VALIDATE = /^[A-Z][a-z]?\d+$/
const CHEMICAL_PARENS_VALIDATE = /^\)\d+$/
const MATH_SUPER_VALIDATE = /^[a-z]\^/i
const MATH_SUB_VALIDATE = /^[a-z]_/i

// Extraction patterns (used by PatternExtractors)
const ORDINAL_EXTRACT = /^(\d+)(st|nd|rd|th)$/
const CHEMICAL_ELEMENT_EXTRACT = /^([A-Z][a-z]?)(\d+)$/
const CHEMICAL_PARENS_EXTRACT = /^\)(\d+)$/
const MATH_VARIABLE_EXTRACT = /^([a-z])[\^_](.+)$/i

/**
 * Create regex patterns based on configuration
 */
export function createPatterns(_config: SuperscriptConfig): PatternSet {
  return {
    // Matches ™, (TM), or standalone TM
    trademark: new RegExp(TRADEMARK_PATTERN.source, 'g'),

    // Matches ®, (R) but not (R))
    registered: new RegExp(REGISTERED_PATTERN.source, 'g'),

    // Matches ©, (C) but not (C))
    copyright: new RegExp(COPYRIGHT_PATTERN.source, 'g'),

    // Matches ordinal numbers (1st, 2nd, 3rd, 4th, etc.)
    ordinals: new RegExp(ORDINALS_PATTERN.source, 'g'),

    // Matches chemical formulas: H2, SO4, )3
    chemicals: new RegExp(CHEMICALS_PATTERN.source, 'g'),

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
    mathSuper: new RegExp(MATH_SUPER_PATTERN.source, 'g'),

    // Matches math subscript notation: x_1, x_n, x_{expr}
    // Pattern uses lookbehind to prevent matching in identifiers
    // Examples: "x_1" → match, "file_name" → no match
    mathSub: new RegExp(MATH_SUB_PATTERN.source, 'gi'),
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
    return match ? { number: match[1], suffix: match[2] } : null
  },

  extractChemicalElement: (text: string): { element: string, count: string } | null => {
    const match = text.match(CHEMICAL_ELEMENT_EXTRACT)
    return match ? { element: match[1], count: match[2] } : null
  },

  extractChemicalParentheses: (text: string): string | null => {
    const match = text.match(CHEMICAL_PARENS_EXTRACT)
    return match ? match[1] : null
  },

  extractMathScript: (text: string): string => {
    return stripBraces(text.substring(1))
  },

  extractMathWithVariable: (text: string): { variable: string, script: string } | null => {
    // Unified pattern for both super (^) and subscript (_)
    const match = text.match(MATH_VARIABLE_EXTRACT)
    if (match) {
      return {
        variable: match[1],
        script: stripBraces(match[2]),
      }
    }
    return null
  },
}
