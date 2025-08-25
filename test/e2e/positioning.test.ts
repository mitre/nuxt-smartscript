/**
 * E2E test for CSS positioning of TM/R symbols
 * Verifies that positioning actually works in a real browser environment
 */

// @vitest-environment node
import { fileURLToPath } from 'node:url'
import { createPage, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

describe('e2E Positioning Tests', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground', import.meta.url)),
    browser: true,
    dev: true,
  })

  it('should position TM symbols using SPAN with CSS variables', async () => {
    const page = await createPage('/')

    // Wait for content to be processed
    await page.waitForTimeout(500)

    // Check that TM elements are SPAN
    const tmElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('.ss-tm')
      return Array.from(elements).map((el) => ({
        tagName: el.tagName,
        className: el.className,
        hasPosition: window.getComputedStyle(el).position === 'relative',
        topValue: window.getComputedStyle(el).top,
      }))
    })

    expect(tmElements.length).toBeGreaterThan(0)
    tmElements.forEach((tm) => {
      expect(tm.tagName).toBe('SPAN')
      expect(tm.className).toContain('ss-tm')
      expect(tm.hasPosition).toBe(true)
      // Should have a top value (not 'auto')
      expect(tm.topValue).not.toBe('auto')
    })
  })

  it('should use SUP elements for math expressions', async () => {
    const page = await createPage('/')

    // Wait for content to be processed
    await page.waitForTimeout(500)

    // Check math elements
    const mathElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('.ss-math')
      return Array.from(elements).map((el) => ({
        tagName: el.tagName,
        className: el.className,
        verticalAlign: window.getComputedStyle(el).verticalAlign,
      }))
    })

    if (mathElements.length > 0) {
      mathElements.forEach((math) => {
        expect(math.tagName).toBe('SUP')
        expect(math.className).toContain('ss-math')
        expect(math.verticalAlign).toBe('super')
      })
    }
  })

  it('should use SUB elements for chemical formulas', async () => {
    const page = await createPage('/')

    // Wait for content to be processed
    await page.waitForTimeout(500)

    // Check subscript elements
    const subElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('.ss-sub')
      return Array.from(elements).map((el) => ({
        tagName: el.tagName,
        className: el.className,
        verticalAlign: window.getComputedStyle(el).verticalAlign,
      }))
    })

    if (subElements.length > 0) {
      subElements.forEach((sub) => {
        expect(sub.tagName).toBe('SUB')
        expect(sub.className).toBe('ss-sub')
        expect(sub.verticalAlign).toBe('sub')
      })
    }
  })

  it('should apply CSS variables to TM positioning', async () => {
    const page = await createPage('/')

    // Apply CSS variables
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--ss-tm-top', '-0.5em')
    })

    // Wait for styles to apply
    await page.waitForTimeout(100)

    // Check that TM elements use the CSS variable
    const tmPosition = await page.evaluate(() => {
      const tm = document.querySelector('.ss-tm')
      if (!tm)
        return null
      const styles = window.getComputedStyle(tm)
      return {
        top: styles.top,
        position: styles.position,
      }
    })

    if (tmPosition) {
      expect(tmPosition.position).toBe('relative')
      // The computed value should reflect the CSS variable
      expect(tmPosition.top).toBeTruthy()
      expect(tmPosition.top).not.toBe('auto')
    }
  })

  it('should maintain semantic HTML for accessibility', async () => {
    const page = await createPage('/')

    // Wait for content to be processed
    await page.waitForTimeout(500)

    // Check ARIA labels
    const ariaLabels = await page.evaluate(() => {
      const results = {
        tm: [] as string[],
        math: [] as string[],
        chemical: [] as string[],
      }

      // Check TM elements
      document.querySelectorAll('.ss-tm').forEach((el) => {
        const label = el.getAttribute('aria-label')
        if (label)
          results.tm.push(label)
      })

      // Check math elements
      document.querySelectorAll('.ss-math').forEach((el) => {
        const label = el.getAttribute('aria-label')
        if (label)
          results.math.push(label)
      })

      // Check chemical elements
      document.querySelectorAll('.ss-sub').forEach((el) => {
        const label = el.getAttribute('aria-label')
        if (label)
          results.chemical.push(label)
      })

      return results
    })

    // Verify appropriate ARIA labels
    ariaLabels.tm.forEach((label) => {
      expect(label).toBe('trademark')
    })

    ariaLabels.math.forEach((label) => {
      expect(label).toContain('superscript')
    })
  })
})
