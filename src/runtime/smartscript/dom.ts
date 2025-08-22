/**
 * DOM manipulation utilities for SmartScript
 */

import type { TextPart } from './types'
import { logger } from './logger'

/**
 * Create a superscript element with appropriate attributes
 */
export function createSuperscriptElement(
  content: string,
  type: 'trademark' | 'registered' | 'ordinal' | 'math' | 'generic',
): HTMLElement {
  const sup = document.createElement('sup')
  sup.textContent = content

  switch (type) {
    case 'trademark':
      sup.className = 'ss-sup ss-tm'
      sup.setAttribute('aria-label', 'trademark')
      break
    case 'registered':
      sup.className = 'ss-sup ss-reg'
      sup.setAttribute('aria-label', 'registered')
      break
    case 'ordinal':
      sup.className = 'ss-sup ss-ordinal'
      sup.setAttribute('aria-label', content)
      break
    case 'math':
      sup.className = 'ss-sup ss-math'
      sup.setAttribute('aria-label', `superscript ${content}`)
      break
    default:
      sup.className = 'ss-sup'
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
  const sub = document.createElement('sub')
  sub.textContent = content
  sub.className = 'ss-sub'

  switch (type) {
    case 'chemical':
      // For chemical formulas, just the number is clearer
      if (/^\d+$/.test(content)) {
        sub.setAttribute('aria-label', content)
      }
      else {
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

      // Determine the type of superscript
      if (part.content === '™') {
        element = createSuperscriptElement(part.content, 'trademark')
      }
      else if (part.content === '®') {
        element = createSuperscriptElement(part.content, 'registered')
      }
      else if (/^(?:st|nd|rd|th)$/.test(part.content)) {
        element = createSuperscriptElement(part.content, 'ordinal')
      }
      else {
        element = createSuperscriptElement(part.content, 'generic')
      }

      fragment.appendChild(element)
    }
    else if (part.type === 'sub') {
      const isChemical = /^\d+$/.test(part.content)
      const element = createSubscriptElement(
        part.content,
        isChemical ? 'chemical' : 'generic',
      )
      fragment.appendChild(element)
    }
    else {
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
      return element.matches(selector)
    }
    catch (error) {
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
    }
    catch {
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
