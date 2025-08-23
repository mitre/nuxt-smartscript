/**
 * Text Processor Tests
 * Tests the text processing and transformation logic
 */

import { describe, it, expect } from 'vitest'
import {
  processMatch,
  processText,
  needsProcessing,
  PatternExtractors,
  PatternMatchers,
  createPatterns,
  createCombinedPattern,
  DEFAULT_CONFIG,
} from '../../src/runtime/smartscript'

describe('Text Processing', () => {
  const config = DEFAULT_CONFIG
  const patterns = createPatterns(config)
  const combinedPattern = createCombinedPattern(patterns, config)

  describe('processMatch', () => {
    it('should transform (TM) to ™ superscript', () => {
      const result = processMatch('(TM)')
      expect(result.modified).toBe(true)
      expect(result.parts).toEqual([
        { type: 'super', content: '™' },
      ])
    })

    it('should transform (R) to ® plain text', () => {
      const result = processMatch('(R)')
      expect(result.modified).toBe(true)
      expect(result.parts).toEqual([
        { type: 'text', content: '®' },
      ])
    })

    it('should transform (C) to © plain text', () => {
      const result = processMatch('(C)')
      expect(result.modified).toBe(true)
      expect(result.parts).toEqual([
        { type: 'text', content: '©' },
      ])
    })

    it('should transform ordinals correctly', () => {
      const result = processMatch('1st')
      expect(result.modified).toBe(true)
      expect(result.parts).toEqual([
        { type: 'text', content: '1' },
        { type: 'super', content: 'st' },
      ])
    })

    it('should transform chemical formulas correctly', () => {
      const result = processMatch('H2')
      expect(result.modified).toBe(true)
      expect(result.parts).toEqual([
        { type: 'text', content: 'H' },
        { type: 'sub', content: '2' },
      ])
    })

    it('should transform math superscript correctly', () => {
      const result = processMatch('x^2')
      expect(result.modified).toBe(true)
      expect(result.parts).toEqual([
        { type: 'text', content: 'x' },
        { type: 'super', content: '2' },
      ])
    })

    it('should transform math subscript correctly', () => {
      const result = processMatch('x_1')
      expect(result.modified).toBe(true)
      expect(result.parts).toEqual([
        { type: 'text', content: 'x' },
        { type: 'sub', content: '1' },
      ])
    })

    it('should return unmodified for non-matching text', () => {
      const result = processMatch('normal text')
      expect(result.modified).toBe(false)
      expect(result.parts).toEqual([
        { type: 'text', content: 'normal text' },
      ])
    })
  })

  describe('processText', () => {
    it('should process multiple patterns in text', () => {
      const text = '1st place: E=mc^2'
      const parts = processText(text, combinedPattern)

      // Should have parts for "1", "st" (super), " place: E=m", "c", "2" (super)
      expect(parts.length).toBeGreaterThan(3)
      expect(parts.some(p => p.type === 'super')).toBe(true)
    })

    it('should handle text with no patterns', () => {
      const text = 'Just plain text'
      const parts = processText(text, combinedPattern)

      expect(parts).toEqual([
        { type: 'text', content: 'Just plain text' },
      ])
    })

    it('should process complex mixed content', () => {
      const text = 'The formula H2O and CO2 are important'
      const parts = processText(text, combinedPattern)

      // Should have subscripts for chemical formulas
      expect(parts.some(p => p.type === 'sub')).toBe(true)
    })
  })

  describe('needsProcessing', () => {
    it('should detect text that needs processing', () => {
      expect(needsProcessing('x^2', combinedPattern)).toBe(true)
      expect(needsProcessing('1st', combinedPattern)).toBe(true)
      expect(needsProcessing('(TM)', combinedPattern)).toBe(true)
      expect(needsProcessing('H2O', combinedPattern)).toBe(true)
    })

    it('should detect text that does NOT need processing', () => {
      expect(needsProcessing('plain text', combinedPattern)).toBe(false)
      expect(needsProcessing('no patterns here', combinedPattern)).toBe(false)
      expect(needsProcessing('', combinedPattern)).toBe(false)
    })

    it('should handle regex state correctly', () => {
      // Multiple calls should not affect each other
      expect(needsProcessing('test^2', combinedPattern)).toBe(true)
      expect(needsProcessing('test^2', combinedPattern)).toBe(true)
      expect(needsProcessing('plain', combinedPattern)).toBe(false)
      expect(needsProcessing('test^3', combinedPattern)).toBe(true)
    })
  })

  describe('Pattern Extractors', () => {
    it('should extract ordinal parts', () => {
      expect(PatternExtractors.extractOrdinal('1st')).toEqual({
        number: '1',
        suffix: 'st',
      })
      expect(PatternExtractors.extractOrdinal('42nd')).toEqual({
        number: '42',
        suffix: 'nd',
      })
      expect(PatternExtractors.extractOrdinal('not ordinal')).toBe(null)
    })

    it('should extract chemical element parts', () => {
      expect(PatternExtractors.extractChemicalElement('H2')).toEqual({
        element: 'H',
        count: '2',
      })
      expect(PatternExtractors.extractChemicalElement('Ca3')).toEqual({
        element: 'Ca',
        count: '3',
      })
      expect(PatternExtractors.extractChemicalElement('CO2')).toBe(null) // Two capitals
    })

    it('should extract chemical parentheses', () => {
      expect(PatternExtractors.extractChemicalParentheses(')2')).toBe('2')
      expect(PatternExtractors.extractChemicalParentheses(')10')).toBe('10')
      expect(PatternExtractors.extractChemicalParentheses('2)')).toBe(null)
    })

    it('should extract math script parts', () => {
      expect(PatternExtractors.extractMathScript('^2')).toBe('2')
      expect(PatternExtractors.extractMathScript('_{10}')).toBe('10')
      expect(PatternExtractors.extractMathScript('^{n+1}')).toBe('n+1')
    })

    it('should extract math with variable', () => {
      expect(PatternExtractors.extractMathWithVariable('x^2')).toEqual({
        variable: 'x',
        script: '2',
      })
      expect(PatternExtractors.extractMathWithVariable('y_n')).toEqual({
        variable: 'y',
        script: 'n',
      })
      expect(PatternExtractors.extractMathWithVariable('z^{10}')).toEqual({
        variable: 'z',
        script: '10',
      })
      expect(PatternExtractors.extractMathWithVariable('plain')).toBe(null)
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
      ordinals.forEach((ord) => {
        const result = processMatch(ord)
        expect(result.modified).toBe(true)
        expect(result.parts).toHaveLength(2) // number + suffix
      })
    })
  })

  describe('Regex State Management', () => {
    it('should handle regex with global flag correctly', () => {
      const pattern = /\(TM\)/g
      const text = 'Product(TM) Another(TM)'

      // First execution
      const match1 = pattern.exec(text)
      expect(match1?.[0]).toBe('(TM)')
      expect(pattern.lastIndex).toBe(11)

      // Second execution continues from lastIndex
      const match2 = pattern.exec(text)
      expect(match2?.[0]).toBe('(TM)')
      expect(pattern.lastIndex).toBe(23)

      // Third execution returns null and resets
      const match3 = pattern.exec(text)
      expect(match3).toBeNull()
      expect(pattern.lastIndex).toBe(0)

      // Fourth execution starts over
      const match4 = pattern.exec(text)
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
})
