/**
 * DOM manipulation utilities for SmartScript
 */

import type { TextPart } from './types'
import { CSS_CLASSES } from './config'
import { logger } from './logger'

// Pre-compiled regex patterns for performance
const DIGITS_ONLY = /^\d+$/
const ORDINAL_SUFFIX = /^(?:st|nd|rd|th)$/

/**
 * Create a superscript element with appropriate attributes
 */
export function createSuperscriptElement(
  content: string,
  type: 'trademark' | 'registered' | 'ordinal' | 'math' | 'generic',
): HTMLElement {
  // Use SPAN only for TM/R symbols that need precise positioning
  // Keep SUP for math/ordinals for semantic correctness
  const sup = document.createElement(
    (type === 'trademark' || type === 'registered') ? 'span' : 'sup',
  )
  sup.textContent = content

  switch (type) {
    case 'trademark':
      sup.className = `${CSS_CLASSES.superscript} ${CSS_CLASSES.trademark}`
      sup.setAttribute('aria-label', 'trademark')
      break
    case 'registered':
      sup.className = `${CSS_CLASSES.superscript} ${CSS_CLASSES.registered}`
      sup.setAttribute('aria-label', 'registered')
      break
    case 'ordinal':
      sup.className = `${CSS_CLASSES.superscript} ${CSS_CLASSES.ordinal}`
      sup.setAttribute('aria-label', content)
      break
    case 'math':
      sup.className = `${CSS_CLASSES.superscript} ${CSS_CLASSES.math}`
      sup.setAttribute('aria-label', `superscript ${content}`)
      break
    default:
      sup.className = CSS_CLASSES.superscript
      sup.setAttribute('aria-label', `superscript ${content}`)
  }

  return sup
}

/**
 * Create a subscript element with appropriate attributes
 */
export function createSubscriptElement(
  content: string,
  type: 'chemical' | 'math' | 'generic',
): HTMLElement {
  // Use semantic SUB for subscripts - they don't need positioning adjustments
  const sub = document.createElement('sub')
  sub.textContent = content
  sub.className = CSS_CLASSES.subscript

  switch (type) {
    case 'chemical':
      // For chemical formulas, just the number is clearer
      if (DIGITS_ONLY.test(content)) {
        sub.setAttribute('aria-label', content)
      } else {
        sub.setAttribute('aria-label', `subscript ${content}`)
      }
      break
    case 'math':
      sub.setAttribute('aria-label', `subscript ${content}`)
      break
    default:
      sub.setAttribute('aria-label', `subscript ${content}`)
  }

  return sub
}

/**
 * Create document fragment from text parts
 */
export function createFragmentFromParts(parts: TextPart[]): DocumentFragment {
  const fragment = document.createDocumentFragment()
  logger.trace('Creating fragment from parts:', parts)

  parts.forEach((part) => {
    if (part.type === 'super') {
      let element: HTMLElement

      // Use subtype if provided, otherwise fallback to content-based detection
      if (part.subtype && part.subtype !== 'chemical') {
        element = createSuperscriptElement(part.content, part.subtype as 'trademark' | 'registered' | 'ordinal' | 'math' | 'generic')
      } else {
        // Fallback for backward compatibility
        if (part.content === '™') {
          element = createSuperscriptElement(part.content, 'trademark')
        } else if (part.content === '®') {
          element = createSuperscriptElement(part.content, 'registered')
        } else if (ORDINAL_SUFFIX.test(part.content)) {
          element = createSuperscriptElement(part.content, 'ordinal')
        } else {
          element = createSuperscriptElement(part.content, 'generic')
        }
      }

      fragment.appendChild(element)
    } else if (part.type === 'sub') {
      // Use subtype if provided, otherwise detect based on content
      const subtype = part.subtype === 'math'
        ? 'math'
        : part.subtype === 'chemical'
          ? 'chemical'
          : DIGITS_ONLY.test(part.content)
            ? 'chemical'
            : 'generic'
      const element = createSubscriptElement(part.content, subtype)
      fragment.appendChild(element)
    } else {
      fragment.appendChild(document.createTextNode(part.content))
    }
  })

  return fragment
}

/**
 * Check if element should be excluded from processing
 */
export function shouldExcludeElement(
  element: Element,
  excludeSelectors: string[],
): boolean {
  return excludeSelectors.some((selector) => {
    try {
      // Check if the element itself matches OR any ancestor matches
      return element.matches(selector) || element.closest(selector) !== null
    } catch (error) {
      logger.warn('Invalid exclude selector:', selector, error)
      return false
    }
  })
}

/**
 * Check if element should be included for processing
 */
export function shouldIncludeElement(
  element: Element,
  includeSelectors: string[],
): boolean {
  return includeSelectors.some((selector) => {
    try {
      return element.matches(selector)
    } catch {
      return false
    }
  })
}

/**
 * Mark element as processed
 */
export function markAsProcessed(element: Element): void {
  if (element instanceof HTMLElement) {
    element.dataset.superscriptProcessed = 'true'
    logger.trace('Marked element as processed:', element.tagName)
  }
}

/**
 * Check if element is already processed
 */
export function isProcessed(element: Element): boolean {
  return (element as HTMLElement).dataset?.superscriptProcessed === 'true'
}

/**
 * Reset processing flags for navigation
 */
export function resetProcessingFlags(): void {
  const processed = document.querySelectorAll('[data-superscript-processed]')
  logger.debug(`Resetting ${processed.length} processing flags`)
  processed.forEach((el) => {
    if (el instanceof HTMLElement) {
      delete el.dataset.superscriptProcessed
    }
  })
}
