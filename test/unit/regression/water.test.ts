/**
 * Test to ensure H2O (water) works while H1-H6 headers don't transform
 */

import { describe, expect, it } from 'vitest'
import {
  createCombinedPattern,
  createPatterns,
  DEFAULT_CONFIG,
  processText,
} from '../../../src/runtime/smartscript'

describe('water and Headers Test', () => {
  const config = DEFAULT_CONFIG
  const patterns = createPatterns(config)
  const combinedPattern = createCombinedPattern(patterns, config)

  it('should transform H2O correctly', () => {
    const text = 'Water is H2O'
    const result = processText(text, combinedPattern)

    // Should have multiple parts (text + subscript)
    expect(result.length).toBeGreaterThan(1)

    // Should have H with subscript 2, then O
    const hasH2Subscript = result.some((p, i) =>
      p.type === 'sub' && p.content === '2'
      && result[i - 1]?.content === 'H',
    )
    expect(hasH2Subscript).toBe(true)
  })

  it('should NOT transform standalone H1-H6', () => {
    const tests = [
      'This is an H1 header',
      'This is an H2 header',
      'This is an H3 header',
      'This is an H4 header',
      'This is an H5 header',
      'This is an H6 header',
    ]

    tests.forEach((text) => {
      const result = processText(text, combinedPattern)
      // Should be plain text, no transformations
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('text')
      expect(result[0]!.content).toBe(text)
    })
  })

  it('should handle mixed H2O and H2 header in same text', () => {
    const text = 'H2O is water, but H2 is a header'
    const result = processText(text, combinedPattern)

    // H2O should be transformed, standalone H2 should not
    const textContent = result.map((p) => p.content).join('')
    expect(textContent).toBe(text)

    // Should have at least one subscript (for H2O)
    const subscriptCount = result.filter((p) => p.type === 'sub').length
    expect(subscriptCount).toBeGreaterThan(0)
  })

  it('should transform H2SO4 correctly', () => {
    const text = 'Sulfuric acid is H2SO4'
    const result = processText(text, combinedPattern)

    // Should have subscripts for both 2 and 4
    const subscripts = result.filter((p) => p.type === 'sub')
    expect(subscripts.length).toBe(2)
    expect(subscripts[0]!.content).toBe('2')
    expect(subscripts[1]!.content).toBe('4')
  })

  it('should NOT transform H7 or higher', () => {
    const text = 'H7 and H10 are not headers'
    const result = processText(text, combinedPattern)

    // H7 and H10 should be transformed as chemicals
    const subscripts = result.filter((p) => p.type === 'sub')
    expect(subscripts.length).toBe(2)
  })
})
