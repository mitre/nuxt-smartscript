/**
 * Text processing logic for SmartScript
 */

import type { TextPart, ProcessingResult } from './types'
import { PatternMatchers, PatternExtractors } from './patterns'
import { logger } from './logger'

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
      logger.debug('Ordinal match confirmed:', matched, '→', ordinal)
      return {
        modified: true,
        parts: [
          { type: 'text', content: ordinal.number },
          { type: 'super', content: ordinal.suffix },
        ],
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

  // Chemical element formulas
  if (PatternMatchers.isChemicalElement(matched)) {
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
 * Process a text string and split it into parts
 */
export function processText(text: string, pattern: RegExp): TextPart[] {
  const parts: TextPart[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Reset pattern to ensure clean state
  pattern.lastIndex = 0

  while ((match = pattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      })
    }

    // Process the matched text
    const result = processMatch(match[0])
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
 * Check if text needs processing
 */
export function needsProcessing(text: string, pattern: RegExp): boolean {
  // Reset pattern to ensure clean state
  pattern.lastIndex = 0
  const result = pattern.test(text)
  pattern.lastIndex = 0
  return result
}
