/**
 * Test configuration values
 * These should match what's in playground/nuxt.config.ts
 * This allows tests to verify config passthrough without hardcoding values
 */

export const testConfig = {
  debug: true,
  cssVariables: {
    'sup-top': '0.08em',
    'sup-font-size': '0.75em',
    'tm-top': '-0.4em',
  },
}

// Helper to get expected CSS variable value
export function getExpectedCssVar(name: string): string {
  return testConfig.cssVariables[name as keyof typeof testConfig.cssVariables] || ''
}
