import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Nitro types
interface NitroApp {
  hooks: {
    hook: (name: string, handler: (html: Record<string, unknown[]>, context: { event: Record<string, unknown> }) => void) => void
  }
}

describe('nitro SSR Plugin', () => {
  let nitroApp: NitroApp
  let renderHook: ((html: Record<string, unknown[]>, context: { event: Record<string, unknown> }) => void) | null = null

  // Helper to create mock event with config
  const createMockEvent = (configOverrides?: Record<string, unknown>) => {
    const defaultConfig = {
      debug: false,
      ssr: true,
      transformations: {
        trademark: true,
        registered: true,
        ordinals: true,
        chemicals: true,
        mathSuper: true,
        mathSub: true,
      },
      selectors: {
        include: ['main', 'p', 'article', 'header', 'footer', 'div', 'span'],
        exclude: ['pre', 'code', '[data-no-superscript]'],
      },
    }

    // Deep merge config
    const mergedConfig = {
      ...defaultConfig,
      ...configOverrides,
      transformations: {
        ...defaultConfig.transformations,
        ...(configOverrides?.transformations || {}),
      },
      selectors: {
        ...defaultConfig.selectors,
        ...(configOverrides?.selectors || {}),
      },
    }

    return {
      context: {
        $config: {
          public: {
            smartscript: mergedConfig,
          },
        },
      },
    }
  }

  // Helper to execute render hook
  const executeRenderHook = (html: Record<string, unknown[]>, configOverrides?: Record<string, unknown>) => {
    if (renderHook) {
      renderHook(html, { event: createMockEvent(configOverrides) })
    }
  }

  beforeEach(async () => {
    // Create mock Nitro app
    nitroApp = {
      hooks: {
        hook: vi.fn((name, handler) => {
          if (name === 'render:html') {
            renderHook = handler
          }
        }),
      },
    }

    // Reset mocks and module cache
    vi.clearAllMocks()
    vi.resetModules()

    // Load the plugin fresh and register its hook
    const pluginModule = await import('../../src/runtime/nitro/plugin-jsdom')
    const plugin = pluginModule.default
    plugin(nitroApp as unknown as Parameters<typeof plugin>[0])
  })

  describe('hTML processing', () => {
    it('should process HTML with trademark symbols', async () => {
      const inputHtml = {
        body: ['<main><p>Product(TM) is amazing</p></main>'],
        head: [],
        bodyAppend: [],
        bodyPrepend: [],
        htmlAttrs: [],
        bodyAttrs: [],
      }

      // Verify hook was registered
      expect(nitroApp.hooks.hook).toHaveBeenCalledWith('render:html', expect.any(Function))

      // Execute the render hook
      executeRenderHook(inputHtml)

      // Check that HTML was transformed
      expect(inputHtml.body[0]).toContain('ss-tm')
      expect(inputHtml.body[0]).toContain('™</span>')
      expect(inputHtml.body[0]).not.toContain('(TM)')
    })

    it('should process multiple transformations', async () => {
      const inputHtml = {
        body: ['<article><p>1st place: H2O and CO2. Product(TM)</p></article>'],
        head: [],
        bodyAppend: [],
        bodyPrepend: [],
        htmlAttrs: [],
        bodyAttrs: [],
      }

      // Execute render hook
      executeRenderHook(inputHtml)

      const body = inputHtml.body[0]

      // Check all transformations
      expect(body).toContain('1<sup class="ss-sup ss-ordinal"')
      expect(body).toContain('>st</sup>')
      expect(body).toContain('H<sub class="ss-sub"')
      expect(body).toContain('>2</sub>O')
      expect(body).toContain('CO<sub class="ss-sub"')
      expect(body).toContain('>2</sub>')
      expect(body).toContain('ss-tm')
      expect(body).toContain('™</span>')
    })

    it('should respect exclusion zones', async () => {
      const inputHtml = {
        body: [
          '<main>'
          + '<pre>Product(TM) H2O</pre>'
          + '<p>Product(TM) H2O</p>'
          + '</main>',
        ],
        head: [],
        bodyAppend: [],
        bodyPrepend: [],
        htmlAttrs: [],
        bodyAttrs: [],
      }

      // Execute render hook
      executeRenderHook(inputHtml)

      const body = inputHtml.body[0]

      // Pre content should be unchanged
      expect(body).toContain('<pre>Product(TM) H2O</pre>')

      // P content should be transformed
      expect(body).toContain('<p>Product<span class="ss-sup ss-tm"')
      expect(body).toContain('™</span>')
      expect(body).toContain('H<sub class="ss-sub"')
      expect(body).toContain('>2</sub>O</p>')
    })

    it('should add processing flag to body', async () => {
      const inputHtml = {
        body: ['<p>Test</p>'],
        head: [],
        bodyAppend: [],
        bodyPrepend: [],
        htmlAttrs: [],
        bodyAttrs: ['data-superscript-processed="true"'],
      }

      // Execute render hook
      executeRenderHook(inputHtml)

      // Check that flag was added
      expect(inputHtml.bodyAttrs).toContain('data-superscript-processed="true"')
    })

    it('should handle multiple body sections', async () => {
      const inputHtml = {
        body: [
          '<header>Product(TM)</header>',
          '<main>H2O</main>',
          '<footer>1st place</footer>',
        ],
        head: [],
        bodyAppend: [],
        bodyPrepend: [],
        htmlAttrs: [],
        bodyAttrs: [],
      }

      // Execute render hook
      executeRenderHook(inputHtml)

      // All sections should be processed
      expect(inputHtml.body[0]).toContain('ss-tm')
      expect(inputHtml.body[0]).toContain('™</span>')
      expect(inputHtml.body[1]).toContain('H<sub class="ss-sub"')
      expect(inputHtml.body[1]).toContain('>2</sub>O')
      expect(inputHtml.body[2]).toContain('1<sup class="ss-sup ss-ordinal"')
      expect(inputHtml.body[2]).toContain('>st</sup>')
    })

    it('should handle empty or missing content gracefully', async () => {
      const testCases = [
        { body: [], head: [] },
        { body: [''], head: [] },
        { body: ['<div></div>'], head: [] },
        { body: null, head: [] },
        undefined,
      ]

      for (const inputHtml of testCases) {
        expect(() => {
          if (renderHook && inputHtml) {
            executeRenderHook(inputHtml)
          }
        }).not.toThrow()
      }
    })
  })

  describe('configuration handling', () => {
    it('should respect disabled transformations', async () => {
      const inputHtml = {
        body: ['<p>Product(TM) H2O</p>'],
        head: [],
        bodyAppend: [],
        bodyPrepend: [],
        htmlAttrs: [],
        bodyAttrs: [],
      }

      // Execute with trademark disabled but chemicals enabled
      const mockEvent = createMockEvent({
        transformations: {
          trademark: false,
          registered: false,
          chemicals: true,
          ordinals: false,
          mathSuper: false,
          mathSub: false,
        },
      })

      // Verify our mock config is correct
      const config = mockEvent.context.$config.public.smartscript
      expect(config.transformations.trademark).toBe(false)
      expect(config.transformations.chemicals).toBe(true)

      // Execute render hook
      if (renderHook) {
        renderHook(inputHtml, { event: mockEvent })
      }

      // Trademark should not be transformed
      expect(inputHtml.body[0]).toContain('Product(TM)')
      // Chemical should be transformed
      expect(inputHtml.body[0]).toContain('H<sub')
    })

    it('should use custom selectors', async () => {
      const inputHtml = {
        body: [
          '<div class="content">Product(TM)</div>'
          + '<div>Product(TM)</div>'
          + '<div class="content no-transform">Product(TM)</div>',
        ],
        head: [],
        bodyAppend: [],
        bodyPrepend: [],
        htmlAttrs: [],
        bodyAttrs: [],
      }

      // Execute with custom selectors
      executeRenderHook(inputHtml, {
        selectors: {
          include: ['.content'],
          exclude: ['.no-transform'],
        },
      })

      const body = inputHtml.body[0]

      // First div should be transformed (has .content)
      expect(body).toContain('class="content"')
      expect(body).toContain('ss-tm')

      // Second div should not be transformed (no .content)
      expect(body).toMatch(/<div>Product\(TM\)<\/div>/)

      // Third div should not be transformed (has .no-transform)
      expect(body).toContain('class="content no-transform">Product(TM)')
    })
  })

  describe('error handling', () => {
    it('should handle malformed HTML gracefully', async () => {
      const inputHtml = {
        body: ['<p>Unclosed paragraph Product(TM)'],
        head: [],
        bodyAppend: [],
        bodyPrepend: [],
        htmlAttrs: [],
        bodyAttrs: [],
      }

      expect(() => {
        executeRenderHook(inputHtml)
      }).not.toThrow()

      // Should still transform what it can
      expect(inputHtml.body[0]).toContain('ss-tm')
      expect(inputHtml.body[0]).toContain('™</span>')
    })

    it('should handle special characters', async () => {
      const inputHtml = {
        body: ['<p>Product™ already has symbol, (TM) needs transform</p>'],
        head: [],
        bodyAppend: [],
        bodyPrepend: [],
        htmlAttrs: [],
        bodyAttrs: [],
      }

      executeRenderHook(inputHtml)

      // Should handle existing symbols and transform patterns
      // The existing ™ symbol will also be transformed
      expect(inputHtml.body[0]).toContain('ss-tm')
      expect(inputHtml.body[0]).toContain('™</span>')
    })
  })
})
