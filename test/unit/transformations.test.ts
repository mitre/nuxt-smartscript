/**
 * Transformation Enable/Disable Tests
 * Tests the ability to selectively enable/disable transformation types
 */

import type { SuperscriptConfig } from '../../src/runtime/smartscript/types'
import { describe, expect, it } from 'vitest'
import {
  createCombinedPattern,
  createPatterns,
  DEFAULT_CONFIG,
  processText,
} from '../../src/runtime/smartscript'

describe('transformation Configuration', () => {
  describe('all Transformations Enabled (Default)', () => {
    it('should process all transformation types by default', () => {
      const config = DEFAULT_CONFIG
      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'Product(TM) is 1st with H2O and x^2 calculations'
      const matches = text.match(combined)

      expect(matches).toContain('(TM)')
      expect(matches).toContain('1st')
      expect(matches).toContain('H2')
      expect(matches).toContain('x^2')
    })
  })

  describe('selective Transformation Disabling', () => {
    it('should disable trademark transformation only', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        transformations: {
          trademark: false, // Disable trademark only
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'Product(TM) is 1st with H2O'
      const matches = text.match(combined)

      expect(matches).not.toContain('(TM)')
      expect(matches).not.toContain('TM')
      expect(matches).toContain('1st')
      expect(matches).toContain('H2')
    })

    it('should disable ordinals transformation only', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        transformations: {
          ordinals: false,
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'The 1st Product(TM) with H2O'
      const matches = text.match(combined)

      expect(matches).not.toContain('1st')
      expect(matches).not.toContain('2nd')
      expect(matches).toContain('(TM)')
      expect(matches).toContain('H2')
    })

    it('should disable chemicals transformation only', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        transformations: {
          chemicals: false,
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'Water H2O and CO2 with Product(TM)'
      const matches = text.match(combined)

      expect(matches).not.toContain('H2')
      expect(matches).not.toContain('O2')
      expect(matches).toContain('(TM)')
    })

    it('should disable math transformations', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        transformations: {
          mathSuper: false,
          mathSub: false,
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'E=mc^2 with x_1 and Product(TM)'
      const matches = text.match(combined)

      expect(matches).not.toContain('c^2')
      expect(matches).not.toContain('x_1')
      expect(matches).toContain('(TM)')
    })

    it('should disable multiple transformation types', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        transformations: {
          trademark: false,
          registered: false,
          ordinals: false,
          // Keep chemicals and math enabled
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'Product(TM) and Brand(R) is 1st with H2O and x^2'
      const matches = text.match(combined)

      expect(matches).not.toContain('(TM)')
      expect(matches).not.toContain('(R)')
      expect(matches).not.toContain('1st')
      expect(matches).toContain('H2')
      expect(matches).toContain('x^2')
    })
  })

  describe('only Specific Transformations Enabled', () => {
    it('should only process trademark and registered when others disabled', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        transformations: {
          trademark: true,
          registered: true,
          copyright: true,
          ordinals: false,
          chemicals: false,
          mathSuper: false,
          mathSub: false,
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'Product(TM) Brand(R) Copyright(C) 1st H2O x^2'
      const matches = text.match(combined)

      expect(matches).toContain('(TM)')
      expect(matches).toContain('(R)')
      expect(matches).toContain('(C)')
      expect(matches).not.toContain('1st')
      expect(matches).not.toContain('H2')
      expect(matches).not.toContain('x^2')
    })

    it('should only process chemicals when only chemicals enabled', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        transformations: {
          trademark: false,
          registered: false,
          copyright: false,
          ordinals: false,
          chemicals: true,
          mathSuper: false,
          mathSub: false,
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'Product(TM) 1st H2O CO2 x^2'
      const matches = text.match(combined)

      expect(matches).not.toContain('(TM)')
      expect(matches).not.toContain('1st')
      expect(matches).not.toContain('x^2')
      expect(matches).toContain('H2')
      expect(matches).toContain('O2')
    })
  })

  describe('processing with Disabled Transformations', () => {
    it('should not transform disabled patterns in processText', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        transformations: {
          trademark: false,
          ordinals: false,
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'Product(TM) is 1st with H2O'
      const parts = processText(text, combined)

      // (TM) and 1st should remain as plain text
      const reconstructed = parts.map((p) => p.content).join('')
      expect(reconstructed).toContain('(TM)')
      expect(reconstructed).toContain('1st')

      // H2O should be transformed
      expect(parts.some((p) => p.type === 'sub' && p.content === '2')).toBe(true)
    })

    it('should handle all transformations disabled', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        transformations: {
          trademark: false,
          registered: false,
          copyright: false,
          ordinals: false,
          chemicals: false,
          mathSuper: false,
          mathSub: false,
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      const text = 'Product(TM) 1st H2O x^2 x_1'
      const parts = processText(text, combined)

      // Everything should remain as plain text
      expect(parts).toHaveLength(1)
      expect(parts[0]!.type).toBe('text')
      expect(parts[0]!.content).toBe(text)
    })
  })

  describe('pattern Validation', () => {
    it('should create valid patterns even when disabled', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        transformations: {
          trademark: false,
        },
      }

      const patterns = createPatterns(config)

      // Pattern should exist but never match
      expect(patterns.trademark).toBeDefined()
      expect(patterns.trademark).toBeInstanceOf(RegExp)
      expect('Product(TM)'.match(patterns.trademark)).toBeNull()
    })

    it('should not break combined pattern with disabled transformations', () => {
      const config: SuperscriptConfig = {
        ...DEFAULT_CONFIG,
        transformations: {
          trademark: false,
          ordinals: false,
          chemicals: false,
        },
      }

      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)

      // Combined pattern should still work for enabled transformations
      expect(combined).toBeInstanceOf(RegExp)
      expect('x^2'.match(combined)).toContain('x^2')
      expect('(TM)'.match(combined)).toBeNull()
    })
  })
})
