/**
 * Core processing engine for SmartScript
 */

import type { PatternSet, SuperscriptConfig } from './types'
import {
  createFragmentFromParts,
  isProcessed,
  markAsProcessed,
  resetProcessingFlags,
  shouldExcludeElement,
} from './dom'
import { logger } from './logger'
import { clearProcessingCaches, needsProcessing, processText } from './processor'

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
  const hasModifications = parts.some((p) => p.type !== 'text')
    || parts.map((p) => p.content).join('') !== text

  if (hasModifications) {
    logger.debug('Found modifications, replacing node')
    const fragment = createFragmentFromParts(parts)
    textNode.parentNode?.replaceChild(fragment, textNode)
    return true
  }

  return false
}

/**
 * Create optimized TreeWalker filter
 */
function createTextNodeFilter(
  config: SuperscriptConfig,
  combinedPattern: RegExp,
): NodeFilter {
  // Pre-compile exclude check for better performance
  const excludeSelectors = config.selectors.exclude

  return {
    acceptNode: (node: Node): number => {
      const text = node.textContent

      // Fast early exit for empty nodes
      if (!text || !text.trim()) {
        return NodeFilter.FILTER_REJECT
      }

      // Skip if parent is excluded (check once)
      const parent = node.parentElement
      if (parent && shouldExcludeElement(parent, excludeSelectors)) {
        return NodeFilter.FILTER_REJECT
      }

      // Skip if parent is one of our generated elements (including from SSR)
      if (parent && (
        parent.classList.contains('ss-tm')
        || parent.classList.contains('ss-reg')
        || parent.classList.contains('ss-sup')
        || parent.classList.contains('ss-sub')
        || parent.classList.contains('ss-ordinal')
        || parent.classList.contains('ss-chemical')
        || parent.classList.contains('ss-math')
        || (parent.tagName === 'SUP' && parent.className.includes('ss-'))
        || (parent.tagName === 'SUB' && parent.className.includes('ss-'))
        || (parent.tagName === 'SPAN' && parent.className.includes('ss-'))
      )) {
        return NodeFilter.FILTER_REJECT
      }

      // Use cached pattern check
      return needsProcessing(text, combinedPattern)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    },
  }
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

  // Create optimized tree walker
  logger.trace('processElement called, combinedPattern:', combinedPattern)
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    createTextNodeFilter(config, combinedPattern),
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
 * Batch process elements using requestAnimationFrame
 */
function batchProcessElements(
  elements: Element[],
  config: SuperscriptConfig,
  patterns: PatternSet,
  combinedPattern: RegExp,
  batchSize = 10,
): void {
  let index = 0

  function processBatch() {
    const endIndex = Math.min(index + batchSize, elements.length)

    for (let i = index; i < endIndex; i++) {
      processElement(elements[i], config, patterns, combinedPattern)
    }

    index = endIndex

    if (index < elements.length) {
      // Process next batch in next frame
      requestAnimationFrame(processBatch)
    }
  }

  if (elements.length > 0) {
    requestAnimationFrame(processBatch)
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

  const allElements: Element[] = []

  // Collect all elements first
  config.selectors.include.forEach((selector) => {
    try {
      const elements = document.querySelectorAll(selector)
      if (elements.length > 0) {
        logger.debug(`Found ${elements.length} elements for selector "${selector}"`)
        allElements.push(...Array.from(elements))
      }
    } catch (error) {
      logger.warn(`Invalid selector: ${selector}`, error)
    }
  })

  // Process in batches for better performance
  if (allElements.length > 20) {
    // Use batching for large element counts
    batchProcessElements(allElements, config, patterns, combinedPattern)
  } else {
    // Process immediately for small counts
    allElements.forEach((element) => {
      processElement(element, config, patterns, combinedPattern)
    })
  }
}

/**
 * Initialize processing for navigation
 */
export function initializeForNavigation(): void {
  resetProcessingFlags()
  clearProcessingCaches() // Clear caches on navigation for fresh processing
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
      (mutation) => mutation.type === 'childList' && mutation.addedNodes.length > 0,
    )

    if (hasNewContent) {
      debouncedProcessor.process()
    }
  })
}
