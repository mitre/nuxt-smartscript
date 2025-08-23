/**
 * Pattern/Regex Tests
 * Tests that our regex patterns match the correct strings
 */

import { describe, it, expect } from 'vitest'
import {
  createPatterns,
  PatternMatchers,
  DEFAULT_CONFIG,
} from '../../src/runtime/smartscript'

describe('Pattern Matching', () => {
  const patterns = createPatterns(DEFAULT_CONFIG)

  describe('Trademark Patterns', () => {
    it('should match (TM) pattern', () => {
      const matches = '(TM)'.match(patterns.trademark)
      expect(matches).toContain('(TM)')
    })

    it('should match standalone TM', () => {
      const matches = 'Product TM'.match(patterns.trademark)
      expect(matches).toContain('TM')
    })

    it('should match ™ symbol', () => {
      const matches = 'Product™'.match(patterns.trademark)
      expect(matches).toContain('™')
    })

    it('should identify trademark patterns', () => {
      expect(PatternMatchers.isTrademark('™')).toBe(true)
      expect(PatternMatchers.isTrademark('(TM)')).toBe(true)
      expect(PatternMatchers.isTrademark('TM')).toBe(true)
      expect(PatternMatchers.isTrademark('tm')).toBe(false)
    })

    it('should handle multiple consecutive symbols', () => {
      expect('Product(TM)(TM)'.match(patterns.trademark)).toEqual(['(TM)', '(TM)'])
      expect('Text™™™'.match(patterns.trademark)).toEqual(['™', '™', '™'])
    })

    it('should handle symbols with no spacing', () => {
      expect('Product(TM)Another'.match(patterns.trademark)).toContain('(TM)')
      expect('First™Second'.match(patterns.trademark)).toContain('™')
    })

    it('should not match partial patterns', () => {
      expect('(T M)'.match(patterns.trademark)).toBeNull()
      expect('(TM'.match(patterns.trademark)).toContain('TM') // TM is valid standalone even with incomplete (
      expect('TM)'.match(patterns.trademark)).toContain('TM') // TM is valid standalone
      expect('((TM))'.match(patterns.trademark)).toContain('(TM)')
    })

    it('should handle symbols at line breaks', () => {
      const text = 'Product\n(TM)\nText'
      expect(text.match(patterns.trademark)).toContain('(TM)')
    })
  })

  describe('Registered Patterns', () => {
    it('should match (R) pattern', () => {
      const matches = '(R)'.match(patterns.registered)
      expect(matches).toContain('(R)')
    })

    it('should match ® symbol', () => {
      const matches = 'Product®'.match(patterns.registered)
      expect(matches).toContain('®')
    })

    it('should NOT match (R)) double parenthesis', () => {
      const matches = '(R))'.match(patterns.registered)
      expect(matches).toBe(null)
    })

    it('should identify registered patterns', () => {
      expect(PatternMatchers.isRegistered('®')).toBe(true)
      expect(PatternMatchers.isRegistered('(R)')).toBe(true)
      expect(PatternMatchers.isRegistered('(r)')).toBe(false)
    })

    it('should handle multiple consecutive registered symbols', () => {
      expect('Brand(R)(R)(R)'.match(patterns.registered)).toEqual(['(R)', '(R)', '(R)'])
    })
  })

  describe('Copyright Patterns', () => {
    it('should match (C) pattern', () => {
      const matches = '(C)'.match(patterns.copyright)
      expect(matches).toContain('(C)')
    })

    it('should match © symbol', () => {
      const matches = '© 2024'.match(patterns.copyright)
      expect(matches).toContain('©')
    })

    it('should NOT match (C)) double parenthesis', () => {
      const matches = '(C))'.match(patterns.copyright)
      expect(matches).toBe(null)
    })

    it('should identify copyright patterns', () => {
      expect(PatternMatchers.isCopyright('©')).toBe(true)
      expect(PatternMatchers.isCopyright('(C)')).toBe(true)
      expect(PatternMatchers.isCopyright('(c)')).toBe(false)
    })
  })

  describe('Ordinal Patterns', () => {
    it('should match ordinal patterns', () => {
      expect('1st'.match(patterns.ordinals)).toEqual(['1st'])
      expect('2nd'.match(patterns.ordinals)).toEqual(['2nd'])
      expect('3rd'.match(patterns.ordinals)).toEqual(['3rd'])
      expect('4th'.match(patterns.ordinals)).toEqual(['4th'])
      expect('21st'.match(patterns.ordinals)).toEqual(['21st'])
      expect('22nd'.match(patterns.ordinals)).toEqual(['22nd'])
      expect('23rd'.match(patterns.ordinals)).toEqual(['23rd'])
      expect('100th'.match(patterns.ordinals)).toEqual(['100th'])
    })

    it('should handle special ordinal cases (11th, 12th, 13th)', () => {
      expect('11th'.match(patterns.ordinals)).toEqual(['11th'])
      expect('12th'.match(patterns.ordinals)).toEqual(['12th'])
      expect('13th'.match(patterns.ordinals)).toEqual(['13th'])
      expect('111th'.match(patterns.ordinals)).toEqual(['111th'])
      expect('211th'.match(patterns.ordinals)).toEqual(['211th'])
    })

    it('should match ordinal patterns regardless of validity', () => {
      // The pattern matches any number+suffix, validation happens in processMatch
      expect('1nd'.match(patterns.ordinals)).toEqual(['1nd']) // Matches but won't transform
      expect('2st'.match(patterns.ordinals)).toEqual(['2st']) // Matches but won't transform
      expect('3st'.match(patterns.ordinals)).toEqual(['3st']) // Matches but won't transform
    })

    it('should identify ordinal patterns', () => {
      expect(PatternMatchers.isOrdinal('1st')).toBe(true)
      expect(PatternMatchers.isOrdinal('21st')).toBe(true)
      expect(PatternMatchers.isOrdinal('1nd')).toBe(true) // Pattern matches, validation in processMatch
      expect(PatternMatchers.isOrdinal('st')).toBe(false) // No number, doesn't match
    })

    it('should handle large ordinal numbers', () => {
      expect('999999th'.match(patterns.ordinals)).toEqual(['999999th'])
      expect('1000000th'.match(patterns.ordinals)).toEqual(['1000000th'])
    })

    it('should not match ordinals in the middle of words', () => {
      expect('test1st'.match(patterns.ordinals)).toBeNull()
      expect('1sttest'.match(patterns.ordinals)).toBeNull()
      expect('the1st'.match(patterns.ordinals)).toBeNull()
    })

    it('should handle ordinals at sentence boundaries', () => {
      expect('1st.'.match(patterns.ordinals)).toEqual(['1st'])
      expect('2nd,'.match(patterns.ordinals)).toEqual(['2nd'])
      expect('3rd!'.match(patterns.ordinals)).toEqual(['3rd'])
      expect('(4th)'.match(patterns.ordinals)).toEqual(['4th'])
    })
  })

  describe('Chemical Patterns', () => {
    it('should match simple chemical formulas', () => {
      const h2 = 'H2'.match(patterns.chemicals)
      expect(h2).toContain('H2')

      const o2 = 'O2'.match(patterns.chemicals)
      expect(o2).toContain('O2')

      const co2 = 'CO2'.match(patterns.chemicals)
      // Note: CO2 matches as two parts: C and O2
      expect(co2).toContain('O2')
    })

    it('should match complex formulas with parentheses', () => {
      const formula = 'Ca(OH)2'.match(patterns.chemicals)
      expect(formula).toContain(')2')

      const complex = 'Al2(SO4)3'.match(patterns.chemicals)
      expect(complex).toContain('Al2')
      expect(complex).toContain('O4')
      expect(complex).toContain(')3')
    })

    it('should identify chemical patterns', () => {
      expect(PatternMatchers.isChemicalElement('H2')).toBe(true)
      expect(PatternMatchers.isChemicalElement('Ca2')).toBe(true)
      expect(PatternMatchers.isChemicalElement('CO2')).toBe(false) // Two capitals
      expect(PatternMatchers.isChemicalParentheses(')2')).toBe(true)
      expect(PatternMatchers.isChemicalParentheses('2)')).toBe(false)
    })

    it('should handle single letter elements', () => {
      expect('H2'.match(patterns.chemicals)).toContain('H2')
      expect('O2'.match(patterns.chemicals)).toContain('O2')
      expect('N2'.match(patterns.chemicals)).toContain('N2')
    })

    it('should handle two letter elements', () => {
      expect('Ca2'.match(patterns.chemicals)).toContain('Ca2')
      expect('Mg3'.match(patterns.chemicals)).toContain('Mg3')
      expect('Na4'.match(patterns.chemicals)).toContain('Na4')
    })

    it('should handle large molecule counts', () => {
      expect('H100'.match(patterns.chemicals)).toContain('H100')
      expect('O999'.match(patterns.chemicals)).toContain('O999')
    })

    it('should not match invalid chemical patterns', () => {
      expect('lowercase2'.match(patterns.chemicals)).toBeNull()
      expect('abc2'.match(patterns.chemicals)).toBeNull() // All lowercase
      expect('2H2'.match(patterns.chemicals)).toContain('H2') // Number at start is ignored
    })
  })

  describe('Math Superscript Patterns', () => {
    it('should match superscript notation', () => {
      const pattern = patterns.mathSuper

      // Basic superscripts
      expect('x^2'.match(pattern)).toEqual(['x^2'])
      expect('y^n'.match(pattern)).toEqual(['y^n'])
      expect('z^{10}'.match(pattern)).toEqual(['z^{10}'])

      // In equations
      const emc2 = 'E=mc^2'.match(pattern)
      expect(emc2).toEqual(['c^2'])

      // After operators
      expect('2x^2'.match(pattern)).toEqual(['x^2'])
      expect('(x^2)'.match(pattern)).toEqual(['x^2'])
    })

    it('should NOT match invalid superscripts', () => {
      const pattern = patterns.mathSuper

      // Uppercase before (except after lowercase)
      expect('MAX^2'.match(pattern)).toBe(null)

      // No variable
      expect('^2'.match(pattern)).toBe(null)
    })

    it('should identify math superscript patterns', () => {
      expect(PatternMatchers.isMathSuperscript('x^2')).toBe(true)
      expect(PatternMatchers.isMathSuperscript('X^2')).toBe(true)
      expect(PatternMatchers.isMathSuperscript('^2')).toBe(false)
      expect(PatternMatchers.isMathSuperscript('x_2')).toBe(false)
    })
  })

  describe('Math Subscript Patterns', () => {
    it('should match subscript notation', () => {
      const pattern = patterns.mathSub

      // Basic subscripts
      expect('x_1'.match(pattern)).toEqual(['x_1'])
      expect('y_n'.match(pattern)).toEqual(['y_n'])
      expect('z_{10}'.match(pattern)).toEqual(['z_{10}'])

      // In equations
      expect('a=b_c'.match(pattern)).toEqual(['b_c'])
      expect('(x_1)'.match(pattern)).toEqual(['x_1'])
    })

    it('should NOT match in identifiers', () => {
      const pattern = patterns.mathSub

      // Should not match in programming identifiers
      expect('file_name'.match(pattern)).toBe(null)
      expect('some_var'.match(pattern)).toBe(null)
      expect('MAX_VALUE'.match(pattern)).toBe(null)
    })

    it('should identify math subscript patterns', () => {
      expect(PatternMatchers.isMathSubscript('x_1')).toBe(true)
      expect(PatternMatchers.isMathSubscript('X_1')).toBe(true)
      expect(PatternMatchers.isMathSubscript('_1')).toBe(false)
      expect(PatternMatchers.isMathSubscript('x^1')).toBe(false)
    })
  })
})
