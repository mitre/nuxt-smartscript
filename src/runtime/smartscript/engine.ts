/**
 * Core processing engine for SmartScript
 */

import type { SuperscriptConfig, PatternSet } from './types'
import { processText, needsProcessing } from './processor'
import { logger } from './logger'
import {
  createFragmentFromParts,
  shouldExcludeElement,
  isProcessed,
  markAsProcessed,
  resetProcessingFlags,
} from './dom'

/**
 * Process a single text node
 */
export function processTextNode(
  textNode: Text,
  config: SuperscriptConfig,
  pattern: RegExp,
): boolean {
  const text = textNode.textContent || ''

  if (!text.trim() || !needsProcessing(text, pattern)) {
    return false
  }

  logger.debug('Processing text node:', text.substring(0, 50))
  const parts = processText(text, pattern)

  // Check if we actually modified the content
  // Either we have non-text parts (super/sub) OR the text content changed
  const hasModifications = parts.some(p => p.type !== 'text')
    || parts.map(p => p.content).join('') !== text

  if (hasModifications) {
    logger.debug('Found modifications, replacing node')
    const fragment = createFragmentFromParts(parts)
    textNode.parentNode?.replaceChild(fragment, textNode)
    return true
  }

  return false
}

/**
 * Process an element and its text nodes
 */
export function processElement(
  element: Element,
  config: SuperscriptConfig,
  patterns: PatternSet,
  combinedPattern: RegExp,
): void {
  // Skip if excluded
  if (shouldExcludeElement(element, config.selectors.exclude)) {
    return
  }

  // Skip if already processed
  if (isProcessed(element)) {
    return
  }

  // Create tree walker to find text nodes
  logger.trace('processElement called, combinedPattern:', combinedPattern)
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node: Node): number => {
        // Skip empty text nodes
        if (!node.textContent?.trim()) {
          return NodeFilter.FILTER_REJECT
        }

        // Skip if parent is excluded
        const parent = node.parentElement
        if (parent && shouldExcludeElement(parent, config.selectors.exclude)) {
          return NodeFilter.FILTER_REJECT
        }

        // Check if text contains any patterns
        const textContent = node.textContent || ''
        if (needsProcessing(textContent, combinedPattern)) {
          return NodeFilter.FILTER_ACCEPT
        }

        return NodeFilter.FILTER_REJECT
      },
    },
  )

  // Collect nodes to process (avoid modifying during iteration)
  const nodesToProcess: Text[] = []
  let node = walker.nextNode()

  while (node) {
    nodesToProcess.push(node as Text)
    node = walker.nextNode()
  }

  // Process collected nodes
  let modified = false
  for (const textNode of nodesToProcess) {
    if (processTextNode(textNode, config, combinedPattern)) {
      modified = true
    }
  }

  // Mark as processed if we made changes
  if (modified) {
    markAsProcessed(element)
  }
}

/**
 * Process all matching elements in the document
 */
export function processContent(
  config: SuperscriptConfig,
  patterns: PatternSet,
  combinedPattern: RegExp,
): void {
  logger.info('processContent called with selectors:', config.selectors.include)

  // Process each include selector
  config.selectors.include.forEach((selector) => {
    try {
      const elements = document.querySelectorAll(selector)
      if (elements.length > 0) {
        logger.debug(`Found ${elements.length} elements for selector "${selector}"`)
      }
      elements.forEach((element) => {
        processElement(element, config, patterns, combinedPattern)
      })
    }
    catch (error) {
      logger.warn(`Invalid selector: ${selector}`, error)
    }
  })
}

/**
 * Initialize processing for navigation
 */
export function initializeForNavigation(): void {
  resetProcessingFlags()
}

/**
 * Create a debounced processor
 */
export function createDebouncedProcessor(
  processFunc: () => void,
  delay: number,
): {
  process: () => void
  cancel: () => void
} {
  let timeoutId: NodeJS.Timeout | null = null

  const process = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(processFunc, delay)
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return { process, cancel }
}

/**
 * Create a mutation observer for dynamic content
 */
export function createContentObserver(
  processFunc: () => void,
  config: SuperscriptConfig,
): MutationObserver {
  const debouncedProcessor = createDebouncedProcessor(
    processFunc,
    config.performance.debounce,
  )

  return new MutationObserver((mutations: MutationRecord[]) => {
    const hasNewContent = mutations.some(
      mutation => mutation.type === 'childList' && mutation.addedNodes.length > 0,
    )

    if (hasNewContent) {
      debouncedProcessor.process()
    }
  })
}
