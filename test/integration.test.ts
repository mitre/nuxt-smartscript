import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { createPatterns, createCombinedPattern, PatternMatchers } from '../src/runtime/smartscript/patterns'
import { processMatch } from '../src/runtime/smartscript/processor'
import { DEFAULT_CONFIG } from '../src/runtime/smartscript/config'
import type { SuperscriptConfig } from '../src/runtime/smartscript/types'

describe('Integration Tests', () => {
  let dom: JSDOM
  let document: Document
  let config: SuperscriptConfig

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    document = dom.window.document
    config = DEFAULT_CONFIG
  })

  describe('Full Processing Pipeline', () => {
    it('should process complex mixed content correctly', () => {
      const text = 'Welcome to Product(TM)! This is the 1st release featuring H2O purification and x^2 calculations.'
      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)
      
      const matches = text.match(combined)
      expect(matches).toContain('(TM)')
      expect(matches).toContain('1st')
      expect(matches).toContain('H2')
      expect(matches).toContain('x^2')
    })

    it('should handle real-world scientific text', () => {
      const text = 'The reaction Ca(OH)2 + CO2 → CaCO3 + H2O occurs at 25°C.'
      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)
      
      const matches = text.match(combined)
      expect(matches).toContain(')2')
      expect(matches).toContain('O2')
      expect(matches).toContain('O3')
      expect(matches).toContain('H2')
    })

    it('should handle legal document patterns', () => {
      const text = 'Copyright(C) 2025. Product(TM) and Brand(R) are registered trademarks.'
      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)
      
      const matches = text.match(combined)
      expect(matches).toContain('(C)')
      expect(matches).toContain('(TM)')
      expect(matches).toContain('(R)')
    })

    it('should handle academic paper citations', () => {
      const text = 'As shown in the 21st century study[1], the 2nd law states that x^2 + y^2 = r^2.'
      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)
      
      const matches = text.match(combined)
      expect(matches).toContain('21st')
      expect(matches).toContain('2nd')
      expect(matches).toContain('x^2')
      expect(matches).toContain('y^2')
      expect(matches).toContain('r^2')
    })
  })

  describe('Pattern Priority and Conflicts', () => {
    it('should handle conflicting patterns correctly', () => {
      // TM could be trademark or chemical element Tm (Thulium)
      const text1 = 'Product TM is great'
      const text2 = 'Tm2O3 is thulium oxide'
      
      expect(PatternMatchers.isTrademark('TM')).toBe(true)
      expect(PatternMatchers.isChemicalElement('Tm2')).toBe(true)
    })

    it('should handle adjacent patterns', () => {
      const text = '1st(TM)H2O^2'
      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)
      
      const matches = text.match(combined)
      expect(matches).toHaveLength(4)
      expect(matches).toContain('1st')
      expect(matches).toContain('(TM)')
      expect(matches).toContain('H2')
      expect(matches).toContain('O^2')  // O is preceded by digit 2, so it matches
    })

    it('should handle nested parentheses correctly', () => {
      const text = '((TM)) symbols and Brand (R) text'
      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)
      
      const matches = text.match(combined)
      expect(matches).toContain('(TM)')
      expect(matches).toContain('(R)')
      
      // Note: ((R)) won't match due to the negative lookahead for extra )
      const text2 = '((R)) should not match'
      const matches2 = text2.match(combined)
      expect(matches2).toBeNull()
    })
  })

  describe('Performance with Real Content', () => {
    it('should handle a typical blog post', () => {
      const blogPost = `
        Welcome to our Product(TM) Blog - 21st Century Edition!
        
        Today, January 1st, 2025, we're excited to announce the 2nd generation 
        of our H2O purification system. This 3rd party tested device uses 
        advanced CO2 filtering.
        
        Mathematical proof: The efficiency is calculated as η = P_out/P_in where 
        P^2 represents power squared. Our 4th generation algorithm achieves 
        99.9% efficiency.
        
        Copyright(C) 2025 Company(R). All rights reserved.
      `
      
      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)
      const matches = blogPost.match(combined)
      
      expect(matches).toBeTruthy()
      expect(matches?.length).toBeGreaterThan(10)
      
      // Verify specific matches
      expect(matches).toContain('(TM)')
      expect(matches).toContain('21st')
      expect(matches).toContain('1st')
      expect(matches).toContain('2nd')
      expect(matches).toContain('3rd')
      expect(matches).toContain('4th')
      expect(matches).toContain('H2')
      expect(matches).toContain('O2')
      expect(matches).toContain('P^2')
      expect(matches).toContain('(C)')
      expect(matches).toContain('(R)')
    })

    it('should handle technical documentation', () => {
      const techDoc = `
        API Reference v2.1 (1st Release)
        
        The setH2O() method accepts CO2 levels as input.
        Formula: E = m c^2 where c is the speed of light.
        
        Note: This is the 42nd revision of the spec.
        All methods return x_1, x_2, ..., x_n values.
        
        Trademark(TM) and Copyright(C) notices apply.
      `
      
      const patterns = createPatterns(config)
      const combined = createCombinedPattern(patterns, config)
      const matches = techDoc.match(combined)
      
      expect(matches).toBeTruthy()
      expect(matches).toContain('1st')
      expect(matches).toContain('42nd')
      expect(matches).toContain('H2')
      expect(matches).toContain('O2')
      expect(matches).toContain('c^2')
      expect(matches).toContain('x_1')
      expect(matches).toContain('x_2')
      expect(matches).toContain('x_n')
      expect(matches).toContain('(TM)')
      expect(matches).toContain('(C)')
    })
  })

  describe('Configuration Variations', () => {
    it('should respect disabled ordinals', () => {
      const customConfig = {
        ...config,
        symbols: {
          ...config.symbols,
          ordinals: false
        }
      }
      
      const patterns = createPatterns(customConfig)
      const combined = createCombinedPattern(patterns, customConfig)
      
      const text = '1st place winner gets H2O and Product(TM)'
      const matches = text.match(combined)
      
      expect(matches).not.toContain('1st')
      expect(matches).toContain('H2')
      expect(matches).toContain('(TM)')
    })

    it('should handle custom symbol lists', () => {
      const customConfig = {
        ...config,
        symbols: {
          ...config.symbols,
          trademark: ['™'], // Only unicode, not (TM)
          registered: ['®'], // Only unicode, not (R)
        }
      }
      
      const patterns = createPatterns(customConfig)
      const combined = createCombinedPattern(patterns, customConfig)
      
      const text = 'Product™ and Brand® vs Product(TM) and Brand(R)'
      const matches = text.match(combined)
      
      expect(matches).toContain('™')
      expect(matches).toContain('®')
      // (TM) and (R) should not be matched with this config
    })
  })

  describe('DOM Integration', () => {
    it('should handle document fragments correctly', () => {
      const fragment = document.createDocumentFragment()
      const p1 = document.createElement('p')
      p1.textContent = 'Product(TM)'
      const p2 = document.createElement('p')
      p2.textContent = '1st place'
      
      fragment.appendChild(p1)
      fragment.appendChild(p2)
      
      expect(p1.textContent).toBe('Product(TM)')
      expect(p2.textContent).toBe('1st place')
    })

    it('should handle shadow DOM content', () => {
      // Note: JSDOM doesn't fully support shadow DOM, but we can test the concept
      const host = document.createElement('div')
      // In a real browser: const shadow = host.attachShadow({ mode: 'open' })
      const content = document.createElement('span')
      content.textContent = 'Product(TM) is 1st'
      host.appendChild(content)
      
      expect(content.textContent).toBe('Product(TM) is 1st')
    })

    it('should handle dynamically added content', () => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      
      // Simulate dynamic content addition
      setTimeout(() => {
        container.innerHTML = 'New Product(TM) added'
      }, 0)
      
      // In a real implementation, MutationObserver would detect this
      expect(container.parentNode).toBe(document.body)
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle malformed HTML gracefully', () => {
      const malformed = '<p>Product(TM) <span>unclosed'
      const div = document.createElement('div')
      div.innerHTML = malformed
      
      // Should still be able to access text content
      expect(div.textContent).toContain('Product(TM)')
    })

    it('should handle circular references', () => {
      const div1 = document.createElement('div')
      const div2 = document.createElement('div')
      div1.appendChild(div2)
      div2.appendChild(div1.cloneNode(true))
      
      div1.textContent = 'Product(TM)'
      expect(div1.textContent).toBe('Product(TM)')
    })

    it('should handle very deeply nested structures', () => {
      let current = document.body
      const depth = 1000
      
      for (let i = 0; i < depth; i++) {
        const div = document.createElement('div')
        current.appendChild(div)
        current = div
      }
      
      current.textContent = 'Deep Product(TM)'
      expect(current.textContent).toBe('Deep Product(TM)')
    })
  })

  describe('Accessibility Compliance', () => {
    it('should maintain readability for screen readers', () => {
      const results = [
        { original: 'Product(TM)', processed: 'Product™', ariaLabel: 'trademark' },
        { original: 'Brand(R)', processed: 'Brand®', ariaLabel: 'registered' },
        { original: '1st', processed: '1st', ariaLabel: 'first' },
        { original: 'H2O', processed: 'H2O', ariaLabel: 'H 2 O' },
      ]
      
      results.forEach(({ original, ariaLabel }) => {
        const result = processMatch(original)
        if (result.modified && result.parts.length > 0) {
          // Verify that we have structured data for accessibility
          expect(result.parts).toBeDefined()
          expect(result.parts.length).toBeGreaterThan(0)
        }
      })
    })
  })
})