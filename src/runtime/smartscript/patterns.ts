/**
 * Regex patterns for text transformation
 */

import type { PatternSet, SuperscriptConfig } from './types'

/**
 * Create regex patterns based on configuration
 */
export function createPatterns(config: SuperscriptConfig): PatternSet {
  return {
    // Matches ™, (TM), or standalone TM
    trademark: /™|\(TM\)|\bTM\b/g,

    // Matches ®, (R) but not (R))
    registered: /®|\(R\)(?!\))/g,

    // Matches ©, (C) but not (C))
    copyright: /©|\(C\)(?!\))/g,

    // Matches ordinal numbers (1st, 2nd, 3rd, 4th, etc.)
    ordinals: /\b(\d+)(st|nd|rd|th)\b/g,

    // Matches chemical formulas: H2, SO4, )3
    chemicals: /([A-Z][a-z]?)(\d+)|\)(\d+)/g,

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
    mathSuper: /(?<=^|[\s=+\-*/().,\d]|[a-z])([a-zA-Z])\^(\d+|[a-zA-Z]|\{[^}]+\})/g,

    // Matches math subscript notation: x_1, x_n, x_{expr}
    // Pattern: /(?<=^|[\s=+\-*/().,])([a-zA-Z])_(\d+|[a-zA-Z]|\{[^}]+\})/g
    //
    // Breakdown:
    // - (?<=...) - Positive lookbehind (more restrictive than superscript)
    //   - ^|[\s=+\-*/().,] - ONLY after start, whitespace, or math operators
    //   - NO [a-z] option (prevents matching in identifiers like file_name)
    // - ([a-zA-Z]) - Capture group 1: single letter variable
    // - _ - Literal underscore
    // - (...) - Capture group 2: the subscript (same options as superscript)
    //
    // Examples that MATCH:
    // - "x_1" → ["x_1"]
    // - "H_2O" → ["H_2"] (after start)
    // - "a=b_c" → ["b_c"] (after equals)
    // - "(x_1)" → ["x_1"] (after parenthesis)
    //
    // Examples that DON'T MATCH:
    // - "file_name" - 'e' is after letter 'l' (blocked by lookbehind)
    // - "some_var" - 'e' is after letter 'm' (blocked by lookbehind)
    // - "log_2" - 'g' is after letter 'o' (blocked by lookbehind)
    mathSub: /(?<=^|[\s=+\-*/().,])([a-zA-Z])_(\d+|[a-zA-Z]|\{[^}]+\})/g,
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
 * Pattern matching utilities
 */
export const PatternMatchers = {
  isTrademark: (text: string): boolean => /^(?:™|\(TM\)|TM)$/.test(text),
  isRegistered: (text: string): boolean => /^(?:®|\(R\))$/.test(text),
  isCopyright: (text: string): boolean => /(?:©|\(C\))/.test(text),
  isOrdinal: (text: string): boolean => /^\d+(?:st|nd|rd|th)$/.test(text),
  isChemicalElement: (text: string): boolean => /^[A-Z][a-z]?\d+$/.test(text),
  isChemicalParentheses: (text: string): boolean => /^\)\d+$/.test(text),
  isMathSuperscript: (text: string): boolean => /^[a-zA-Z]\^/.test(text),
  isMathSubscript: (text: string): boolean => /^[a-zA-Z]_/.test(text),
}

/**
 * Extract parts from matched patterns
 */
export const PatternExtractors = {
  extractOrdinal: (text: string): { number: string, suffix: string } | null => {
    const match = text.match(/^(\d+)(st|nd|rd|th)$/)
    return match ? { number: match[1], suffix: match[2] } : null
  },

  extractChemicalElement: (text: string): { element: string, count: string } | null => {
    const match = text.match(/^([A-Z][a-z]?)(\d+)$/)
    return match ? { element: match[1], count: match[2] } : null
  },

  extractChemicalParentheses: (text: string): string | null => {
    const match = text.match(/^\)(\d+)$/)
    return match ? match[1] : null
  },

  extractMathScript: (text: string): string => {
    return text.substring(1).replace(/[{}]/g, '')
  },

  extractMathWithVariable: (text: string): { variable: string; script: string } | null => {
    // Handle x^2, x_n, x^{10}, x_{n+1} etc.
    const superMatch = text.match(/^([a-zA-Z])\^(.+)$/)
    if (superMatch) {
      return {
        variable: superMatch[1],
        script: superMatch[2].replace(/[{}]/g, ''),
      }
    }
    
    const subMatch = text.match(/^([a-zA-Z])_(.+)$/)
    if (subMatch) {
      return {
        variable: subMatch[1],
        script: subMatch[2].replace(/[{}]/g, ''),
      }
    }
    
    return null
  },
}
