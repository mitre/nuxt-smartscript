/**
 * Test setup helpers for nuxt-smartscript
 * Provides reusable fixtures and utilities for tests
 */

import type { SuperscriptConfig } from '../../src/runtime/smartscript/types'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { DEFAULT_CONFIG } from '../../src/runtime/smartscript/config'

/**
 * Creates a JSDOM environment for unit/integration tests
 */
export function setupDOM(html = '<!DOCTYPE html><html><head></head><body></body></html>') {
  const dom = new JSDOM(html)
  const { window } = dom
  const { document } = window

  // Set up globals - using any is intentional for test mocking
  /* eslint-disable ts/no-explicit-any */
  global.document = document as any
  global.window = window as any
  global.NodeFilter = window.NodeFilter
  global.HTMLElement = window.HTMLElement as any
  global.Element = window.Element as any
  global.Node = window.Node as any
  /* eslint-enable ts/no-explicit-any */

  return { dom, document, window }
}

/**
 * Clean up DOM globals after tests
 */
export function cleanupDOM() {
  // Clean up globals - using any is intentional for test cleanup
  /* eslint-disable ts/no-explicit-any */
  delete (global as any).document
  delete (global as any).window
  delete (global as any).NodeFilter
  delete (global as any).HTMLElement
  delete (global as any).Element
  delete (global as any).Node
  /* eslint-enable ts/no-explicit-any */
}

/**
 * Create a test element with content
 */
export function createTestElement(content: string, tagName = 'div'): HTMLElement {
  const element = document.createElement(tagName)
  element.textContent = content
  document.body.appendChild(element)
  return element
}

/**
 * Get playground directory path for E2E tests
 */
export function getPlaygroundPath() {
  return fileURLToPath(new URL('../../playground', import.meta.url))
}

/**
 * Get test fixtures directory path
 */
export function getFixturesPath() {
  return fileURLToPath(new URL('../fixtures', import.meta.url))
}

/**
 * Create a test config with overrides
 */
export function createTestConfig(overrides: Partial<SuperscriptConfig> = {}): SuperscriptConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    symbols: {
      ...DEFAULT_CONFIG.symbols,
      ...(overrides.symbols || {}),
    },
    performance: {
      ...DEFAULT_CONFIG.performance,
      ...(overrides.performance || {}),
    },
    cssVariables: {
      ...DEFAULT_CONFIG.cssVariables,
      ...(overrides.cssVariables || {}),
    },
  }
}

/**
 * Wait for DOM mutations (useful for testing MutationObserver)
 */
export function waitForMutations(timeout = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout))
}

/**
 * Count transformed elements in the DOM
 */
export function countTransformedElements() {
  return {
    total: document.querySelectorAll('[class^="ss-"]').length,
    trademarks: document.querySelectorAll('.ss-tm').length,
    registered: document.querySelectorAll('.ss-reg').length,
    superscripts: document.querySelectorAll('.ss-sup').length,
    subscripts: document.querySelectorAll('.ss-sub').length,
    math: document.querySelectorAll('.ss-math').length,
    ordinals: document.querySelectorAll('.ss-ord').length,
    chemicals: document.querySelectorAll('.ss-chem').length,
  }
}
