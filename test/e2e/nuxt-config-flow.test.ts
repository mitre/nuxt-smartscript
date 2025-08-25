/**
 * REAL Integration test for Nuxt module configuration flow
 * Tests that cssVariables and other config actually passes from nuxt.config.ts to the DOM
 */

// @vitest-environment node
import { fileURLToPath } from 'node:url'
import { createPage, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { testConfig } from '../fixtures/test-config'

// Setup test environment once before all tests
await setup({
  rootDir: fileURLToPath(new URL('../../playground', import.meta.url)),
  browser: true,
  dev: false, // Build and serve for CI/CD compatibility
  setupTimeout: 120000, // 2 minute timeout for setup
})

describe('nuxt Module Config Flow', () => {
  it('should pass cssVariables from nuxt.config to DOM', async () => {
    const page = await createPage('/')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Wait for Nuxt to be ready (with timeout and better error handling)
    await page.waitForFunction(() => typeof window !== 'undefined', { timeout: 5000 })

    // Check that CSS variables are applied (don't rely on $nuxt in production)
    // The plugin should have applied the CSS variables from config

    const cssVars = await page.evaluate(() => {
      const root = document.documentElement
      const styles = getComputedStyle(root)
      return {
        supTop: styles.getPropertyValue('--ss-sup-top'),
        supFontSize: styles.getPropertyValue('--ss-sup-font-size'),
        tmTop: styles.getPropertyValue('--ss-tm-top'),
      }
    })

    // Check that CSS variables from config are applied
    // These values come from test-config.ts which should match playground/nuxt.config.ts
    expect(cssVars.supTop).toBe(testConfig.cssVariables['sup-top'])
    expect(cssVars.supFontSize).toBe(testConfig.cssVariables['sup-font-size'])
    expect(cssVars.tmTop).toBe(testConfig.cssVariables['tm-top'])

    // Add test content and verify transformation
    await page.evaluate(() => {
      const testDiv = document.createElement('div')
      testDiv.id = 'test-content'
      testDiv.textContent = 'Product(TM) is great!'
      document.body.appendChild(testDiv)
    })

    // Wait for transformation
    await page.waitForTimeout(200)

    // Check that TM was transformed and has correct styles
    const tmElement = await page.evaluate(() => {
      const tm = document.querySelector('.ss-tm')
      if (!tm)
        return null
      const styles = getComputedStyle(tm)
      return {
        exists: true,
        className: tm.className,
        tagName: tm.tagName.toLowerCase(),
        position: styles.position,
        top: styles.top,
      }
    })

    expect(tmElement).toBeTruthy()
    expect(tmElement?.exists).toBe(true)
    expect(tmElement?.className).toContain('ss-tm')
    expect(tmElement?.tagName).toBe('span') // Using SPAN for TM (hybrid approach)
  }, 10000)

  it('should pass debug flag from config', async () => {
    // Set up console log capture before creating page
    const consoleLogs: string[] = []

    const page = await createPage('/')

    page.on('console', (msg) => {
      if (msg.type() === 'log' || msg.type() === 'info' || msg.type() === 'debug') {
        consoleLogs.push(msg.text())
      }
    })

    // Reload to ensure we capture initialization logs
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Debug mode should produce console logs from the logger when debug:true
    const hasDebugLogs = testConfig.debug
      ? consoleLogs.some((log) =>
          log.includes('Plugin initializing')
          || log.includes('Processing')
          || log.includes('config')
          || log.includes('Pattern'),
        )
      : consoleLogs.every((log) =>
          !log.includes('Plugin initializing')
          && !log.includes('Processing'),
        )

    expect(hasDebugLogs).toBe(testConfig.debug)
  }, 10000)

  it('should apply transformations based on config', async () => {
    const page = await createPage('/')

    await page.waitForLoadState('networkidle')

    // Check that transformations are happening
    const transformedElements = await page.evaluate(() => {
      // Count transformed elements
      return {
        trademarks: document.querySelectorAll('.ss-tm').length,
        hasTransformations: document.querySelectorAll('[class^="ss-"]').length > 0,
      }
    })

    // The page has TM symbols that should be transformed
    expect(transformedElements.trademarks).toBeGreaterThan(0)
    expect(transformedElements.hasTransformations).toBe(true)
  }, 10000)
})
