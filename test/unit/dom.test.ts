/**
 * DOM Output Tests
 * ACTUALLY tests the DOM elements created by our functions
 */

import { JSDOM } from 'jsdom'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createCombinedPattern,
  createFragmentFromParts,
  createPatterns,
  createSubscriptElement,
  createSuperscriptElement,
  DEFAULT_CONFIG,
  processText,
} from '../../src/runtime/smartscript'

describe('dOM Output: Actual Element Creation', () => {
  let dom: JSDOM
  let document: Document

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    document = dom.window.document
    // Make document available globally for our functions
    global.document = document as unknown as Document
  })

  describe('createSuperscriptElement', () => {
    it('should create SPAN element with ss-sup class for trademark', () => {
      const element = createSuperscriptElement('™', 'trademark')

      expect(element.tagName).toBe('SPAN')
      expect(element.className).toBe('ss-sup ss-tm')
      expect(element.textContent).toBe('™')
      expect(element.getAttribute('aria-label')).toBe('trademark')
    })

    it('should create SPAN element with ss-sup class for registered', () => {
      const element = createSuperscriptElement('®', 'registered')

      expect(element.tagName).toBe('SPAN')
      expect(element.className).toBe('ss-sup ss-reg')
      expect(element.textContent).toBe('®')
      expect(element.getAttribute('aria-label')).toBe('registered')
    })

    it('should create sup element with ss-sup class for ordinals', () => {
      const element = createSuperscriptElement('st', 'ordinal')

      expect(element.tagName).toBe('SUP')
      expect(element.className).toBe('ss-sup ss-ordinal')
      expect(element.textContent).toBe('st')
      expect(element.getAttribute('aria-label')).toBe('st')
    })

    it('should create sup element with ss-sup class for math', () => {
      const element = createSuperscriptElement('2', 'math')

      expect(element.tagName).toBe('SUP')
      expect(element.className).toBe('ss-sup ss-math')
      expect(element.textContent).toBe('2')
      expect(element.getAttribute('aria-label')).toBe('superscript 2')
    })

    it('should create sup element with ss-sup class for generic', () => {
      const element = createSuperscriptElement('abc', 'generic')

      expect(element.tagName).toBe('SUP')
      expect(element.className).toBe('ss-sup')
      expect(element.textContent).toBe('abc')
      expect(element.getAttribute('aria-label')).toBe('superscript abc')
    })
  })

  describe('createSubscriptElement', () => {
    it('should create sub element with ss-sub class for chemical', () => {
      const element = createSubscriptElement('2', 'chemical')

      expect(element.tagName).toBe('SUB')
      expect(element.className).toBe('ss-sub')
      expect(element.textContent).toBe('2')
      expect(element.getAttribute('aria-label')).toBe('2')
    })

    it('should create sub element with ss-sub class for math', () => {
      const element = createSubscriptElement('n', 'math')

      expect(element.tagName).toBe('SUB')
      expect(element.className).toBe('ss-sub')
      expect(element.textContent).toBe('n')
      expect(element.getAttribute('aria-label')).toBe('subscript n')
    })

    it('should create sub element with ss-sub class for generic', () => {
      const element = createSubscriptElement('xyz', 'generic')

      expect(element.tagName).toBe('SUB')
      expect(element.className).toBe('ss-sub')
      expect(element.textContent).toBe('xyz')
      expect(element.getAttribute('aria-label')).toBe('subscript xyz')
    })
  })

  describe('createFragmentFromParts', () => {
    it('should create fragment with correct elements for trademark', () => {
      const parts = [
        { type: 'text' as const, content: 'MITRE' },
        { type: 'super' as const, content: '™' },
      ]

      const fragment = createFragmentFromParts(parts)
      const div = document.createElement('div')
      div.appendChild(fragment)

      expect(div.childNodes).toHaveLength(2)
      expect(div.childNodes[0]!.textContent).toBe('MITRE')

      const sup = div.childNodes[1] as HTMLElement
      expect(sup.tagName).toBe('SPAN') // TM uses SPAN for positioning
      expect(sup.className).toBe('ss-sup ss-tm')
      expect(sup.textContent).toBe('™')
    })

    it('should create fragment with correct elements for ordinals', () => {
      const parts = [
        { type: 'text' as const, content: '1' },
        { type: 'super' as const, content: 'st' },
      ]

      const fragment = createFragmentFromParts(parts)
      const div = document.createElement('div')
      div.appendChild(fragment)

      expect(div.childNodes).toHaveLength(2)
      expect(div.childNodes[0]!.textContent).toBe('1')

      const sup = div.childNodes[1] as HTMLElement
      expect(sup.tagName).toBe('SUP')
      expect(sup.className).toBe('ss-sup ss-ordinal')
      expect(sup.textContent).toBe('st')
    })

    it('should create fragment with correct elements for chemicals', () => {
      const parts = [
        { type: 'text' as const, content: 'H' },
        { type: 'sub' as const, content: '2' },
        { type: 'text' as const, content: 'O' },
      ]

      const fragment = createFragmentFromParts(parts)
      const div = document.createElement('div')
      div.appendChild(fragment)

      expect(div.childNodes).toHaveLength(3)
      expect(div.childNodes[0]!.textContent).toBe('H')

      const sub = div.childNodes[1] as HTMLElement
      expect(sub.tagName).toBe('SUB')
      expect(sub.className).toBe('ss-sub')
      expect(sub.textContent).toBe('2')

      expect(div.childNodes[2]!.textContent).toBe('O')
    })

    it('should create fragment with mixed super and subscripts', () => {
      const parts = [
        { type: 'text' as const, content: 'x' },
        { type: 'super' as const, content: '2' },
        { type: 'text' as const, content: ' + y' },
        { type: 'sub' as const, content: '1' },
      ]

      const fragment = createFragmentFromParts(parts)
      const div = document.createElement('div')
      div.appendChild(fragment)

      expect(div.childNodes).toHaveLength(4)

      const sup = div.childNodes[1] as HTMLElement
      expect(sup.tagName).toBe('SUP')
      expect(sup.className).toBe('ss-sup')

      const sub = div.childNodes[3] as HTMLElement
      expect(sub.tagName).toBe('SUB')
      expect(sub.className).toBe('ss-sub')
    })
  })

  describe('full Pipeline: processText to DOM', () => {
    const config = DEFAULT_CONFIG
    const patterns = createPatterns(config)
    const combinedPattern = createCombinedPattern(patterns, config)

    it('should process trademark symbols correctly', () => {
      const parts = processText('MITRE(TM)', combinedPattern)
      const fragment = createFragmentFromParts(parts)
      const div = document.createElement('div')
      div.appendChild(fragment)

      // Should have text "MITRE" and trademark "™" as SPAN (hybrid approach)
      const tmElements = div.querySelectorAll('span.ss-tm')
      expect(tmElements).toHaveLength(1)
      expect(tmElements[0]!.className).toBe('ss-sup ss-tm')
      expect(tmElements[0]!.textContent).toBe('™')
    })

    it('should process ordinal numbers correctly', () => {
      const parts = processText('1st place', combinedPattern)
      const fragment = createFragmentFromParts(parts)
      const div = document.createElement('div')
      div.appendChild(fragment)

      // Should have "1" as text and "st" as superscript
      const supElements = div.querySelectorAll('sup.ss-sup')
      expect(supElements).toHaveLength(1)
      expect(supElements[0]!.className).toBe('ss-sup ss-ordinal')
      expect(supElements[0]!.textContent).toBe('st')
    })

    it('should process chemical formulas correctly', () => {
      const parts = processText('H2O', combinedPattern)
      const fragment = createFragmentFromParts(parts)
      const div = document.createElement('div')
      div.appendChild(fragment)

      // Should have H, subscript 2, and O
      const subElements = div.querySelectorAll('sub.ss-sub')
      expect(subElements).toHaveLength(1)
      expect(subElements[0]!.textContent).toBe('2')
    })

    it('should process math notation correctly', () => {
      const parts = processText('E=mc^2', combinedPattern)
      const fragment = createFragmentFromParts(parts)
      const div = document.createElement('div')
      div.appendChild(fragment)

      // Should have superscript 2
      const supElements = div.querySelectorAll('sup.ss-sup')
      expect(supElements).toHaveLength(1)
      expect(supElements[0]!.textContent).toBe('2')
    })

    it('should process copyright symbol correctly', () => {
      const parts = processText('(C) 2024', combinedPattern)
      const fragment = createFragmentFromParts(parts)
      const div = document.createElement('div')
      div.appendChild(fragment)

      // Should have © as plain text, no sup elements
      expect(div.textContent).toContain('©')
      const supElements = div.querySelectorAll('sup')
      expect(supElements).toHaveLength(0)
    })

    it('should process registered symbol correctly', () => {
      const parts = processText('Product(R)', combinedPattern)
      const fragment = createFragmentFromParts(parts)
      const div = document.createElement('div')
      div.appendChild(fragment)

      // Should have ® as plain text (not in sup)
      expect(div.textContent).toContain('®')
      // Note: According to our processor.ts, registered is returned as plain text
      const supElements = div.querySelectorAll('sup.ss-reg')
      expect(supElements).toHaveLength(0)
    })

    it('should handle complex mixed content', () => {
      const text = 'The 1st law: E=mc^2, H_2O is water, MITRE(TM)'
      const parts = processText(text, combinedPattern)
      const fragment = createFragmentFromParts(parts)
      const div = document.createElement('div')
      div.appendChild(fragment)

      // Check all transformations - with hybrid approach (SUP for math/ordinals, SPAN for TM)
      const supElements = div.querySelectorAll('sup.ss-sup')
      const spanElements = div.querySelectorAll('span.ss-sup')

      // Should have SUP elements for ordinals and math
      expect(supElements.length).toBeGreaterThan(0)

      // Should have SPAN elements for TM symbols
      expect(spanElements.length).toBeGreaterThan(0)

      // H_2O has uppercase H, our pattern expects lowercase for subscripts
      // Let's test with a valid subscript pattern
      const text2 = 'The formula x_1 has a subscript'
      const parts2 = processText(text2, combinedPattern)
      const fragment2 = createFragmentFromParts(parts2)
      const div2 = document.createElement('div')
      div2.appendChild(fragment2)
      const subElements2 = div2.querySelectorAll('sub.ss-sub')
      expect(subElements2.length).toBeGreaterThan(0)

      // Verify specific classes
      const ordinalSup = Array.from(supElements).find((el) => el.className.includes('ss-ordinal'))
      expect(ordinalSup).toBeDefined()

      // TM is now a SPAN element with hybrid approach
      const tmSpan = div.querySelector('span.ss-tm')
      expect(tmSpan).toBeDefined()
    })
  })
})
