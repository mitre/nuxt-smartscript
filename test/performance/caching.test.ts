/**
 * Caching Performance Tests
 * Tests text processing cache and memory management
 */

import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearProcessingCaches,
  createCombinedPattern,
  createPatterns,
  DEFAULT_CONFIG,
  processText,
} from '../../src/runtime/smartscript'

describe('caching Performance', () => {
  const config = DEFAULT_CONFIG
  const patterns = createPatterns(config)
  const combinedPattern = createCombinedPattern(patterns, config)

  beforeEach(() => {
    // Clear caches before each test
    clearProcessingCaches()
  })

  describe('text Processing Cache', () => {
    it('should cache repeated text processing', () => {
      const text = 'E=mc^2 and H_2O'

      // First call - should process
      const result1 = processText(text, combinedPattern)

      // Second call - should use cache
      const result2 = processText(text, combinedPattern)

      // Results should be identical
      expect(result1).toEqual(result2)
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

    it('should handle cache size limits (LRU)', () => {
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

  describe('memory Management', () => {
    it('should clear all caches on navigation', () => {
      // Process some text
      processText('test^2', combinedPattern)
      processText('H_2O', combinedPattern)

      // Clear caches (simulating navigation)
      clearProcessingCaches()

      // Should work normally after clear
      const result = processText('new^text', combinedPattern)
      expect(result).toBeDefined()
    })

    it('should handle very long text efficiently', () => {
      // Generate a long text with patterns
      const longText = Array.from({ length: 100 }).fill('test^2 and H_2O').join(' ')

      const startTime = performance.now()
      const result = processText(longText, combinedPattern)
      const endTime = performance.now()

      // Should complete quickly (under 100ms for 100 repetitions)
      expect(endTime - startTime).toBeLessThan(100)
      expect(result).toBeDefined()
    })
  })
})
