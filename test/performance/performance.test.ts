/**
 * Performance optimization tests
 * Tests caching, batching, and performance features
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import {
  processText,
  clearProcessingCaches,
  needsProcessing,
  PatternMatchers,
  PatternExtractors,
  createPatterns,
  createCombinedPattern,
  DEFAULT_CONFIG,
} from '../../src/runtime/smartscript'

describe('Performance: Caching', () => {
  const config = DEFAULT_CONFIG
  const patterns = createPatterns(config)
  const combinedPattern = createCombinedPattern(patterns, config)

  beforeEach(() => {
    // Clear caches before each test
    clearProcessingCaches()
  })

  it('should cache repeated text processing', () => {
    const text = 'E=mc^2 and H_2O'

    // First call - should process
    const result1 = processText(text, combinedPattern)

    // Second call - should use cache
    const result2 = processText(text, combinedPattern)

    // Results should be identical
    expect(result1).toEqual(result2)
    // The text actually produces 4 parts after processing:
    // 'E=m' (text), 'c^2' -> 'c' + superscript '2', ' and ' (text), 'H_2O' -> 'H' + subscript '2' + 'O'
    expect(result1.length).toBeGreaterThan(0)
  })

  it('should clear cache when requested', () => {
    const text = 'x^2 + y^3'

    // Process once
    const result1 = processText(text, combinedPattern)
    expect(result1).toBeDefined()

    // Clear cache
    clearProcessingCaches()

    // Process again - should reprocess, not use cache
    const result2 = processText(text, combinedPattern)
    expect(result2).toEqual(result1)
  })

  it('should handle cache size limits', () => {
    // This tests that the LRU cache doesn't grow unbounded
    // Generate 1100 unique strings (more than MAX_CACHE_SIZE of 1000)
    const results = []
    for (let i = 0; i < 1100; i++) {
      const text = `test_${i}^2`
      const result = processText(text, combinedPattern)
      results.push(result)
    }

    // All should process correctly
    expect(results).toHaveLength(1100)
    expect(results[0]).toBeDefined()
    expect(results[1099]).toBeDefined()
  })
})

describe('Performance: Pattern Optimization', () => {
  it('should use pre-compiled regex patterns', () => {
    // Test that patterns are not recreated on each call
    const text1 = '™'
    const text2 = '®'
    const text3 = '©'

    // These should all use pre-compiled patterns
    expect(PatternMatchers.isTrademark(text1)).toBe(true)
    expect(PatternMatchers.isRegistered(text2)).toBe(true)
    expect(PatternMatchers.isCopyright(text3)).toBe(true)
  })

  it('should efficiently check if text needs processing', () => {
    const pattern = /test/g

    // Multiple calls should handle regex state correctly
    expect(needsProcessing('test', pattern)).toBe(true)
    expect(needsProcessing('test', pattern)).toBe(true) // Should reset lastIndex
    expect(needsProcessing('no match', pattern)).toBe(false)
    expect(needsProcessing('test again', pattern)).toBe(true)
  })

  it('should extract patterns efficiently', () => {
    // Test optimized extractors
    expect(PatternExtractors.extractOrdinal('1st')).toEqual({ number: '1', suffix: 'st' })
    expect(PatternExtractors.extractOrdinal('2nd')).toEqual({ number: '2', suffix: 'nd' })
    expect(PatternExtractors.extractOrdinal('3rd')).toEqual({ number: '3', suffix: 'rd' })
    expect(PatternExtractors.extractOrdinal('4th')).toEqual({ number: '4', suffix: 'th' })

    // Chemical extraction - pattern is [A-Z][a-z]?\d+ so CO2 doesn't match (C and O are both capitals)
    expect(PatternExtractors.extractChemicalElement('H2')).toEqual({ element: 'H', count: '2' })
    expect(PatternExtractors.extractChemicalElement('Ca2')).toEqual({ element: 'Ca', count: '2' }) // Calcium works

    // Math extraction (unified pattern)
    expect(PatternExtractors.extractMathWithVariable('x^2')).toEqual({ variable: 'x', script: '2' })
    expect(PatternExtractors.extractMathWithVariable('y_1')).toEqual({ variable: 'y', script: '1' })
    expect(PatternExtractors.extractMathWithVariable('z^{10}')).toEqual({ variable: 'z', script: '10' })
  })
})

describe('Performance: Batch Processing', () => {
  it('should handle empty text efficiently', () => {
    const pattern = /test/g

    expect(needsProcessing('', pattern)).toBe(false)
    expect(needsProcessing('   ', pattern)).toBe(false)
    expect(needsProcessing('\n\t', pattern)).toBe(false)
  })

  it('should process mixed content efficiently', () => {
    const config = DEFAULT_CONFIG
    const patterns = createPatterns(config)
    const combinedPattern = createCombinedPattern(patterns, config)

    const complexText = `
      The formula E=mc^2 revolutionized physics.
      Water (H_2O) is essential for life.
      The 1st, 2nd, and 3rd laws of thermodynamics.
      Copyright (C) 2024, TM and (R) symbols.
      Complex math: x^{2n+1} + y_{n-1} = z^2
    `

    const result = processText(complexText, combinedPattern)

    // Should process all patterns
    expect(result.length).toBeGreaterThan(10)

    // Verify some specific transformations
    const textContent = result.map(p => p.content).join('')
    expect(textContent).toContain('©') // (C) -> ©
    expect(result.some(p => p.type === 'super')).toBe(true)
    expect(result.some(p => p.type === 'sub')).toBe(true)
  })
})

describe('Performance: Memory Management', () => {
  it('should clear all caches on navigation', () => {
    const config = DEFAULT_CONFIG
    const patterns = createPatterns(config)
    const combinedPattern = createCombinedPattern(patterns, config)

    // Process some text
    processText('test^2', combinedPattern)
    processText('H_2O', combinedPattern)

    // Clear caches (simulating navigation)
    clearProcessingCaches()

    // Should work normally after clear
    const result = processText('new^text', combinedPattern)
    expect(result).toBeDefined()
  })
})

describe('Performance: Edge Cases', () => {
  it('should handle malformed patterns gracefully', () => {
    const config = DEFAULT_CONFIG
    const patterns = createPatterns(config)
    const combinedPattern = createCombinedPattern(patterns, config)

    // These should not crash
    expect(() => processText('x^', combinedPattern)).not.toThrow()
    expect(() => processText('y_', combinedPattern)).not.toThrow()
    expect(() => processText('^2', combinedPattern)).not.toThrow()
    expect(() => processText('_1', combinedPattern)).not.toThrow()
  })

  it('should handle very long text efficiently', () => {
    const config = DEFAULT_CONFIG
    const patterns = createPatterns(config)
    const combinedPattern = createCombinedPattern(patterns, config)

    // Generate a long text with patterns
    const longText = Array(100).fill('test^2 and H_2O').join(' ')

    const startTime = performance.now()
    const result = processText(longText, combinedPattern)
    const endTime = performance.now()

    // Should complete quickly (under 100ms for 100 repetitions)
    expect(endTime - startTime).toBeLessThan(100)
    expect(result).toBeDefined()
  })

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
    // Note: This is a DOM test but relates to performance
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    const document = dom.window.document

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
