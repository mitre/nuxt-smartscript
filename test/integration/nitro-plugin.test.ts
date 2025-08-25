import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setMockRuntimeConfig } from '../mocks/imports'

// Mock Nitro types
interface NitroApp {
  hooks: {
    hook: (name: string, handler: (html: Record<string, unknown[]>, context: { event: Record<string, unknown> }) => void) => void
  }
}

describe('nitro SSR Plugin', () => {
  let nitroApp: NitroApp
  let renderHook: ((html: Record<string, unknown[]>, context: { event: Record<string, unknown> }) => void) | null = null

  // Helper to set runtime config
  const setRuntimeConfig = (configOverrides?: Record<string, unknown>) => {
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

    // Set the mock runtime config using the helper
    setMockRuntimeConfig({
      public: {
        smartscript: mergedConfig,
      },
    })

    return mergedConfig
  }

  // Helper to create mock event (still needed for the hook signature)
  const createMockEvent = () => {
    return {
      context: {},
    }
  }

  // Helper to execute render hook
  const executeRenderHook = (html: Record<string, unknown[]>, configOverrides?: Record<string, unknown>) => {
    // Set the runtime config before executing
    setRuntimeConfig(configOverrides)

    if (renderHook) {
      renderHook(html, { event: createMockEvent() })
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

    // Set default runtime config
    setRuntimeConfig()

    // Reset mocks and module cache
    vi.clearAllMocks()
    vi.resetModules()

    // Load the plugin fresh and register its hook
    const pluginModule = await import('../../src/runtime/nitro/plugin')
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

    it('should add processing marker to head', async () => {
      const inputHtml = {
        body: ['<p>Product(TM)</p>'],
        head: [],
        bodyAppend: [],
        bodyPrepend: [],
        htmlAttrs: [],
        bodyAttrs: [],
      }

      // Execute render hook
      executeRenderHook(inputHtml)

      // Check that marker was added to head
      expect(inputHtml.head).toContain('<meta name="smartscript-processed" content="true">')
    })

    it('should skip processing when SSR is disabled', async () => {
      const inputHtml = {
        body: ['<p>Product(TM) H2O</p>'],
        head: [],
        bodyAppend: [],
        bodyPrepend: [],
        htmlAttrs: [],
        bodyAttrs: [],
      }

      // Execute with SSR disabled
      executeRenderHook(inputHtml, { ssr: false })

      // Nothing should be transformed
      expect(inputHtml.body[0]).toBe('<p>Product(TM) H2O</p>')
      expect(inputHtml.head).toEqual([])
    })

    it('should skip already processed content', async () => {
      const inputHtml = {
        body: ['<p>Product(TM)</p>'],
        head: ['<meta name="smartscript-processed" content="true">'],
        bodyAppend: [],
        bodyPrepend: [],
        htmlAttrs: [],
        bodyAttrs: [],
      }

      // Execute render hook
      executeRenderHook(inputHtml)

      // Content should not be reprocessed
      expect(inputHtml.body[0]).toBe('<p>Product(TM)</p>')
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
      const testCases: Array<Record<string, unknown[]> | undefined> = [
        { body: [], head: [] },
        { body: [''], head: [] },
        { body: ['<div></div>'], head: [] },
        { body: [] as unknown[], head: [] }, // Empty array instead of null
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
    it('should add CSS variables when configured', async () => {
      const inputHtml = {
        body: ['<p>Product(TM)</p>'],
        head: [],
        bodyAppend: [],
        bodyPrepend: [],
        htmlAttrs: [],
        bodyAttrs: [],
      }

      // Execute with CSS variables
      executeRenderHook(inputHtml, {
        cssVariables: {
          'tm-size': '0.7em',
          'reg-size': '0.7em',
          'ordinal-size': '0.8em',
        },
      })

      // Check that CSS variables were added to head
      const hasStyleTag = inputHtml.head.some((item: unknown) =>
        typeof item === 'string' && item.includes('<style>:root { --ss-tm-size: 0.7em; --ss-reg-size: 0.7em; --ss-ordinal-size: 0.8em; }</style>'),
      )
      expect(hasStyleTag).toBe(true)
    })

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
      const config = setRuntimeConfig({
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
      expect(config.transformations.trademark).toBe(false)
      expect(config.transformations.chemicals).toBe(true)

      // Execute render hook
      if (renderHook) {
        renderHook(inputHtml, { event: createMockEvent() })
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
