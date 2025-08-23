/**
 * Text processing logic for SmartScript
 */

import type { TextPart, ProcessingResult } from './types'
import { PatternMatchers, PatternExtractors } from './patterns'
import { logger } from './logger'

// Cache for processed text to avoid redundant processing
// WeakMap allows garbage collection when text nodes are removed
const processedCache = new WeakMap<Text, TextPart[]>()

// String-based cache for text processing results (LRU-style with size limit)
const textResultCache = new Map<string, TextPart[]>()
const MAX_CACHE_SIZE = 1000

function getCachedOrProcess(text: string, pattern: RegExp): TextPart[] {
  // Check cache first
  const cached = textResultCache.get(text)
  if (cached) {
    logger.trace('Cache hit for text:', text.substring(0, 20))
    return cached
  }

  // Process and cache
  const result = processTextInternal(text, pattern)

  // LRU cache management
  if (textResultCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry (first in map)
    const firstKey = textResultCache.keys().next().value
    textResultCache.delete(firstKey)
  }

  textResultCache.set(text, result)
  return result
}

/**
 * Process matched text and determine how to transform it
 */
export function processMatch(matched: string): ProcessingResult {
  logger.debug('processMatch called with:', matched)

  // Trademark symbols - wrap in superscript for proper positioning
  if (PatternMatchers.isTrademark(matched)) {
    logger.debug('Trademark match confirmed for:', matched)
    return {
      modified: true,
      parts: [{
        type: 'super',
        content: '™',
      }],
    }
  }

  // Registered symbols - Unicode character already positioned
  if (PatternMatchers.isRegistered(matched)) {
    logger.debug('Registered match confirmed for:', matched)
    return {
      modified: true,
      parts: [{
        type: 'text',
        content: '®',
      }],
    }
  }

  // Copyright symbols (NOT superscripted)
  if (PatternMatchers.isCopyright(matched)) {
    logger.debug('Copyright match confirmed for:', matched)
    return {
      modified: true,
      parts: [{
        type: 'text',
        content: '©',
      }],
    }
  }

  // Ordinal numbers
  if (PatternMatchers.isOrdinal(matched)) {
    const ordinal = PatternExtractors.extractOrdinal(matched)
    if (ordinal) {
      // Validate that the ordinal suffix is correct for the number
      const num = Number.parseInt(ordinal.number, 10)
      const lastDigit = num % 10
      const lastTwoDigits = num % 100

      let expectedSuffix: string
      if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
        expectedSuffix = 'th' // 11th, 12th, 13th
      }
      else if (lastDigit === 1) {
        expectedSuffix = 'st' // 1st, 21st, 31st, etc.
      }
      else if (lastDigit === 2) {
        expectedSuffix = 'nd' // 2nd, 22nd, 32nd, etc.
      }
      else if (lastDigit === 3) {
        expectedSuffix = 'rd' // 3rd, 23rd, 33rd, etc.
      }
      else {
        expectedSuffix = 'th' // 4th, 5th, 6th, etc.
      }

      // Only transform if the suffix is correct
      if (ordinal.suffix === expectedSuffix) {
        logger.debug('Ordinal match confirmed:', matched, '→', ordinal)
        return {
          modified: true,
          parts: [
            { type: 'text', content: ordinal.number },
            { type: 'super', content: ordinal.suffix },
          ],
        }
      }
      else {
        // Invalid ordinal - don't transform
        logger.trace('Invalid ordinal suffix:', matched)
        return {
          modified: false,
          parts: [{ type: 'text', content: matched }],
        }
      }
    }
  }

  // Chemical formulas with parentheses
  if (PatternMatchers.isChemicalParentheses(matched)) {
    const number = PatternExtractors.extractChemicalParentheses(matched)
    if (number) {
      logger.debug('Chemical parentheses match:', matched, '→', number)
      return {
        modified: true,
        parts: [
          { type: 'text', content: ')' },
          { type: 'sub', content: number },
        ],
      }
    }
  }

  // Chemical element formulas - exclude H1-H6 HTML headers ONLY when standalone
  if (PatternMatchers.isChemicalElement(matched)) {
    // Skip H1-H6 ONLY when they appear to be HTML headers (standalone)
    // H2 in "H2O" should still be processed as a chemical
    // We check context in the full text processing, not here

    const chemical = PatternExtractors.extractChemicalElement(matched)
    if (chemical) {
      logger.debug('Chemical element match:', matched, '→', chemical)
      return {
        modified: true,
        parts: [
          { type: 'text', content: chemical.element },
          { type: 'sub', content: chemical.count },
        ],
      }
    }
  }

  // Math superscript (e.g., x^2, x^n, x^{10})
  if (PatternMatchers.isMathSuperscript(matched)) {
    const parts = PatternExtractors.extractMathWithVariable(matched)
    if (parts) {
      logger.debug('Math superscript match:', matched, '→', parts)
      return {
        modified: true,
        parts: [
          { type: 'text', content: parts.variable },
          { type: 'super', content: parts.script },
        ],
      }
    }
  }

  // Math subscript (e.g., x_1, x_n, x_{10})
  if (PatternMatchers.isMathSubscript(matched)) {
    const parts = PatternExtractors.extractMathWithVariable(matched)
    if (parts) {
      logger.debug('Math subscript match:', matched, '→', parts)
      return {
        modified: true,
        parts: [
          { type: 'text', content: parts.variable },
          { type: 'sub', content: parts.script },
        ],
      }
    }
  }

  // No transformation needed
  logger.trace('No transformation for:', matched)
  return {
    modified: false,
    parts: [{ type: 'text', content: matched }],
  }
}

/**
 * Internal text processing (without caching)
 */
function processTextInternal(text: string, pattern: RegExp): TextPart[] {
  const parts: TextPart[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Reset pattern to ensure clean state
  pattern.lastIndex = 0

  while ((match = pattern.exec(text)) !== null) {
    const matchedText = match[0]

    // Special handling for H1-H6 patterns - skip if standalone (not followed by uppercase)
    if (/^H[1-6]$/.test(matchedText)) {
      const nextCharIndex = match.index + matchedText.length
      const nextChar = text[nextCharIndex]

      if (!nextChar || !/[A-Z]/.test(nextChar)) {
        // Standalone H1-H6 - skip this match entirely
        logger.trace('Skipping standalone H1-H6 pattern:', matchedText)
        // Move the pattern's lastIndex forward to skip this match
        pattern.lastIndex = match.index + 1
        continue
      }
    }

    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      })
    }

    // Process the matched text
    const result = processMatch(matchedText)
    logger.trace('processMatch returned:', result)
    parts.push(...result.parts)

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    })
  }

  logger.trace('processText returning parts:', parts)
  return parts
}

/**
 * Process a text string and split it into parts (with caching)
 */
export function processText(text: string, pattern: RegExp): TextPart[] {
  return getCachedOrProcess(text, pattern)
}

/**
 * Check if text needs processing
 */
export function needsProcessing(text: string, pattern: RegExp): boolean {
  // Reset pattern to ensure clean state
  pattern.lastIndex = 0
  const result = pattern.test(text)
  pattern.lastIndex = 0
  return result
}

/**
 * Clear processing caches (useful for navigation or memory management)
 */
export function clearProcessingCaches(): void {
  processedCache.clear?.() // WeakMap doesn't have clear in all browsers
  textResultCache.clear()
  logger.debug('Processing caches cleared')
}
