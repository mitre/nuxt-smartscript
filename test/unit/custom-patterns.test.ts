/**
 * Custom Pattern Tests
 * Tests the ability to override default patterns with custom regex
 */

import type { SuperscriptConfig } from '../../src/runtime/smartscript/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createCombinedPattern,
  createPatterns,
  DEFAULT_CONFIG,
  processText,
} from '../../src/runtime/smartscript'

describe('custom Pattern Configuration', () => {
  beforeEach(() => {
    // Clear any console mocks
    vi.clearAllMocks()
  })

  describe('default Patterns', () => {
    it('should use default patterns when no custom patterns provided', () => {
      const config = DEFAULT_CONFIG
      const patterns = createPatterns(config)

      expect('Product(TM)'.match(patterns.trademark)).toContain('(TM)')
      expect('Brand(R)'.match(patterns.registered)).toContain('(R)')
      expect('1st'.match(patterns.ordinals)).toContain('1st')
      expect('H2O'.match(patterns.chemicals)).toContain('H2')
    })
  })

  describe('custom Pattern Override', () => {
    it('should use custom trademark pattern', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        customPatterns: {
          // Custom pattern that only matches (TM), not standalone TM
          trademark: '\\(TM\\)',
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'Product(TM) and TM standalone'
      const matches = text.match(combined)

      expect(matches).toContain('(TM)')
      expect(matches).not.toContain('TM') // Standalone TM should not match
    })

    it('should use custom ordinal pattern', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        customPatterns: {
          // Custom pattern that only matches 1st, 2nd, 3rd (not 4th, 5th, etc.)
          ordinals: '\\b(\\d+)(st|nd|rd)\\b',
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = '1st 2nd 3rd 4th 5th'
      const matches = text.match(combined)

      expect(matches).toContain('1st')
      expect(matches).toContain('2nd')
      expect(matches).toContain('3rd')
      expect(matches).not.toContain('4th')
      expect(matches).not.toContain('5th')
    })

    it('should use custom chemical pattern', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        customPatterns: {
          // Custom pattern that only matches specific chemicals
          chemicals: '(H2O|CO2|O2)',
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'H2O CO2 O2 N2 CH4'
      const matches = text.match(combined)

      expect(matches).toContain('H2O')
      expect(matches).toContain('CO2')
      expect(matches).toContain('O2')
      expect(matches).not.toContain('N2')
      expect(matches).not.toContain('CH4')
    })

    it('should use custom math patterns', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        customPatterns: {
          // Custom pattern that requires space before ^
          mathSuper: '\\s([a-z])\\^(\\d+)',
          // Custom pattern that requires space before _
          mathSub: '\\s([a-z])_(\\d+)',
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'equation: x^2 y_1 file^name var_name'
      const matches = text.match(combined)

      // Should match with space but not without
      expect(matches).toContain(' x^2')
      expect(matches).toContain(' y_1')
      expect(matches).not.toContain('file^name')
      expect(matches).not.toContain('var_name')
    })
  })

  describe('invalid Pattern Handling', () => {
    it('should fall back to default when custom pattern is invalid', () => {
      // Mock console to check for warnings
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        customPatterns: {
          // Invalid regex pattern (unmatched parenthesis)
          trademark: '(TM',
        },
      }

      const patterns = createPatterns(config)

      // Should fall back to default pattern
      expect('Product(TM)'.match(patterns.trademark)).toContain('(TM)')
      expect('TM'.match(patterns.trademark)).toBeNull() // Default doesn't include standalone TM

      warnSpy.mockRestore()
    })

    it('should handle empty custom pattern', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        customPatterns: {
          trademark: '',
        },
      }

      const patterns = createPatterns(config)

      // Should use default pattern
      expect('Product(TM)'.match(patterns.trademark)).toContain('(TM)')
    })

    it('should handle multiple invalid patterns', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        customPatterns: {
          trademark: '[unclosed',
          ordinals: '(?<invalid',
          chemicals: '(*invalid)',
        },
      }

      const patterns = createPatterns(config)

      // All should fall back to defaults
      expect('(TM)'.match(patterns.trademark)).toContain('(TM)')
      expect('1st'.match(patterns.ordinals)).toContain('1st')
      expect('H2O'.match(patterns.chemicals)).toContain('H2')
    })
  })

  describe('complex Custom Patterns', () => {
    it('should support complex trademark variations', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        customPatterns: {
          // Match various trademark formats
          trademark: '(™|\\(TM\\)|\\[TM\\]|<TM>|\\bTM\\b)',
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'Product™ Brand(TM) Item[TM] Thing<TM> TM'
      const matches = text.match(combined)

      expect(matches).toContain('™')
      expect(matches).toContain('(TM)')
      expect(matches).toContain('[TM]')
      expect(matches).toContain('<TM>')
      expect(matches).toContain('TM')
    })

    it('should support extended ordinal patterns', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        customPatterns: {
          // Include Roman numerals with ordinal suffixes
          ordinals: '\\b(\\d+|[IVX]+)(st|nd|rd|th)\\b',
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = '1st XIth XXIst IVth'
      const matches = text.match(combined)

      expect(matches).toContain('1st')
      expect(matches).toContain('XIth')
      expect(matches).toContain('XXIst')
      expect(matches).toContain('IVth')
    })
  })

  describe('processing with Custom Patterns', () => {
    it('should process text correctly with custom patterns', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        customPatterns: {
          // Only match (TM) in parentheses
          trademark: '\\(TM\\)',
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'Product(TM) uses TM technology'
      const parts = processText(text, combined)

      // Only (TM) should be transformed
      const hasTransformedTM = parts.some((p) =>
        p.type === 'super' && p.content === '™',
      )
      const plainText = parts.map((p) => p.content).join('')

      expect(hasTransformedTM).toBe(true)
      expect(plainText).toContain('TM technology') // Standalone TM unchanged
    })

    it('should combine custom and disabled transformations', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        transformations: {
          ordinals: false, // Disable ordinals
        },
        customPatterns: {
          // Custom trademark pattern
          trademark: '\\bTM\\b', // Only standalone TM
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'TM Product(TM) 1st H2O'
      const matches = text.match(combined)

      expect(matches).toContain('TM') // Custom pattern
      expect(matches).not.toContain('(TM)') // Not in custom pattern
      expect(matches).not.toContain('1st') // Disabled
      expect(matches).toContain('H2') // Still enabled
    })
  })
})
