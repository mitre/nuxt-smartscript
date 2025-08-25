import type { SuperscriptConfig } from '../../src/runtime/smartscript/types'
import { JSDOM } from 'jsdom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { processElement } from '../../src/runtime/smartscript/engine'
import { createCombinedPattern, createPatterns } from '../../src/runtime/smartscript/patterns'

describe('sSR with jsdom', () => {
  let dom: JSDOM
  let document: Document
  let window: Window

  beforeEach(() => {
    // Create a new jsdom instance for each test
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    document = dom.window.document
    window = dom.window as unknown as Window

    // Make jsdom globals available
    global.document = document as unknown as Document
    global.window = window as unknown as Window & typeof globalThis
    // @ts-expect-error - NodeFilter exists on jsdom window
    global.NodeFilter = window.NodeFilter as unknown as typeof NodeFilter
    // @ts-expect-error - HTMLElement exists on jsdom window
    global.HTMLElement = window.HTMLElement as unknown as typeof HTMLElement
  })

  afterEach(() => {
    // Clean up globals
    delete (global as Record<string, unknown>).document
    delete (global as Record<string, unknown>).window
    delete (global as Record<string, unknown>).NodeFilter
    delete (global as Record<string, unknown>).HTMLElement
  })

  // Helper function to create test config
  const createTestConfig = (overrides?: Partial<SuperscriptConfig>): SuperscriptConfig => ({
    symbols: { trademark: ['(TM)', '™'], registered: ['(R)', '®'], copyright: ['(C)', '©'], ordinals: true },
    selectors: { include: ['body', 'p', 'div', 'span'], exclude: ['pre', 'code', '[data-no-superscript]'] },
    performance: { debounce: 100, batchSize: 50, delay: 0 },
    positioning: {},
    transformations: {
      trademark: true,
      registered: true,
      ordinals: true,
      chemicals: true,
      mathSuper: true,
      mathSub: true,
    },
    ...overrides,
  })

  describe('basic transformations', () => {
    it('should transform trademark symbols', () => {
      const html = '<p>Product(TM) is amazing</p>'
      document.body.innerHTML = html

      const config = createTestConfig()
      const patterns = createPatterns(config)
      const pattern = createCombinedPattern(patterns, config)

      const element = document.querySelector('p')
      if (element) {
        processElement(element, config, patterns, pattern)
      }

      const result = document.body.innerHTML
      // Trademark uses <span> with ss-sup and ss-tm classes
      expect(result).toContain('<span class="ss-sup ss-tm" aria-label="trademark">™</span>')
      expect(result).not.toContain('(TM)')
    })

    it('should transform registered symbols', () => {
      const html = '<p>Company(R) incorporated</p>'
      document.body.innerHTML = html

      const config = createTestConfig()
      const patterns = createPatterns(config)
      const pattern = createCombinedPattern(patterns, config)

      const element = document.querySelector('p')
      if (element) {
        processElement(element, config, patterns, pattern)
      }

      const result = document.body.innerHTML
      // Registered uses <span> with ss-sup and ss-reg classes
      expect(result).toContain('<span class="ss-sup ss-reg" aria-label="registered">®</span>')
      expect(result).not.toContain('(R)')
    })

    it('should transform chemical formulas', () => {
      const html = '<p>Water is H2O and carbon dioxide is CO2</p>'
      document.body.innerHTML = html

      const config = createTestConfig()
      const patterns = createPatterns(config)
      const pattern = createCombinedPattern(patterns, config)

      const element = document.querySelector('p')
      if (element) {
        processElement(element, config, patterns, pattern)
      }

      const result = document.body.innerHTML
      // Chemicals use <sub> with ss-sub class
      expect(result).toContain('H<sub class="ss-sub" aria-label="2">2</sub>O')
      expect(result).toContain('CO<sub class="ss-sub" aria-label="2">2</sub>')
    })

    it('should transform ordinals', () => {
      const html = '<p>1st place, 2nd place, 3rd place, 4th place</p>'
      document.body.innerHTML = html

      const config = createTestConfig()
      const patterns = createPatterns(config)
      const pattern = createCombinedPattern(patterns, config)

      const element = document.querySelector('p')
      if (element) {
        processElement(element, config, patterns, pattern)
      }

      const result = document.body.innerHTML
      // Ordinals use <sup> with ss-sup and ss-ordinal classes
      expect(result).toContain('1<sup class="ss-sup ss-ordinal" aria-label="st">st</sup>')
      expect(result).toContain('2<sup class="ss-sup ss-ordinal" aria-label="nd">nd</sup>')
      expect(result).toContain('3<sup class="ss-sup ss-ordinal" aria-label="rd">rd</sup>')
      expect(result).toContain('4<sup class="ss-sup ss-ordinal" aria-label="th">th</sup>')
    })
  })

  describe('exclusion zones', () => {
    it('should not transform content in pre elements', () => {
      const html = '<pre>Product(TM) H2O 1st</pre><p>Product(TM) H2O 1st</p>'
      document.body.innerHTML = html

      const config = createTestConfig()
      const patterns = createPatterns(config)
      const pattern = createCombinedPattern(patterns, config)

      processElement(document.body, config, patterns, pattern)

      // Pre content should remain unchanged
      const preContent = document.querySelector('pre')?.innerHTML
      expect(preContent).toBe('Product(TM) H2O 1st')

      // P content should be transformed
      const pContent = document.querySelector('p')?.innerHTML || ''
      expect(pContent).toContain('<span class="ss-sup ss-tm" aria-label="trademark">™</span>')
      expect(pContent).toContain('H<sub class="ss-sub"')
      expect(pContent).toContain('>2</sub>O')
      expect(pContent).toContain('1<sup class="ss-sup ss-ordinal"')
      expect(pContent).toContain('>st</sup>')
    })

    it('should not transform content in code elements', () => {
      const html = '<code>Product(TM)</code><span>Product(TM)</span>'
      document.body.innerHTML = html

      const config = createTestConfig()
      const patterns = createPatterns(config)
      const pattern = createCombinedPattern(patterns, config)

      processElement(document.body, config, patterns, pattern)

      // Code content should remain unchanged
      const codeContent = document.querySelector('code')?.innerHTML
      expect(codeContent).toBe('Product(TM)')

      // Span content should be transformed (the outer span, not the generated one)
      const spanContent = document.querySelector('body > span')?.innerHTML || ''
      expect(spanContent).toContain('<span class="ss-sup ss-tm" aria-label="trademark">™</span>')
    })

    it('should not transform content with data-no-superscript attribute', () => {
      const html = '<div data-no-superscript>Product(TM) H2O</div><div>Product(TM) H2O</div>'
      document.body.innerHTML = html

      const config = createTestConfig()
      const patterns = createPatterns(config)
      const pattern = createCombinedPattern(patterns, config)

      processElement(document.body, config, patterns, pattern)

      const divs = document.querySelectorAll('div')

      // First div with data-no-superscript should remain unchanged
      expect(divs[0]!.innerHTML).toBe('Product(TM) H2O')

      // Second div should be transformed
      expect(divs[1]!.innerHTML).toContain('<span class="ss-sup ss-tm" aria-label="trademark">™</span>')
      expect(divs[1]!.innerHTML).toContain('H<sub class="ss-sub"')
      expect(divs[1]!.innerHTML).toContain('>2</sub>O')
    })

    it('should not transform nested exclusions', () => {
      const html = '<div data-no-superscript><p>Product(TM) <span>H2O</span></p></div>'
      document.body.innerHTML = html

      const config = createTestConfig()
      const patterns = createPatterns(config)
      const pattern = createCombinedPattern(patterns, config)

      processElement(document.body, config, patterns, pattern)

      // All content inside data-no-superscript should remain unchanged
      const div = document.querySelector('div[data-no-superscript]')
      expect(div?.innerHTML).toBe('<p>Product(TM) <span>H2O</span></p>')
    })
  })

  describe('edge cases', () => {
    it('should not transform standalone TM', () => {
      const html = '<p>TM should not transform but (TM) should</p>'
      document.body.innerHTML = html

      const config = createTestConfig()
      const patterns = createPatterns(config)
      const pattern = createCombinedPattern(patterns, config)

      const element = document.querySelector('p')
      if (element) {
        processElement(element, config, patterns, pattern)
      }

      const result = document.querySelector('p')?.innerHTML || ''
      expect(result).toContain('TM should not transform')
      expect(result).toContain('<span class="ss-sup ss-tm" aria-label="trademark">™</span>')
      expect(result).not.toContain('(TM)')
    })

    it('should transform H2O after uppercase letters', () => {
      const html = '<p>Chemistry context: H2O has subscript</p>'
      document.body.innerHTML = html

      const config = createTestConfig()
      const patterns = createPatterns(config)
      const pattern = createCombinedPattern(patterns, config)

      const element = document.querySelector('p')
      if (element) {
        processElement(element, config, patterns, pattern)
      }

      const result = document.querySelector('p')?.innerHTML || ''
      expect(result).toContain('H<sub class="ss-sub" aria-label="2">2</sub>O')
    })

    it('should not transform file_name pattern', () => {
      const html = '<p>The file_name should not transform but x_1 should</p>'
      document.body.innerHTML = html

      const config = createTestConfig()
      const patterns = createPatterns(config)
      const pattern = createCombinedPattern(patterns, config)

      const element = document.querySelector('p')
      if (element) {
        processElement(element, config, patterns, pattern)
      }

      const result = document.querySelector('p')?.innerHTML || ''
      expect(result).toContain('file_name')
      expect(result).not.toContain('file<sub>')
      expect(result).toContain('x<sub class="ss-sub" aria-label="subscript 1">1</sub>')
    })

    it('should handle apostrophes correctly', () => {
      const html = `<p>Einstein's theory</p>`
      document.body.innerHTML = html

      const config = createTestConfig()
      const patterns = createPatterns(config)
      const pattern = createCombinedPattern(patterns, config)

      const element = document.querySelector('p')
      if (element) {
        processElement(element, config, patterns, pattern)
      }

      const result = document.querySelector('p')?.innerHTML || ''
      expect(result).toBe(`Einstein's theory`)
      expect(result).not.toContain('&#39;')
      expect(result).not.toContain('&apos;')
    })
  })

  describe('double processing prevention', () => {
    it('should not process already transformed elements', () => {
      const html = '<p>Product<span class="ss-tm">™</span> is great</p>'
      document.body.innerHTML = html

      const config = createTestConfig()
      const patterns = createPatterns(config)
      const pattern = createCombinedPattern(patterns, config)

      const element = document.querySelector('p')

      // Process once
      if (element) {
        processElement(element, config, patterns, pattern)
      }

      const afterFirst = document.querySelector('p')?.innerHTML || ''

      // Process again
      if (element) {
        processElement(element, config, patterns, pattern)
      }

      const afterSecond = document.querySelector('p')?.innerHTML || ''

      // Should be identical after both passes
      expect(afterFirst).toBe(afterSecond)
      // Should only have one trademark symbol
      expect((afterSecond.match(/ss-tm/g) || []).length).toBe(1)
    })

    it('should detect server-processed flag', () => {
      const html = '<body data-superscript-processed="true"><p>Product(TM)</p></body>'
      document.body.outerHTML = html

      // Check if element should be processed
      const body = document.querySelector('body')
      if (body?.hasAttribute('data-superscript-processed')) {
        expect(body.getAttribute('data-superscript-processed')).toBe('true')
      }
    })
  })
})
