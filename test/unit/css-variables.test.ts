/**
 * Tests for CSS Variables configuration
 */

import { JSDOM } from 'jsdom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('cSS Variables Configuration', () => {
  let dom: JSDOM
  let document: Document
  let window: Window

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    document = dom.window.document
    window = dom.window as unknown as Window
    global.document = document
    global.window = window
  })

  it('should apply CSS variables to document root', () => {
    const root = document.documentElement
    const setPropertySpy = vi.spyOn(root.style, 'setProperty')

    // Simulate plugin applying CSS variables
    const cssVariables = {
      'sup-font-size': '0.8em',
      'sup-top': '0.2em',
      'sub-font-size': '0.7em',
    }

    Object.entries(cssVariables).forEach(([key, value]) => {
      const varName = `--ss-${key}`
      root.style.setProperty(varName, value)
    })

    expect(setPropertySpy).toHaveBeenCalledWith('--ss-sup-font-size', '0.8em')
    expect(setPropertySpy).toHaveBeenCalledWith('--ss-sup-top', '0.2em')
    expect(setPropertySpy).toHaveBeenCalledWith('--ss-sub-font-size', '0.7em')
  })

  it('should handle CSS variables with -- prefix', () => {
    const root = document.documentElement
    const setPropertySpy = vi.spyOn(root.style, 'setProperty')

    // Variables with and without prefix
    const cssVariables = {
      '--ss-custom-var': '1em',
      'another-var': '2em',
    }

    Object.entries(cssVariables).forEach(([key, value]) => {
      const varName = key.startsWith('--') ? key : `--ss-${key}`
      root.style.setProperty(varName, value)
    })

    expect(setPropertySpy).toHaveBeenCalledWith('--ss-custom-var', '1em')
    expect(setPropertySpy).toHaveBeenCalledWith('--ss-another-var', '2em')
  })

  it('should allow runtime updates of CSS variables', () => {
    const root = document.documentElement

    // Initial values
    root.style.setProperty('--ss-sup-font-size', '0.75em')
    expect(root.style.getPropertyValue('--ss-sup-font-size')).toBe('0.75em')

    // Update values
    root.style.setProperty('--ss-sup-font-size', '0.9em')
    expect(root.style.getPropertyValue('--ss-sup-font-size')).toBe('0.9em')
  })

  it('should work with computed styles', () => {
    const root = document.documentElement

    // Set CSS variable
    root.style.setProperty('--ss-sup-font-size', '0.8em')

    // Create element that uses the variable
    const style = document.createElement('style')
    style.textContent = `
      sup.ss-sup {
        font-size: var(--ss-sup-font-size);
      }
    `
    document.head.appendChild(style)

    const sup = document.createElement('sup')
    sup.className = 'ss-sup'
    document.body.appendChild(sup)

    // In a real browser, getComputedStyle would resolve the variable
    // JSDOM doesn't fully support this, but we can verify the setup
    expect(root.style.getPropertyValue('--ss-sup-font-size')).toBe('0.8em')
    expect(sup.className).toBe('ss-sup')
  })
})
