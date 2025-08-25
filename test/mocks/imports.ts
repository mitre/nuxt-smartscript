/**
 * Mock for #imports module used in tests
 */

// Default mock runtime config
let mockRuntimeConfig: Record<string, unknown> = {
  public: {
    smartscript: {
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
    },
  },
}

/**
 * Mock useRuntimeConfig function
 * Can be overridden in tests by setting global.__mockRuntimeConfig
 */
export function useRuntimeConfig() {
  // Allow tests to override the config
  if (typeof global !== 'undefined' && (global as any).__mockRuntimeConfig) {
    return (global as any).__mockRuntimeConfig
  }
  return mockRuntimeConfig
}

/**
 * Helper to set mock runtime config for tests
 */
export function setMockRuntimeConfig(config: Record<string, unknown>) {
  mockRuntimeConfig = config
  if (typeof global !== 'undefined') {
    (global as any).__mockRuntimeConfig = config
  }
}
