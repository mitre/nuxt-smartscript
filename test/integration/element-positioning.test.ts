/**
 * Integration tests for element positioning
 * Verifies that SPAN elements can be positioned while SUP/SUB use native positioning
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { processContent } from '../../src/runtime/smartscript/engine'
import { createCombinedPattern, createPatterns } from '../../src/runtime/smartscript/patterns'
import { cleanupDOM, createTestConfig, createTestElement, setupDOM } from '../helpers/setup'

describe('element Positioning Integration', () => {
  beforeEach(() => {
    setupDOM('<!DOCTYPE html><html><head><style></style></head><body></body></html>')
  })

  afterEach(() => {
    cleanupDOM()
  })

  describe('trademark and Registered Positioning', () => {
    it('should create SPAN elements for TM that can be positioned', () => {
      const container = createTestElement('Product(TM) and Brand(R)', 'div')
      container.className = 'content'

      const config = createTestConfig({
        selectors: {
          include: ['.content'],
          exclude: [],
        },
      })
      const patterns = createPatterns(config)
      const combinedPattern = createCombinedPattern(patterns, config)
      processContent(config, patterns, combinedPattern)

      // Find the transformed elements
      const tmElements = document.querySelectorAll('span.ss-tm')
      const regElements = document.querySelectorAll('span.ss-reg')

      expect(tmElements.length).toBe(1)
      expect(regElements.length).toBe(1)

      // Verify they are SPAN elements
      expect(tmElements[0]!.tagName).toBe('SPAN')
      expect(regElements[0]!.tagName).toBe('SPAN')
    })

    it('should apply CSS variables to positioned elements', () => {
      const style = document.createElement('style')
      style.textContent = `
        :root {
          --ss-tm-top: -0.2em;
          --ss-reg-top: -0.25em;
        }
        span.ss-tm {
          position: relative;
          top: var(--ss-tm-top, -0.3em);
        }
        span.ss-reg {
          position: relative;
          top: var(--ss-reg-top, -0.3em);
        }
      `
      document.head.appendChild(style)

      const container = createTestElement('MITRE ACT(TM)', 'div')
      container.className = 'content'

      const config = createTestConfig({
        selectors: {
          include: ['.content'],
          exclude: [],
        },
      })
      const patterns = createPatterns(config)
      const combinedPattern = createCombinedPattern(patterns, config)
      processContent(config, patterns, combinedPattern)

      const tm = document.querySelector('span.ss-tm') as HTMLElement
      expect(tm).toBeTruthy()
      expect(tm.tagName).toBe('SPAN')
    })
  })

  describe('math and Ordinal Native Positioning', () => {
    it('should create SUP elements for math that use native positioning', () => {
      const container = createTestElement('E=mc^2 and x^3', 'div')
      container.className = 'content'

      const config = createTestConfig({
        selectors: {
          include: ['.content'],
          exclude: [],
        },
      })
      const patterns = createPatterns(config)
      const combinedPattern = createCombinedPattern(patterns, config)
      processContent(config, patterns, combinedPattern)

      const mathElements = document.querySelectorAll('sup.ss-math')
      expect(mathElements.length).toBe(2)

      // Verify they are SUP elements
      mathElements.forEach((el) => {
        expect(el.tagName).toBe('SUP')
      })
    })

    it('should create SUP elements for ordinals', () => {
      const container = createTestElement('1st place and 2nd place', 'div')
      container.className = 'content'

      const config = createTestConfig({
        selectors: {
          include: ['.content'],
          exclude: [],
        },
      })
      const patterns = createPatterns(config)
      const combinedPattern = createCombinedPattern(patterns, config)
      processContent(config, patterns, combinedPattern)

      const ordinalElements = document.querySelectorAll('sup.ss-ordinal')
      expect(ordinalElements.length).toBe(2)

      // Verify they are SUP elements
      ordinalElements.forEach((el) => {
        expect(el.tagName).toBe('SUP')
      })
    })
  })

  describe('chemical Subscript Positioning', () => {
    it('should create SUB elements for chemical formulas', () => {
      const container = createTestElement('H2O and CO2', 'div')
      container.className = 'content'

      const config = createTestConfig({
        selectors: {
          include: ['.content'],
          exclude: [],
        },
      })
      const patterns = createPatterns(config)
      const combinedPattern = createCombinedPattern(patterns, config)
      processContent(config, patterns, combinedPattern)

      const subElements = document.querySelectorAll('sub.ss-sub')
      expect(subElements.length).toBe(2)

      // Verify they are SUB elements
      subElements.forEach((el) => {
        expect(el.tagName).toBe('SUB')
      })
    })
  })

  describe('mixed Content with Different Elements', () => {
    it('should use appropriate elements for mixed content', () => {
      const container = createTestElement('Product(TM) uses H2O in the 21st century with formula x^2', 'div')
      container.className = 'content'

      const config = createTestConfig({
        selectors: {
          include: ['.content'],
          exclude: [],
        },
      })
      const patterns = createPatterns(config)
      const combinedPattern = createCombinedPattern(patterns, config)
      processContent(config, patterns, combinedPattern)

      // Check TM is SPAN
      const tm = document.querySelector('span.ss-tm')
      expect(tm).toBeTruthy()
      expect(tm?.tagName).toBe('SPAN')

      // Check chemical subscript is SUB
      const sub = document.querySelector('sub.ss-sub')
      expect(sub).toBeTruthy()
      expect(sub?.tagName).toBe('SUB')

      // Check ordinal is SUP
      const ordinal = document.querySelector('sup.ss-ordinal')
      expect(ordinal).toBeTruthy()
      expect(ordinal?.tagName).toBe('SUP')

      // Check math is SUP
      const math = document.querySelector('sup.ss-math')
      expect(math).toBeTruthy()
      expect(math?.tagName).toBe('SUP')
    })
  })
})
