import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { PatternMatchers, PatternExtractors } from '../src/runtime/smartscript/patterns'
import { processMatch } from '../src/runtime/smartscript/processor'

describe('Edge Cases and Corner Cases', () => {
  let dom: JSDOM
  let document: Document

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    document = dom.window.document
  })

  describe('Boundary Cases', () => {
    describe('Ordinal Edge Cases', () => {
      it('should handle large ordinal numbers', () => {
        const pattern = /\b(\d+)(st|nd|rd|th)\b/g
        expect('999999th'.match(pattern)).toEqual(['999999th'])
        expect('1000000th'.match(pattern)).toEqual(['1000000th'])
      })

      it('should handle special ordinal cases', () => {
        const pattern = /\b(\d+)(st|nd|rd|th)\b/g
        // 11th, 12th, 13th are special cases (not 11st, 12nd, 13rd)
        expect('11th'.match(pattern)).toEqual(['11th'])
        expect('12th'.match(pattern)).toEqual(['12th'])
        expect('13th'.match(pattern)).toEqual(['13th'])
        expect('111th'.match(pattern)).toEqual(['111th'])
        expect('112th'.match(pattern)).toEqual(['112th'])
        expect('113th'.match(pattern)).toEqual(['113th'])
      })

      it('should not match ordinals in the middle of words', () => {
        const pattern = /\b(\d+)(st|nd|rd|th)\b/g
        expect('test1st'.match(pattern)).toBeNull()
        expect('1sttest'.match(pattern)).toBeNull()
        expect('the1st'.match(pattern)).toBeNull()
      })

      it('should handle ordinals at sentence boundaries', () => {
        const pattern = /\b(\d+)(st|nd|rd|th)\b/g
        expect('1st.'.match(pattern)).toEqual(['1st'])
        expect('2nd,'.match(pattern)).toEqual(['2nd'])
        expect('3rd!'.match(pattern)).toEqual(['3rd'])
        expect('(4th)'.match(pattern)).toEqual(['4th'])
      })
    })

    describe('Symbol Edge Cases', () => {
      it('should handle multiple consecutive symbols', () => {
        const tmPattern = /\(TM\)/g
        const rPattern = /\(R\)/g
        expect('Product(TM)(TM)'.match(tmPattern)).toEqual(['(TM)', '(TM)'])
        expect('Brand(R)(R)(R)'.match(rPattern)).toEqual(['(R)', '(R)', '(R)'])
      })

      it('should handle symbols with no spacing', () => {
        const pattern = /\(TM\)|\(R\)|\(C\)/g
        expect('Product(TM)Another(R)Text(C)'.match(pattern)).toEqual(['(TM)', '(R)', '(C)'])
      })

      it('should not match partial patterns', () => {
        const tmPattern = /\(TM\)/g
        expect('(T M)'.match(tmPattern)).toBeNull()
        expect('(TM'.match(tmPattern)).toBeNull()
        expect('TM)'.match(tmPattern)).toBeNull()
        expect('((TM))'.match(tmPattern)).toEqual(['(TM)'])
      })

      it('should handle symbols at line breaks', () => {
        const pattern = /\(TM\)/g
        const text = 'Product\n(TM)\nText'
        expect(text.match(pattern)).toEqual(['(TM)'])
      })

      it('should avoid false positives with (R))', () => {
        const pattern = /\(R\)(?!\))/g
        expect('Brand(R)'.match(pattern)).toEqual(['(R)'])
        expect('Brand(R))'.match(pattern)).toBeNull() // Should not match (R))
      })
    })

    describe('Chemical Formula Edge Cases', () => {
      it('should handle single letter elements', () => {
        const pattern = /([A-Z][a-z]?)(\d+)/g
        expect('H2'.match(pattern)).toEqual(['H2'])
        expect('O2'.match(pattern)).toEqual(['O2'])
        expect('N2'.match(pattern)).toEqual(['N2'])
      })

      it('should handle two letter elements', () => {
        const pattern = /([A-Z][a-z]?)(\d+)/g
        expect('Ca2'.match(pattern)).toEqual(['Ca2'])
        expect('Mg3'.match(pattern)).toEqual(['Mg3'])
        expect('Na4'.match(pattern)).toEqual(['Na4'])
      })

      it('should handle large molecule counts', () => {
        const pattern = /([A-Z][a-z]?)(\d+)/g
        expect('H100'.match(pattern)).toEqual(['H100'])
        expect('O999'.match(pattern)).toEqual(['O999'])
      })

      it('should handle complex parentheses formulas', () => {
        const pattern = /\)(\d+)/g
        expect('Ca(OH)2'.match(pattern)).toEqual([')2'])
        expect('Al2(SO4)3'.match(pattern)).toEqual([')3'])
        expect('Mg3(PO4)2'.match(pattern)).toEqual([')2'])
      })

      it('should not match invalid chemical patterns', () => {
        const pattern = /([A-Z][a-z]?)(\d+)/g
        expect('lowercase2'.match(pattern)).toBeNull()
        // ABC2 would match C2 since C is a valid element
        // Use a better example with invalid element pattern
        expect('abc2'.match(pattern)).toBeNull() // All lowercase
        expect('2H2'.match(pattern)).toEqual(['H2']) // Number at start is ignored
      })
    })

    describe('Math Notation Edge Cases', () => {
      it('should handle various superscript patterns', () => {
        const pattern = /(?<![a-zA-Z])([a-zA-Z])\^(\d+|[a-zA-Z]|\{[^}]+\})/g
        expect('x^2'.match(pattern)).toEqual(['x^2'])
        expect('x^n'.match(pattern)).toEqual(['x^n'])
        expect('x^{10}'.match(pattern)).toEqual(['x^{10}'])
        expect('x^{n+1}'.match(pattern)).toEqual(['x^{n+1}'])
        expect('x^{2n}'.match(pattern)).toEqual(['x^{2n}'])
      })

      it('should handle various subscript patterns', () => {
        const pattern = /(?<![a-zA-Z])([a-zA-Z])_(\d+|[a-zA-Z]|\{[^}]+\})/g
        expect('x_1'.match(pattern)).toEqual(['x_1'])
        expect('x_n'.match(pattern)).toEqual(['x_n'])
        expect('x_{10}'.match(pattern)).toEqual(['x_{10}'])
        expect('x_{i+1}'.match(pattern)).toEqual(['x_{i+1}'])
        expect('x_{2n}'.match(pattern)).toEqual(['x_{2n}'])
      })

      it('should handle nested braces in math', () => {
        const pattern = /(?<![a-zA-Z])([a-zA-Z])\^(\{[^}]+\})/g
        expect('x^{a^2}'.match(pattern)).toEqual(['x^{a^2}'])
      })

      it('should not match incomplete patterns', () => {
        const pattern = /\^(\d+|\{[^}]+\})/g
        expect('x^'.match(pattern)).toBeNull()
        expect('x^{'.match(pattern)).toBeNull()
        expect('x^{unclosed'.match(pattern)).toBeNull()
      })
    })
  })

  describe('Unicode and Special Characters', () => {
    it('should handle text with existing unicode symbols', () => {
      const text = '™®©'
      expect(text.includes('™')).toBe(true)
      expect(text.includes('®')).toBe(true)
      expect(text.includes('©')).toBe(true)
    })

    it('should handle mixed ASCII and unicode', () => {
      const pattern = /™|\(TM\)/g
      expect('Product™ and Product(TM)'.match(pattern)).toEqual(['™', '(TM)'])
    })

    it('should handle text with emojis', () => {
      const pattern = /\(TM\)/g
      const text = '🚀 Product(TM) 🎉'
      expect(text.match(pattern)).toEqual(['(TM)'])
    })

    it('should handle text with special whitespace', () => {
      const pattern = /\(TM\)/g
      const nbsp = '\u00A0' // Non-breaking space
      const text = `Product${nbsp}(TM)`
      expect(text.match(pattern)).toEqual(['(TM)'])
    })
  })

  describe('Performance Edge Cases', () => {
    it('should handle very long strings', () => {
      const pattern = /\(TM\)/g
      const longText = 'Start ' + 'x'.repeat(10000) + ' Product(TM) ' + 'y'.repeat(10000) + ' End'
      expect(longText.match(pattern)).toEqual(['(TM)'])
    })

    it('should handle many matches in one string', () => {
      const pattern = /\b(\d+)(st|nd|rd|th)\b/g
      const text = Array.from({ length: 100 }, (_, i) => `${i + 1}th`).join(' ')
      const matches = text.match(pattern)
      expect(matches).toHaveLength(100)
    })

    it('should handle deeply nested DOM structures', () => {
      let current = document.body
      for (let i = 0; i < 100; i++) {
        const div = document.createElement('div')
        current.appendChild(div)
        current = div
      }
      current.textContent = 'Product(TM)'
      expect(current.textContent).toBe('Product(TM)')
    })
  })

  describe('Mixed Content Edge Cases', () => {
    it('should handle multiple pattern types in one text', () => {
      const text = 'Product(TM) is 1st with H2O and x^2'
      const tmPattern = /\(TM\)/g
      const ordPattern = /\b(\d+)(st|nd|rd|th)\b/g
      const chemPattern = /([A-Z][a-z]?)(\d+)/g
      const mathPattern = /\^(\d+)/g
      
      expect(text.match(tmPattern)).toEqual(['(TM)'])
      expect(text.match(ordPattern)).toEqual(['1st'])
      expect(text.match(chemPattern)).toEqual(['H2'])
      expect(text.match(mathPattern)).toEqual(['^2'])
    })

    it('should handle overlapping pattern possibilities', () => {
      // R could be element or registered mark
      const rPattern = /\(R\)/g
      const chemPattern = /\bR\d+/g
      
      const text1 = 'Brand(R) formula'
      const text2 = 'R2 resistance'
      
      expect(text1.match(rPattern)).toEqual(['(R)'])
      expect(text2.match(chemPattern)).toEqual(['R2'])
    })

    it('should handle patterns at word boundaries correctly', () => {
      const tmPattern = /\bTM\b/g
      expect('TM'.match(tmPattern)).toEqual(['TM'])
      expect('HTML'.match(tmPattern)).toBeNull()
      expect('TMNT'.match(tmPattern)).toBeNull()
      expect('ATM'.match(tmPattern)).toBeNull()
    })
  })

  describe('HTML Context Edge Cases', () => {
    it('should handle text in different HTML contexts', () => {
      const contexts = [
        document.createElement('p'),
        document.createElement('span'),
        document.createElement('div'),
        document.createElement('h1'),
        document.createElement('li'),
        document.createElement('td'),
      ]
      
      contexts.forEach(element => {
        element.textContent = 'Product(TM)'
        expect(element.textContent).toBe('Product(TM)')
      })
    })

    it('should handle text with HTML entities', () => {
      const div = document.createElement('div')
      div.innerHTML = 'Product&trade; and Product(TM)'
      expect(div.textContent).toBe('Product™ and Product(TM)')
    })

    it('should handle contenteditable elements', () => {
      const div = document.createElement('div')
      div.setAttribute('contenteditable', 'true')
      div.textContent = 'Product(TM)'
      expect(div.textContent).toBe('Product(TM)')
      expect(div.getAttribute('contenteditable')).toBe('true')
    })
  })

  describe('Regex State Management', () => {
    it('should handle regex with global flag correctly', () => {
      const pattern = /\(TM\)/g
      const text = 'Product(TM) Another(TM)'
      
      // First execution
      let match1 = pattern.exec(text)
      expect(match1?.[0]).toBe('(TM)')
      expect(pattern.lastIndex).toBe(11)
      
      // Second execution continues from lastIndex
      let match2 = pattern.exec(text)
      expect(match2?.[0]).toBe('(TM)')
      expect(pattern.lastIndex).toBe(23)
      
      // Third execution returns null and resets
      let match3 = pattern.exec(text)
      expect(match3).toBeNull()
      expect(pattern.lastIndex).toBe(0)
      
      // Fourth execution starts over
      let match4 = pattern.exec(text)
      expect(match4?.[0]).toBe('(TM)')
    })

    it('should reset lastIndex when needed', () => {
      const pattern = /\(TM\)/g
      const text1 = 'Product(TM)'
      const text2 = 'Another(TM)'
      
      // Test on first string
      pattern.lastIndex = 0
      expect(pattern.test(text1)).toBe(true)
      
      // Reset before testing second string
      pattern.lastIndex = 0
      expect(pattern.test(text2)).toBe(true)
    })
  })

  describe('Error Recovery Cases', () => {
    it('should handle null and undefined gracefully', () => {
      expect(PatternMatchers.isTrademark('')).toBe(false)
      expect(PatternExtractors.extractOrdinal('')).toBeNull()
    })

    it('should handle empty strings', () => {
      const pattern = /\(TM\)/g
      expect(''.match(pattern)).toBeNull()
    })

    it('should handle whitespace-only strings', () => {
      const pattern = /\(TM\)/g
      expect('   \n\t  '.match(pattern)).toBeNull()
    })

    it('should handle malformed patterns gracefully', () => {
      const text = '(TM(TM)TM)'
      const pattern = /\(TM\)/g
      expect(text.match(pattern)).toEqual(['(TM)'])
    })
  })

  describe('Internationalization Edge Cases', () => {
    it('should handle non-English text with patterns', () => {
      const pattern = /\(TM\)/g
      const texts = [
        'Produit(TM) français',
        'Produkt(TM) deutsch',
        '製品(TM)日本語',
        'Продукт(TM) русский',
        '产品(TM)中文',
      ]
      
      texts.forEach(text => {
        expect(text.match(pattern)).toEqual(['(TM)'])
      })
    })

    it('should handle RTL text', () => {
      const pattern = /\(TM\)/g
      const text = 'מוצר(TM)עברית'
      expect(text.match(pattern)).toEqual(['(TM)'])
    })
  })

  describe('Processing Function Edge Cases', () => {
    it('should handle processMatch with edge inputs', () => {
      // Very long input
      const longInput = 'TM'.repeat(1000)
      const result1 = processMatch(longInput)
      expect(result1.modified).toBeDefined()
      
      // Unicode input
      const unicodeResult = processMatch('™')
      expect(unicodeResult.modified).toBe(true)
      expect(unicodeResult.parts[0].content).toBe('™')
      
      // Mixed case that shouldn't match
      const noMatch = processMatch('random text')
      expect(noMatch.modified).toBe(false)
    })

    it('should handle special ordinal processing', () => {
      const ordinals = ['1st', '2nd', '3rd', '21st', '22nd', '23rd', '31st', '101st']
      ordinals.forEach(ord => {
        const result = processMatch(ord)
        expect(result.modified).toBe(true)
        expect(result.parts).toHaveLength(2) // number + suffix
      })
    })
  })
})