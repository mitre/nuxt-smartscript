# End-to-End (E2E) Tests

## Overview

E2E tests verify the complete module behavior in a real browser environment using Playwright. These tests ensure that CSS positioning, hydration, and browser-specific behaviors work correctly.

## Location

E2E tests are in `test/e2e/`:

```
test/e2e/
├── basic.test.ts           # Module loading and basic functionality
├── positioning.test.ts     # CSS positioning in real browser
└── nuxt-config-flow.test.ts # Configuration from nuxt.config to DOM
```

## Prerequisites

### Install Playwright Browsers

```bash
# Install Chromium (required for CI)
pnpm exec playwright-core install chromium

# Or install all browsers for local testing
pnpm exec playwright install
```

## Running E2E Tests

```bash
# Run all E2E tests
npx vitest run test/e2e

# Run with headed browser (see what's happening)
HEADED=true npx vitest run test/e2e

# Run specific test
npx vitest run test/e2e/positioning.test.ts

# Debug mode
PWDEBUG=1 npx vitest run test/e2e
```

## What We Test

### Module Loading (`basic.test.ts`)

Tests that the module loads correctly in Nuxt:

```typescript
describe('Module loading', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../fixtures/basic', import.meta.url)),
  })

  it('renders the index page', async () => {
    const html = await $fetch('/')
    expect(html).toContain('<div>basic</div>')
  })

  it('loads SmartScript module', async () => {
    const html = await $fetch('/')
    expect(html).toContain('ss-sup')
  })
})
```

### CSS Positioning (`positioning.test.ts`)

Tests actual browser rendering and positioning:

```typescript
test('trademark positioning', async ({ page }) => {
  await page.goto('/test')
  
  // Wait for processing
  await page.waitForSelector('.ss-tm')
  
  // Check computed styles
  const tm = await page.locator('.ss-tm').first()
  const styles = await tm.evaluate(el => {
    const computed = window.getComputedStyle(el)
    return {
      position: computed.position,
      top: computed.top,
      fontSize: computed.fontSize
    }
  })
  
  expect(styles.position).toBe('relative')
  expect(styles.top).toBe('-0.4em')
})
```

### Configuration Flow (`nuxt-config-flow.test.ts`)

Tests that configuration propagates correctly:

```typescript
test('CSS variables from config', async ({ page }) => {
  // Start Nuxt with custom config
  const nuxt = await setup({
    nuxtConfig: {
      smartscript: {
        cssVariables: {
          'tm-top': '-0.6em'
        }
      }
    }
  })

  await page.goto('/')
  
  // Check CSS variable is applied
  const root = await page.locator(':root')
  const cssVar = await root.evaluate(() => 
    getComputedStyle(document.documentElement)
      .getPropertyValue('--ss-tm-top')
  )
  
  expect(cssVar).toBe('-0.6em')
})
```

## Browser-Specific Testing

### Hydration Testing

```typescript
test('no hydration mismatch', async ({ page }) => {
  const errors: string[] = []
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  
  // Check for hydration errors
  const hydrationErrors = errors.filter(e => 
    e.includes('Hydration') || e.includes('mismatch')
  )
  
  expect(hydrationErrors).toHaveLength(0)
})
```

### Visual Regression

```typescript
test('visual appearance', async ({ page }) => {
  await page.goto('/showcase')
  await page.waitForSelector('.ss-sup')
  
  // Take screenshot for visual comparison
  await expect(page).toHaveScreenshot('showcase.png', {
    fullPage: true,
    animations: 'disabled'
  })
})
```

### Performance Testing

```typescript
test('processing performance', async ({ page }) => {
  await page.goto('/large-document')
  
  // Measure processing time
  const processingTime = await page.evaluate(() => {
    const start = performance.now()
    // Trigger processing
    window.$smartscript.processAll()
    return performance.now() - start
  })
  
  expect(processingTime).toBeLessThan(1000) // Under 1 second
})
```

## Playwright Configuration

E2E tests use specific Playwright settings:

```typescript
import { chromium, type Page } from 'playwright-core'

let browser: Browser
let page: Page

beforeAll(async () => {
  browser = await chromium.launch({
    headless: !process.env.HEADED
  })
})

beforeEach(async () => {
  page = await browser.newPage()
})

afterEach(async () => {
  await page.close()
})

afterAll(async () => {
  await browser.close()
})
```

## Test Fixtures

E2E tests use fixtures in `test/fixtures/`:

```
test/fixtures/
└── basic/
    ├── nuxt.config.ts
    ├── app.vue
    └── pages/
        └── index.vue
```

Example fixture:

```vue
<!-- test/fixtures/basic/app.vue -->
<template>
  <div>
    <h1>Test Page</h1>
    <p>H2O and CO2 at 25°C</p>
    <p>Product(TM) and Company(R)</p>
    <p>E=mc^2 where c is speed of light</p>
  </div>
</template>
```

## Best Practices

### 1. Use Page Objects

Create reusable page objects:

```typescript
class SmartScriptPage {
  constructor(private page: Page) {}
  
  async goto(path = '/') {
    await this.page.goto(path)
    await this.waitForProcessing()
  }
  
  async waitForProcessing() {
    await this.page.waitForSelector('.ss-sup, .ss-sub', {
      timeout: 5000
    })
  }
  
  async getTransformedElements() {
    return this.page.$$('.ss-sup, .ss-sub')
  }
}
```

### 2. Test User Interactions

```typescript
test('interactive elements remain clickable', async ({ page }) => {
  await page.goto('/')
  
  // Add button with trademark
  await page.evaluate(() => {
    const btn = document.createElement('button')
    btn.textContent = 'Click Me(TM)'
    btn.onclick = () => alert('Clicked!')
    document.body.appendChild(btn)
  })
  
  // Wait for processing
  await page.waitForSelector('.ss-tm')
  
  // Button should still be clickable
  page.on('dialog', dialog => dialog.accept())
  await page.click('button')
})
```

### 3. Test Multiple Browsers

```typescript
const browsers = ['chromium', 'firefox', 'webkit']

browsers.forEach(browserName => {
  test.describe(`${browserName}`, () => {
    // Browser-specific tests
  })
})
```

## Debugging E2E Tests

### Visual Debugging

```bash
# Run with headed browser
HEADED=true npx vitest run test/e2e

# Use Playwright Inspector
PWDEBUG=1 npx vitest run test/e2e

# Slow down execution
SLOW_MO=1000 npx vitest run test/e2e
```

### Console Logging

```typescript
test('debug example', async ({ page }) => {
  // Log all console messages
  page.on('console', msg => console.log('PAGE:', msg.text()))
  
  // Log network requests
  page.on('request', req => console.log('REQUEST:', req.url()))
  
  await page.goto('/')
})
```

### Screenshots on Failure

```typescript
test('with screenshot', async ({ page }) => {
  try {
    await page.goto('/')
    // Test logic
  } catch (error) {
    await page.screenshot({ 
      path: `test-failure-${Date.now()}.png` 
    })
    throw error
  }
})
```

## CI/CD Integration

Our GitHub Actions workflow includes:

```yaml
- name: Install Playwright
  run: pnpm exec playwright-core install chromium

- name: Test E2E
  run: npx vitest run test/e2e
```

## Performance Considerations

E2E tests are the slowest but most realistic:
- Average runtime: 1-3 seconds per test
- Run in CI on every push
- Use parallelization when possible
- Cache browser installations
- Run critical paths only in CI, full suite nightly