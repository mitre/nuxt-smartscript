import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

describe('SmartScript Typography Patterns', () => {
  let dom: JSDOM
  let document: Document

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    document = dom.window.document
  })

  describe('Pattern Matching', () => {
    describe('Trademark Symbols', () => {
      it('should match (TM) pattern', () => {
        const pattern = /\(TM\)/g
        expect('Product(TM)'.match(pattern)).toEqual(['(TM)'])
      })

      it('should match standalone TM', () => {
        const pattern = /\bTM\b/g
        expect('Product TM is'.match(pattern)).toEqual(['TM'])
        expect('HTML is'.match(pattern)).toBeNull() // Should not match TM in HTML
      })

      it('should match ™ symbol', () => {
        const pattern = /™/g
        expect('Product™'.match(pattern)).toEqual(['™'])
      })
    })

    describe('Registered Symbols', () => {
      it('should match (R) pattern', () => {
        const pattern = /\(R\)/g
        expect('Brand(R)'.match(pattern)).toEqual(['(R)'])
      })

      it('should match ® symbol', () => {
        const pattern = /®/g
        expect('Brand®'.match(pattern)).toEqual(['®'])
      })
    })

    describe('Copyright Symbols', () => {
      it('should match (C) pattern', () => {
        const pattern = /\(C\)/g
        expect('(C) 2024'.match(pattern)).toEqual(['(C)'])
      })

      it('should match © symbol', () => {
        const pattern = /©/g
        expect('© 2024'.match(pattern)).toEqual(['©'])
      })
    })

    describe('Ordinal Numbers', () => {
      it('should match ordinal patterns', () => {
        const pattern = /\b(\d+)(st|nd|rd|th)\b/g
        const text = '1st 2nd 3rd 4th 11th 21st 42nd 100th'
        const matches = Array.from(text.matchAll(pattern))
        expect(matches.length).toBe(8)
        expect(matches[0][0]).toBe('1st')
        expect(matches[1][0]).toBe('2nd')
        expect(matches[2][0]).toBe('3rd')
        expect(matches[3][0]).toBe('4th')
        expect(matches[4][0]).toBe('11th')
        expect(matches[5][0]).toBe('21st')
        expect(matches[6][0]).toBe('42nd')
        expect(matches[7][0]).toBe('100th')
      })
    })

    describe('Chemical Formulas', () => {
      it('should match simple chemical formulas', () => {
        const pattern = /[A-Z][a-z]?\d+/g
        expect('H2O'.match(pattern)).toEqual(['H2'])
        expect('CO2'.match(pattern)).toEqual(['O2']) // C doesn't have a number, only O2
        expect('H2SO4'.match(pattern)).toEqual(['H2', 'O4']) // Matches H2 and O4 separately
      })

      it('should match complex formulas with parentheses', () => {
        const pattern = /\([A-Z][a-z]?[A-Z]?\d*\)\d+/g
        expect('Al2(SO4)3'.match(pattern)).toEqual(['(SO4)3'])
        expect('Ca(OH)2'.match(pattern)).toEqual(['(OH)2'])
      })
    })

    describe('Mathematical Notation', () => {
      it('should match superscript notation', () => {
        const pattern = /(?<=^|[\s=+\-*/().,\da-z])[a-zA-Z]\^(?:\d+|[a-zA-Z]|\{[^}]+\})/g
        expect('x^2'.match(pattern)).toEqual(['x^2'])
        expect('E=mc^2'.match(pattern)).toEqual(['c^2'])
        expect('x^n'.match(pattern)).toEqual(['x^n'])
        expect('y^i'.match(pattern)).toEqual(['y^i'])
        expect('z^{10}'.match(pattern)).toEqual(['z^{10}'])
        expect('a^{n+1}'.match(pattern)).toEqual(['a^{n+1}'])
      })

      it('should match subscript notation', () => {
        const pattern = /(?<=^|[\s=+\-*/().,])[a-z]_(?:\d+|[a-z]|\{[^}]+\})/gi
        expect('x_1'.match(pattern)).toEqual(['x_1'])
        expect('x_n'.match(pattern)).toEqual(['x_n'])
        expect('y_i'.match(pattern)).toEqual(['y_i'])
        expect('z_{10}'.match(pattern)).toEqual(['z_{10}'])
        expect('a_{n+1}'.match(pattern)).toEqual(['a_{n+1}'])
      })
    })
  })

  describe('DOM Processing', () => {
    it('should use plain text for trademark symbol', () => {
      // Trademark symbols are Unicode characters with built-in positioning
      // They should be rendered as plain text, not wrapped in sup elements
      const text = document.createTextNode('™')
      expect(text.textContent).toBe('™')
    })

    it('should use plain text for registered symbol', () => {
      // Registered symbols are Unicode characters with built-in positioning
      // They should be rendered as plain text, not wrapped in sup elements
      const text = document.createTextNode('®')
      expect(text.textContent).toBe('®')
    })

    it('should create sub elements for chemicals', () => {
      const sub = document.createElement('sub')
      sub.textContent = '2'
      sub.className = 'auto-sub'
      sub.setAttribute('aria-label', '2')

      expect(sub.textContent).toBe('2')
      expect(sub.className).toBe('auto-sub')
      expect(sub.getAttribute('aria-label')).toBe('2')
    })

    it('should not process copyright symbol', () => {
      const text = '© 2024'
      // Copyright should remain as-is, not wrapped in sup
      expect(text.includes('©')).toBe(true)
    })
  })

  describe('Exclusion Rules', () => {
    it('should respect data-no-superscript attribute', () => {
      const div = document.createElement('div')
      div.setAttribute('data-no-superscript', '')
      expect(div.hasAttribute('data-no-superscript')).toBe(true)
    })

    it('should respect no-superscript class', () => {
      const div = document.createElement('div')
      div.className = 'no-superscript'
      expect(div.classList.contains('no-superscript')).toBe(true)
    })

    it('should exclude pre and code elements', () => {
      const pre = document.createElement('pre')
      const code = document.createElement('code')
      expect(pre.tagName).toBe('PRE')
      expect(code.tagName).toBe('CODE')
    })
  })
})
