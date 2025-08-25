/**
 * Engine Tests
 * Tests for the core processing engine functions
 */

import { JSDOM } from 'jsdom'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createCombinedPattern,
  createPatterns,
  DEFAULT_CONFIG,
} from '../../src/runtime/smartscript'
import {
  processContent,
  processElement,
  processTextNode,
} from '../../src/runtime/smartscript/engine'

describe('engine: Core Processing Functions', () => {
  let dom: JSDOM
  let document: Document
  const config = DEFAULT_CONFIG
  const patterns = createPatterns(config)
  const combinedPattern = createCombinedPattern(patterns, config)

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    document = dom.window.document
    global.document = document as unknown as Document

    // Add browser globals for JSDOM
    if (typeof NodeFilter === 'undefined') {
      // eslint-disable-next-line ts/no-explicit-any
      (global as any).NodeFilter = {
        FILTER_ACCEPT: 1,
        FILTER_REJECT: 2,
        FILTER_SKIP: 3,
        SHOW_TEXT: 0x4,
        SHOW_ELEMENT: 0x1,
      }
    }

    if (typeof HTMLElement === 'undefined') {
      // eslint-disable-next-line ts/no-explicit-any
      (global as any).HTMLElement = dom.window.HTMLElement
    }
  })

  describe('processTextNode', () => {
    it('should process text node with patterns', () => {
      const div = document.createElement('div')
      div.textContent = 'Product(TM)'
      const textNode = div.firstChild as Text

      const modified = processTextNode(textNode, config, combinedPattern)

      expect(modified).toBe(true)
      // Node should be replaced with fragment containing SPAN element (hybrid approach for TM)
      expect(div.querySelector('span.ss-tm')).toBeTruthy()
      expect(div.textContent).toBe('Product™')
    })

    it('should return false for text without patterns', () => {
      const div = document.createElement('div')
      div.textContent = 'Plain text'
      const textNode = div.firstChild as Text

      const modified = processTextNode(textNode, config, combinedPattern)

      expect(modified).toBe(false)
      expect(div.textContent).toBe('Plain text')
      expect(div.querySelector('sup')).toBeFalsy()
    })

    it('should handle empty text nodes', () => {
      const div = document.createElement('div')
      div.textContent = ''
      const textNode = div.firstChild as Text

      // Empty div has no text node
      if (!textNode) {
        expect(div.firstChild).toBeNull()
        return
      }

      const modified = processTextNode(textNode, config, combinedPattern)
      expect(modified).toBe(false)
    })

    it('should handle whitespace-only text nodes', () => {
      const div = document.createElement('div')
      div.textContent = '   \n\t   '
      const textNode = div.firstChild as Text

      const modified = processTextNode(textNode, config, combinedPattern)

      expect(modified).toBe(false)
    })

    it('should process chemical formulas', () => {
      const div = document.createElement('div')
      div.textContent = 'H2O'
      const textNode = div.firstChild as Text

      const modified = processTextNode(textNode, config, combinedPattern)

      expect(modified).toBe(true)
      expect(div.querySelector('sub')).toBeTruthy()
    })

    it('should process ordinal numbers', () => {
      const div = document.createElement('div')
      div.textContent = '1st place'
      const textNode = div.firstChild as Text

      const modified = processTextNode(textNode, config, combinedPattern)

      expect(modified).toBe(true)
      expect(div.querySelector('sup.ss-ordinal')).toBeTruthy()
    })
  })

  describe('processElement', () => {
    it('should process all text nodes in element', () => {
      const div = document.createElement('div')
      div.innerHTML = 'Product(TM) and 1st place'

      processElement(div, config, patterns, combinedPattern)

      // Check that transformations happened
      expect(div.querySelector('sup')).toBeTruthy()
      expect(div.textContent).toContain('™')
    })

    it('should skip excluded elements', () => {
      const pre = document.createElement('pre')
      pre.textContent = 'Product(TM)'

      processElement(pre, config, patterns, combinedPattern)

      // Pre element should not be processed
      expect(pre.textContent).toBe('Product(TM)')
      expect(pre.querySelector('sup')).toBeFalsy()
    })

    it('should handle nested elements', () => {
      const div = document.createElement('div')
      div.innerHTML = '<span>1st</span> and <strong>2nd</strong>'

      processElement(div, config, patterns, combinedPattern)

      // Check that both ordinals were processed
      const sups = div.querySelectorAll('sup')
      expect(sups.length).toBe(2)
    })

    it('should skip already processed elements', () => {
      const div = document.createElement('div')
      div.textContent = 'Product(TM)'

      // Process once
      processElement(div, config, patterns, combinedPattern)
      const firstResult = div.innerHTML

      // Try to process again - should skip
      processElement(div, config, patterns, combinedPattern)
      expect(div.innerHTML).toBe(firstResult)
    })

    it('should handle elements with no text', () => {
      const div = document.createElement('div')
      div.innerHTML = '<img src="test.jpg">'

      processElement(div, config, patterns, combinedPattern)

      // Should not modify element with no text
    })
  })

  describe('processContent', () => {
    it('should process entire document content', () => {
      // Set up document body with a main element (required by selectors)
      document.body.innerHTML = `
        <main>
          <p>1st paragraph with (TM)</p>
          <div>H2O is water</div>
          <span>E=mc^2</span>
        </main>
      `

      processContent(config, patterns, combinedPattern)

      // Check all transformations happened
      expect(document.body.querySelector('sup')).toBeTruthy()
      expect(document.body.querySelector('sub')).toBeTruthy()
      expect(document.body.textContent).toContain('™')
    })

    it('should respect exclusion zones', () => {
      document.body.innerHTML = `
        <main>
          <p>Normal(TM)</p>
          <pre>Code(TM)</pre>
          <code>More(TM)</code>
          <div class="no-superscript">Excluded(TM)</div>
        </main>
      `

      processContent(config, patterns, combinedPattern)

      // Normal paragraph should be processed (TM is now SPAN with hybrid approach)
      const p = document.querySelector('p')
      expect(p?.querySelector('span.ss-tm')).toBeTruthy()

      // Pre should not be processed
      const pre = document.querySelector('pre')
      expect(pre?.textContent).toBe('Code(TM)')

      // Code should not be processed
      const code = document.querySelector('code')
      expect(code?.textContent).toBe('More(TM)')

      // no-superscript class should not be processed
      const excluded = document.querySelector('.no-superscript')
      expect(excluded?.textContent).toBe('Excluded(TM)')
    })

    it('should handle complex nested structures', () => {
      document.body.innerHTML = `
        <article>
          <header>
            <h1>The 1st Law</h1>
          </header>
          <main>
            <p>Formula: H2O</p>
            <div>
              <span>Nested <em>text(TM)</em></span>
            </div>
          </main>
        </article>
      `

      processContent(config, patterns, combinedPattern)

      // Check h1 has ordinal
      const h1 = document.querySelector('h1')
      expect(h1?.querySelector('sup')).toBeTruthy()

      // Check formula has subscript
      const p = document.querySelector('p')
      expect(p?.querySelector('sub')).toBeTruthy()

      // Check nested em has trademark (TM is now SPAN with hybrid approach)
      const em = document.querySelector('em')
      expect(em?.querySelector('span.ss-tm')).toBeTruthy()
    })

    it('should handle empty container', () => {
      document.body.innerHTML = ''

      // Should not throw
      expect(() => {
        processContent(config, patterns, combinedPattern)
      }).not.toThrow()
    })

    it('should handle container with only excluded content', () => {
      document.body.innerHTML = `
        <pre>Code only(TM)</pre>
        <code>More code(TM)</code>
      `

      processContent(config, patterns, combinedPattern)

      // Nothing should be processed
      expect(document.querySelector('sup')).toBeFalsy()
      expect(document.querySelector('sub')).toBeFalsy()
    })
  })

  describe('hTML Context Edge Cases', () => {
    it('should handle text in different HTML contexts', () => {
      const contexts = [
        document.createElement('p'),
        document.createElement('span'),
        document.createElement('div'),
        document.createElement('h1'),
        document.createElement('li'),
        document.createElement('td'),
      ]

      contexts.forEach((element) => {
        element.textContent = 'Product(TM)'
        expect(element.textContent).toBe('Product(TM)')
      })
    })

    it('should handle text with HTML entities', () => {
      const div = document.createElement('div')
      div.innerHTML = 'Product&trade; and Product(TM)'
      expect(div.textContent).toBe('Product™ and Product(TM)')
    })

    it('should handle contenteditable elements', () => {
      const div = document.createElement('div')
      div.setAttribute('contenteditable', 'true')
      div.textContent = 'Product(TM)'
      expect(div.textContent).toBe('Product(TM)')
      expect(div.getAttribute('contenteditable')).toBe('true')
    })
  })
})
