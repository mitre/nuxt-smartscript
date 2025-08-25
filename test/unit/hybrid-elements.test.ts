/**
 * Tests for hybrid SUP/SPAN element approach
 * Ensures TM/R use SPAN for positioning while math/ordinals use semantic SUP/SUB
 */

import { JSDOM } from 'jsdom'
import { beforeEach, describe, expect, it } from 'vitest'
import { createSubscriptElement, createSuperscriptElement } from '../../src/runtime/smartscript/dom'

describe('hybrid Element Creation', () => {
  beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    global.document = dom.window.document
  })
  describe('superscript Elements', () => {
    it('should use SPAN for trademark symbols', () => {
      const tm = createSuperscriptElement('TM', 'trademark')
      expect(tm.tagName).toBe('SPAN')
      expect(tm.className).toContain('ss-sup')
      expect(tm.className).toContain('ss-tm')
      expect(tm.getAttribute('aria-label')).toBe('trademark')
    })

    it('should use SPAN for registered symbols', () => {
      const reg = createSuperscriptElement('R', 'registered')
      expect(reg.tagName).toBe('SPAN')
      expect(reg.className).toContain('ss-sup')
      expect(reg.className).toContain('ss-reg')
      expect(reg.getAttribute('aria-label')).toBe('registered')
    })

    it('should use SUP for ordinals', () => {
      const ord = createSuperscriptElement('st', 'ordinal')
      expect(ord.tagName).toBe('SUP')
      expect(ord.className).toContain('ss-sup')
      expect(ord.className).toContain('ss-ordinal')
      expect(ord.getAttribute('aria-label')).toBe('st')
    })

    it('should use SUP for math superscripts', () => {
      const math = createSuperscriptElement('2', 'math')
      expect(math.tagName).toBe('SUP')
      expect(math.className).toContain('ss-sup')
      expect(math.className).toContain('ss-math')
      expect(math.getAttribute('aria-label')).toBe('superscript 2')
    })

    it('should use SUP for generic superscripts', () => {
      const generic = createSuperscriptElement('x', 'generic')
      expect(generic.tagName).toBe('SUP')
      expect(generic.className).toBe('ss-sup')
      expect(generic.getAttribute('aria-label')).toBe('superscript x')
    })
  })

  describe('subscript Elements', () => {
    it('should always use SUB for subscripts', () => {
      const chemical = createSubscriptElement('2', 'chemical')
      expect(chemical.tagName).toBe('SUB')
      expect(chemical.className).toBe('ss-sub')
      expect(chemical.getAttribute('aria-label')).toBe('2')
    })

    it('should use SUB for math subscripts', () => {
      const math = createSubscriptElement('n', 'math')
      expect(math.tagName).toBe('SUB')
      expect(math.className).toBe('ss-sub')
      expect(math.getAttribute('aria-label')).toBe('subscript n')
    })

    it('should use SUB for generic subscripts', () => {
      const generic = createSubscriptElement('x', 'generic')
      expect(generic.tagName).toBe('SUB')
      expect(generic.className).toBe('ss-sub')
      expect(generic.getAttribute('aria-label')).toBe('subscript x')
    })
  })

  describe('semantic HTML Preservation', () => {
    it('should preserve semantic meaning for math expressions', () => {
      const math = createSuperscriptElement('2', 'math')
      expect(math.tagName).toBe('SUP')
      // Screen readers will announce this as "superscript 2"
      expect(math.getAttribute('aria-label')).toBe('superscript 2')
    })

    it('should preserve semantic meaning for chemical formulas', () => {
      const chem = createSubscriptElement('2', 'chemical')
      expect(chem.tagName).toBe('SUB')
      // For simple digits in chemistry, just the number is clearer
      expect(chem.getAttribute('aria-label')).toBe('2')
    })

    it('should provide clear labels for trademark symbols', () => {
      const tm = createSuperscriptElement('TM', 'trademark')
      expect(tm.getAttribute('aria-label')).toBe('trademark')

      const reg = createSuperscriptElement('R', 'registered')
      expect(reg.getAttribute('aria-label')).toBe('registered')
    })
  })
})
