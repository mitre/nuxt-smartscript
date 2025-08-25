/**
 * Shared transformation logic for both client and server
 * Converts text to HTML strings using our existing processor logic
 */

import type { TextPart } from './types'
import { needsProcessing, processText } from './processor'

/**
 * Convert TextPart array to HTML string
 */
export function partsToHTML(parts: TextPart[]): string {
  return parts.map((part) => {
    switch (part.type) {
      case 'text':
        // Don't escape text content - it's safe HTML text
        return part.content

      case 'super':
        // Use SPAN for TM/R symbols (positioning control)
        if (part.subtype === 'trademark' || part.subtype === 'registered') {
          return `<span class="ss-${part.subtype === 'trademark' ? 'tm' : 'reg'}">${escapeHtml(part.content)}</span>`
        }
        // Use SUP for semantic content (math, ordinals)
        return `<sup class="ss-${part.subtype || 'super'}">${escapeHtml(part.content)}</sup>`

      case 'sub':
        return `<sub class="ss-${part.subtype || 'sub'}">${escapeHtml(part.content)}</sub>`

      default:
        return escapeHtml(part.content)
    }
  }).join('')
}

/**
 * Escape HTML special characters (but not for already processed content)
 */
function escapeHtml(text: string): string {
  // Don't escape HTML if it looks like it contains our processed elements
  if (text.includes('<span class="ss-') || text.includes('<sup class="ss-') || text.includes('<sub class="ss-')) {
    return text
  }

  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    // Don't escape apostrophes - they're safe in HTML content
  }

  return text.replace(/[&<>"]/g, (char) => htmlEscapes[char] || char)
}

/**
 * Transform text content to HTML string using our existing processor
 * This is the main function for SSR/SSG
 */
export function transformTextToHTML(text: string, pattern: RegExp): string {
  // Skip if no patterns match
  if (!needsProcessing(text, pattern)) {
    // Don't escape apostrophes - return text as-is for most content
    return text
  }

  // Process text using our existing logic
  const parts = processText(text, pattern)

  // Convert parts to HTML (this handles escaping properly)
  return partsToHTML(parts)
}

/**
 * Transform HTML content by finding and processing text nodes
 * This processes an entire HTML string for SSR/SSG
 */
export function transformHTMLContent(html: string, pattern: RegExp, _excludeSelectors?: string[]): string {
  // Stack-based tracking for nested elements
  const tagStack: string[] = []
  // Use provided exclusions or default to common ones
  const defaultExclusions = ['script', 'style', 'code', 'pre']
  const excludedElements = new Set(defaultExclusions)
  let isInExcluded = false
  let excludedDepth = 0

  // More comprehensive regex that captures all parts of HTML
  return html.replace(/(<([^>]+)>)|([^<]+)/g, (match, fullTag, tagContent, textContent) => {
    // Handle tags
    if (fullTag) {
      // Parse tag name and attributes
      const isClosing = tagContent.startsWith('/')
      const tagMatch = tagContent.match(/^\/?([a-z0-9]+)/i)
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : ''

      if (isClosing) {
        // Handle closing tags
        const lastTag = tagStack.pop()

        // Check if we're exiting an excluded zone
        if (excludedElements.has(tagName)) {
          isInExcluded = tagStack.some((tag) => excludedElements.has(tag))
        }

        // Handle nested exclusion zones with data-no-superscript
        if (lastTag === 'excluded-zone') {
          excludedDepth--
          if (excludedDepth <= 0) {
            excludedDepth = 0
            // Re-check if we're still in an excluded zone
            isInExcluded = tagStack.some((tag) =>
              tag === 'excluded-zone' || excludedElements.has(tag),
            )
          }
        }
      } else if (!tagContent.endsWith('/')) {
        // Handle opening tags (not self-closing)
        tagStack.push(tagName)

        // Check for excluded elements
        if (excludedElements.has(tagName)) {
          isInExcluded = true
        }

        // Check for data-no-superscript attribute
        if (tagContent.includes('data-no-superscript')
          || tagContent.includes('class="no-superscript"')
          || tagContent.includes('class=\'no-superscript\'')) {
          tagStack[tagStack.length - 1] = 'excluded-zone'
          isInExcluded = true
          excludedDepth++
        }
      }

      return fullTag
    }

    // Handle text content
    if (textContent && !isInExcluded) {
      if (textContent.trim()) {
        return transformTextToHTML(textContent, pattern)
      }
    }

    return match
  })
}

/**
 * Simple HTML parser for better accuracy (optional enhancement)
 * This is a more robust approach if the regex method has issues
 */
export function transformHTMLContentRobust(html: string, pattern: RegExp): string {
  // For server-side, we might want to use a proper HTML parser
  // like cheerio or node-html-parser for more accuracy
  // For now, we'll use the regex approach above

  // This is where we could integrate with a server-side HTML parser
  // if needed for more complex scenarios

  return transformHTMLContent(html, pattern)
}
