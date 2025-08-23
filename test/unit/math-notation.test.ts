import { describe, it, expect } from 'vitest'
import { createPatterns, createCombinedPattern } from '../../src/runtime/smartscript/patterns'
import { processMatch } from '../../src/runtime/smartscript/processor'
import { DEFAULT_CONFIG } from '../../src/runtime/smartscript/config'

describe('Mathematical Notation Support', () => {
  const config = DEFAULT_CONFIG
  const patterns = createPatterns(config)

  describe('LaTeX-style Notation', () => {
    it('should support both x_n and x_{n} formats for subscripts', () => {
      const pattern = patterns.mathSub

      // Single character without braces (common in math)
      expect('x_n'.match(pattern)).toEqual(['x_n'])
      expect('x_i'.match(pattern)).toEqual(['x_i'])
      expect('x_j'.match(pattern)).toEqual(['x_j'])
      expect('a_0'.match(pattern)).toEqual(['a_0'])

      // Single character with braces (also valid)
      expect('x_{n}'.match(pattern)).toEqual(['x_{n}'])
      expect('x_{i}'.match(pattern)).toEqual(['x_{i}'])

      // Multi-character requires braces
      expect('x_{10}'.match(pattern)).toEqual(['x_{10}'])
      expect('x_{n+1}'.match(pattern)).toEqual(['x_{n+1}'])
      expect('x_{ij}'.match(pattern)).toEqual(['x_{ij}'])
    })

    it('should support both x^n and x^{n} formats for superscripts', () => {
      const pattern = patterns.mathSuper

      // Single character without braces (common in math)
      expect('x^2'.match(pattern)).toEqual(['x^2'])
      expect('x^n'.match(pattern)).toEqual(['x^n'])
      expect('x^i'.match(pattern)).toEqual(['x^i'])
      expect('e^x'.match(pattern)).toEqual(['e^x'])

      // Single character with braces (also valid)
      expect('x^{2}'.match(pattern)).toEqual(['x^{2}'])
      expect('x^{n}'.match(pattern)).toEqual(['x^{n}'])

      // Multi-character requires braces
      expect('x^{10}'.match(pattern)).toEqual(['x^{10}'])
      expect('x^{n+1}'.match(pattern)).toEqual(['x^{n+1}'])
      expect('x^{-1}'.match(pattern)).toEqual(['x^{-1}'])
    })
  })

  describe('Real-world Mathematical Expressions', () => {
    it('should handle common mathematical sequences', () => {
      const combined = createCombinedPattern(patterns, config)

      const sequence = 'The sequence a_1, a_2, ..., a_n converges'
      const matches = sequence.match(combined)
      expect(matches).toContain('a_1')
      expect(matches).toContain('a_2')
      expect(matches).toContain('a_n')
    })

    it('should handle polynomial expressions', () => {
      const combined = createCombinedPattern(patterns, config)

      // Note: Without spaces, a_nx^n only matches a_n (x^n is preceded by letter n)
      // This is correct behavior to avoid false matches
      const polynomial = 'P(x) = a_0 + a_1x + a_2x^2 + ... + a_n x^n'
      const matches = polynomial.match(combined)
      expect(matches).toContain('a_0')
      expect(matches).toContain('a_1')
      expect(matches).toContain('a_2')
      expect(matches).toContain('x^2')
      expect(matches).toContain('a_n')
      expect(matches).toContain('x^n')
    })

    it('should handle matrix notation', () => {
      const combined = createCombinedPattern(patterns, config)

      const matrix = 'Matrix A has elements a_{ij} where i goes from 1 to m and j from 1 to n'
      const matches = matrix.match(combined)
      expect(matches).toContain('a_{ij}')
    })

    it('should handle exponential and logarithmic expressions', () => {
      const combined = createCombinedPattern(patterns, config)

      const expressions = [
        { text: 'e^x is the exponential function', expected: ['e^x'] },
        { text: 'e^{2x} grows faster', expected: ['e^{2x}'] },
        { text: 'The function f_2(x) is defined', expected: ['f_2'] },
        { text: 'Sequence a_n converges', expected: ['a_n'] },
      ]

      expressions.forEach(({ text, expected }) => {
        const matches = text.match(combined)
        if (expected.length > 0) {
          expect(matches).toBeTruthy()
          expected.forEach((exp) => {
            expect(matches).toContain(exp)
          })
        }
      })
    })
  })

  describe('Edge Cases and Non-matches', () => {
    it('should not match underscores in file names or identifiers', () => {
      const combined = createCombinedPattern(patterns, config)

      // These should NOT match the math patterns
      const fileNames = [
        'file_name.txt',
        'my_variable',
        'snake_case_function',
        '__init__',
      ]

      fileNames.forEach((name) => {
        const matches = name.match(combined)
        expect(matches).toBeNull()
      })
    })

    it('should not match when pattern is incomplete', () => {
      const combined = createCombinedPattern(patterns, config)

      // These should NOT match
      const incomplete = [
        'x_', // No character after underscore
        'x^', // No character after caret
        '_n', // Underscore at start
        '^2', // Caret at start
      ]

      incomplete.forEach((text) => {
        const matches = text.match(combined)
        expect(matches).toBeNull()
      })
    })

    it('should handle mixed subscripts and superscripts', () => {
      const combined = createCombinedPattern(patterns, config)

      // Note: x_i^2 is tricky - after matching x_i, we're left with ^2
      // But i^2 also matches because i is a standalone letter
      const mixed = 'The term x_i represents x_i squared'
      const matches = mixed.match(combined)
      expect(matches).toContain('x_i')
      expect(matches).toHaveLength(2) // Two x_i matches

      // For x_i^2, better to have spaces: x_i ^2
      const mixed2 = 'The term x_i ^2 equals x_i squared'
      const matches2 = mixed2.match(combined)
      expect(matches2).toContain('x_i')
      expect(matches2).toHaveLength(2) // Two x_i, ^2 won't match without variable
    })
  })

  describe('Processing Results', () => {
    it('should correctly process single-letter subscripts', () => {
      const result = processMatch('x_n')
      expect(result.modified).toBe(true)
      expect(result.parts).toHaveLength(2)
      expect(result.parts[0].type).toBe('text')
      expect(result.parts[0].content).toBe('x')
      expect(result.parts[1].type).toBe('sub')
      expect(result.parts[1].content).toBe('n')
    })

    it('should correctly process single-letter superscripts', () => {
      const result = processMatch('x^n')
      expect(result.modified).toBe(true)
      expect(result.parts).toHaveLength(2)
      expect(result.parts[0].type).toBe('text')
      expect(result.parts[0].content).toBe('x')
      expect(result.parts[1].type).toBe('super')
      expect(result.parts[1].content).toBe('n')
    })

    it('should correctly extract content from braced expressions', () => {
      const result1 = processMatch('x_{n+1}')
      expect(result1.modified).toBe(true)
      expect(result1.parts).toHaveLength(2)
      expect(result1.parts[0].content).toBe('x')
      expect(result1.parts[1].content).toBe('n+1') // Braces removed

      const result2 = processMatch('x^{2n}')
      expect(result2.modified).toBe(true)
      expect(result2.parts).toHaveLength(2)
      expect(result2.parts[0].content).toBe('x')
      expect(result2.parts[1].content).toBe('2n') // Braces removed
    })

    it('should handle nested braces in math', () => {
      const pattern = createPatterns(config).mathSuper
      expect('x^{a^2}'.match(pattern)).toContain('x^{a^2}')
    })

    it('should not match incomplete patterns', () => {
      const superPattern = createPatterns(config).mathSuper
      const subPattern = createPatterns(config).mathSub

      expect('x^'.match(superPattern)).toBeNull()
      expect('x^{'.match(superPattern)).toBeNull()
      expect('x^{unclosed'.match(superPattern)).toBeNull()

      expect('x_'.match(subPattern)).toBeNull()
      expect('x_{'.match(subPattern)).toBeNull()
      expect('x_{unclosed'.match(subPattern)).toBeNull()
    })

    it('should handle various complex patterns', () => {
      const superPattern = createPatterns(config).mathSuper
      const subPattern = createPatterns(config).mathSub

      expect('x^{n+1}'.match(superPattern)).toContain('x^{n+1}')
      expect('x^{2n}'.match(superPattern)).toContain('x^{2n}')
      expect('x_{i+1}'.match(subPattern)).toContain('x_{i+1}')
      expect('x_{2n}'.match(subPattern)).toContain('x_{2n}')
    })
  })
})
