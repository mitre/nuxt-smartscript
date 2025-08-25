# Testing Architecture

## Overview

nuxt-smartscript uses a comprehensive multi-layer testing strategy to ensure reliability at every level of the stack. Each test layer serves a specific purpose and catches different types of bugs.

## Why Multiple Test Layers?

Think of our testing strategy like testing a car:
- **Unit tests** = testing individual parts (spark plugs, pistons)
- **SSR tests** = testing the engine works on a test bench
- **Nitro tests** = testing the engine works when installed in the car
- **Integration tests** = testing subsystems work together
- **E2E tests** = driving the complete car on the road

Each layer can have its own bugs, so we test at each level!

## Why We Need Both SSR and Nitro Tests

This is a common question since both test similar transformations (trademark, chemicals, etc.). The overlap is **intentional** because we're testing the same features at different layers:

1. **SSR tests** verify our jsdom approach works correctly - that we can use the same DOM-based code on the server
   - Question: "Does the transformation work with jsdom?"
   - Focus: Core algorithm correctness with server-side DOM

2. **Nitro tests** verify the plugin integrates properly with Nuxt's server-side rendering pipeline
   - Question: "Does the plugin correctly apply transformations during server rendering?"
   - Focus: Integration with Nuxt's SSR infrastructure

The same transformation might work perfectly in isolation (SSR test passes) but fail when integrated into Nuxt (Nitro test fails) due to:
- Configuration not being read correctly
- HTML chunks not being processed properly  
- Hook registration issues
- Event context problems

## Test Layers Explained

### 1. Unit Tests (`test/unit/*.test.ts`)

**What they test:** Individual functions in isolation

**Car analogy:** Testing individual parts like spark plugs or pistons

**Examples:**
- `patterns.test.ts` - Tests regex patterns in isolation
- `processor.test.ts` - Tests text processing logic
- `dom.test.ts` - Tests DOM element creation
- `engine.test.ts` - Tests client-side processing with mock DOM

**When to use:** When you want to verify a single function works correctly with various inputs

```javascript
// Example: Testing a pattern in isolation
it('should match trademark symbols', () => {
  expect('Product(TM)'.match(TRADEMARK_PATTERN)).toBeTruthy()
  expect('TM alone'.match(TRADEMARK_PATTERN)).toBeFalsy()
})
```

### 2. SSR Tests (`test/unit/ssr.test.ts`)

**What they test:** Core transformation logic using jsdom in a unit test environment

**Car analogy:** Testing the engine on a test bench

**Key features:**
- Directly imports and calls transformation functions
- Sets up jsdom manually to simulate server-side DOM
- Tests the same DOM manipulation code that runs on both client and server

```javascript
// Directly tests the processing engine with jsdom
import { processElement } from '../../src/runtime/smartscript/engine'

const dom = new JSDOM('<p>Product(TM)</p>')
global.document = dom.window.document
processElement(element, config, patterns, pattern)
```

**Tests include:**
- Transformation algorithms work with jsdom
- Pattern matching correctness
- Exclusion zones (pre, code, data-no-superscript)
- Edge cases (standalone TM, H2O after uppercase)
- Double processing prevention

### 3. Integration Tests (`test/integration/*.test.ts`)

**What they test:** Multiple components working together in a controlled environment

**Car analogy:** Testing the engine when installed in the chassis

**Examples:**
- `pattern-processing.test.ts` - Tests patterns + processor + DOM creation together
- `element-positioning.test.ts` - Tests CSS positioning with transformations

### 4. Nitro Plugin Tests (`test/integration/nitro-plugin.test.ts`)

**What they test:** How transformations work within Nuxt's server-side rendering pipeline

**Car analogy:** Testing the engine while the car is on a dynamometer

**Key features:**
- Tests the actual Nitro plugin that hooks into Nuxt's SSR
- Simulates Nitro's hook system and event context
- Verifies configuration is read from runtime config
- Tests HTML chunk processing as Nitro provides it

```javascript
// Tests the plugin integration with Nitro
const pluginModule = await import('../../src/runtime/nitro/plugin-jsdom')
nitroApp.hooks.hook('render:html', renderHook)

// Simulates how Nitro calls the plugin
renderHook(htmlChunks, { event: { context: { $config: {...} } } })
```

**Tests include:**
- Plugin registration with Nitro hooks
- Configuration reading from event context
- Multiple HTML body sections handling
- Error recovery for malformed HTML
- Full document wrapping

### 5. E2E Tests (`test/e2e/*.test.ts`)

**What they test:** Complete module in a real Nuxt application

**Car analogy:** Driving the complete car on the road

**Key features:**
- Uses Playwright to test in real browsers
- Tests the full user experience
- Verifies both SSR and client-side hydration
- Tests dynamic content updates

```javascript
// Tests in a real browser environment
test('transforms content correctly', async ({ page }) => {
  await page.goto('/')
  const content = await page.textContent('.content')
  expect(content).toContain('™')
})
```

## Why Multiple Test Layers?

Each layer can have its own unique bugs:

1. **Unit level:** Algorithm might be wrong
2. **SSR level:** jsdom compatibility issues
3. **Integration level:** Components might not work together
4. **Nitro level:** Plugin might not integrate with Nuxt properly
5. **E2E level:** Client hydration might fail

## Test Overlap is Intentional

You'll notice similar tests at different layers (e.g., both SSR and Nitro tests check trademark transformation). This is intentional:

- **SSR tests ask:** "Does the transformation work with jsdom?"
- **Nitro tests ask:** "Does the plugin correctly apply transformations during server rendering?"
- **E2E tests ask:** "Does the user see the correct result?"

Each question tests a different potential failure point.

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test suites
npx vitest run test/unit
npx vitest run test/integration
npx vitest run test/e2e

# Run specific test file
npx vitest run test/unit/ssr.test.ts

# Run in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

## Writing New Tests

### Guidelines

1. **Start with unit tests** for new functions
2. **Add integration tests** when components need to work together
3. **Add SSR tests** for server-side specific behavior
4. **Add Nitro tests** for plugin integration changes
5. **Add E2E tests** for user-facing features

### Test File Organization

```
test/
├── unit/              # Isolated function tests
│   ├── ssr.test.ts    # SSR-specific unit tests
│   └── regression/    # Tests for bug fixes
├── integration/       # Multi-component tests
│   └── nitro-plugin.test.ts  # Nitro integration
├── e2e/              # Full application tests
├── fixtures/         # Test data and apps
└── helpers/          # Test utilities
```

## Debugging Tests

```bash
# Run with debug output
DEBUG=* pnpm test

# Run single test
npx vitest run test/unit/ssr.test.ts -t "should transform trademark"

# Run with Node inspector
node --inspect-brk ./node_modules/.bin/vitest run
```

## Performance Benchmarks

Performance tests (`test/performance/*.test.ts`) ensure transformations remain fast:

```javascript
// Benchmark example
it('should process 1000 nodes quickly', () => {
  const start = performance.now()
  processLargeDocument()
  const duration = performance.now() - start
  expect(duration).toBeLessThan(100) // Under 100ms
})
```

## Continuous Integration

All tests run automatically on:
- Pull requests
- Commits to main branch
- Before npm publish

See `.github/workflows/ci.yml` for CI configuration.