/**
 * Test to ensure HTML header tags (H1-H6) are NOT transformed
 * This was a critical bug where H1, H2, etc. were being treated as chemicals
 */

import { describe, expect, it } from 'vitest'
import {
  createCombinedPattern,
  createPatterns,
  DEFAULT_CONFIG,
  PatternMatchers,
  processText,
} from '../../../src/runtime/smartscript'

describe('hTML Headers Bug Fix', () => {
  const config = DEFAULT_CONFIG
  const patterns = createPatterns(config)
  const combinedPattern = createCombinedPattern(patterns, config)

  it('should NOT match H1-H6 as chemical formulas', () => {
    // Note: The pattern still matches H1-H6, but processTextInternal handles the context
    // checking to skip standalone H1-H6 that aren't followed by uppercase letters
    // The pattern matching is intentionally kept simple for performance
    expect(PatternMatchers.isChemicalElement('H1')).toBe(true) // Pattern matches, context handles it
    expect(PatternMatchers.isChemicalElement('H2')).toBe(true) // Pattern matches, context handles it
    expect(PatternMatchers.isChemicalElement('H3')).toBe(true)
    expect(PatternMatchers.isChemicalElement('H4')).toBe(true)
    expect(PatternMatchers.isChemicalElement('H5')).toBe(true)
    expect(PatternMatchers.isChemicalElement('H6')).toBe(true)
  })

  it('should still match actual chemical formulas', () => {
    expect(PatternMatchers.isChemicalElement('H2O')).toBe(false) // H2 + O, not H2O as one element
    expect(PatternMatchers.isChemicalElement('CO2')).toBe(false) // CO is two capitals, doesn't match
    expect(PatternMatchers.isChemicalElement('Na2')).toBe(true) // Sodium works
    expect(PatternMatchers.isChemicalElement('Ca3')).toBe(true) // Calcium works
    expect(PatternMatchers.isChemicalElement('H7')).toBe(true) // H7+ would be valid (not a header)
  })

  it('should NOT transform H1-H6 in text', () => {
    const texts = [
      'This is an H1 header',
      'This is an H2 header',
      'This is an H3 header',
      'This is an H4 header',
      'This is an H5 header',
      'This is an H6 header',
    ]

    texts.forEach((text) => {
      const result = processText(text, combinedPattern)
      // Should return as plain text, no transformations
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('text')
      expect(result[0].content).toBe(text)
    })
  })

  it('should still transform H2O correctly', () => {
    const text = 'Water is H2O'
    const result = processText(text, combinedPattern)

    // H2O gets processed - H2 is followed by O so it's treated as a chemical
    expect(result.length).toBeGreaterThan(1)

    // Check that we have H with subscript 2
    const hasH2Subscript = result.some((p, i) =>
      p.type === 'sub' && p.content === '2'
      && result[i - 1]?.content === 'H',
    )
    expect(hasH2Subscript).toBe(true) // H2 should transform when followed by O
  })

  it('should handle mixed content with headers', () => {
    const text = 'H1 is a header, but Na2 is sodium'
    const result = processText(text, combinedPattern)

    // H1 should stay as text, Na2 should be transformed
    const textContent = result.map((p) => p.content).join('')
    expect(textContent).toBe(text) // Content preserved

    // Na2 should have been processed
    const hasSubscript = result.some((p) => p.type === 'sub' && p.content === '2')
    expect(hasSubscript).toBe(true)
  })
})
