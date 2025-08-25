# Writing Tests

## Overview

This guide covers how to write effective tests for Nuxt SmartScript, including patterns, best practices, and common scenarios.

## Test Structure

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('Feature Name', () => {
  // Setup before each test
  beforeEach(() => {
    // Initialize test environment
  })

  // Cleanup after each test
  afterEach(() => {
    // Clean up resources
  })

  // Group related tests
  describe('specific behavior', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test data'
      
      // Act
      const result = functionUnderTest(input)
      
      // Assert
      expect(result).toBe('expected output')
    })
  })
})
```

## Choosing the Right Test Type

### Unit Test

Write a unit test when testing:
- Individual functions
- Pattern matching
- Configuration logic
- Utility functions

```typescript
// test/unit/patterns.test.ts
it('should match trademark pattern', () => {
  const pattern = /\(TM\)/g
  expect('Product(TM)'.match(pattern)).toEqual(['(TM)'])
})
```

### Integration Test

Write an integration test when testing:
- Multiple components together
- Processing pipeline
- DOM manipulation with processing
- Configuration flow

```typescript
// test/integration/pattern-processing.test.ts
it('should process multiple patterns together', () => {
  const element = createTestElement('H2O at 25°C')
  engine.processElement(element)
  expect(element.querySelectorAll('sub, sup')).toHaveLength(2)
})
```

### E2E Test

Write an E2E test when testing:
- Browser-specific behavior
- CSS rendering
- Hydration
- User interactions

```typescript
// test/e2e/positioning.test.ts
test('CSS positioning in browser', async ({ page }) => {
  await page.goto('/')
  const tm = await page.locator('.ss-tm').first()
  const top = await tm.evaluate(el => getComputedStyle(el).top)
  expect(top).toBe('-0.4em')
})
```

## Common Test Patterns

### Pattern Matching Tests

```typescript
describe('Pattern: Trademark', () => {
  const pattern = createPatterns().trademark

  // Test valid matches
  it.each([
    ['Product(TM)', ['(TM)']],
    ['Item(TM) and Another(TM)', ['(TM)', '(TM)']],
    ['END(TM)', ['(TM)']],
  ])('should match %s', (input, expected) => {
    expect(input.match(pattern)).toEqual(expected)
  })

  // Test invalid cases
  it.each([
    '(T M)',      // Space in middle
    '(tm)',       // Lowercase
    'TM',         // No parentheses
    '(TMM)',      // Extra character
  ])('should not match %s', (input) => {
    expect(input.match(pattern)).toBeNull()
  })
})
```

### DOM Manipulation Tests

```typescript
describe('DOM manipulation', () => {
  let container: HTMLElement

  beforeEach(() => {
    setupDOM()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
    cleanupDOM()
  })

  it('should preserve element structure', () => {
    container.innerHTML = '<p>H2O in <strong>bold</strong></p>'
    processElement(container)
    
    // Check structure preserved
    expect(container.querySelector('strong')).toBeTruthy()
    expect(container.querySelector('sub')).toBeTruthy()
  })
})
```

### Configuration Tests

```typescript
describe('Configuration', () => {
  it('should merge configurations correctly', () => {
    const base = { debug: false, performance: { debounce: 100 } }
    const user = { debug: true }
    const merged = mergeConfig(base, user)
    
    expect(merged).toEqual({
      debug: true,  // User override
      performance: { debounce: 100 }  // Base default
    })
  })

  it('should validate configuration', () => {
    const invalid = { performance: { debounce: -1 } }
    expect(() => validateConfig(invalid))
      .toThrow('Debounce must be positive')
  })
})
```

### Async/Promise Tests

```typescript
describe('Async operations', () => {
  it('should process after delay', async () => {
    const element = createTestElement('(TM)')
    const promise = processWithDelay(element, 100)
    
    // Not processed yet
    expect(element.querySelector('.ss-tm')).toBeFalsy()
    
    // Wait for processing
    await promise
    
    // Now processed
    expect(element.querySelector('.ss-tm')).toBeTruthy()
  })

  it('should handle errors gracefully', async () => {
    const element = createTestElement('invalid')
    
    await expect(processElement(element))
      .rejects.toThrow('Processing failed')
  })
})
```

## Testing Edge Cases

### Empty/Null Values

```typescript
describe('Edge cases', () => {
  it.each([
    null,
    undefined,
    '',
    '   ',  // Whitespace only
  ])('should handle %s input', (input) => {
    expect(() => processText(input)).not.toThrow()
  })
})
```

### Large Data Sets

```typescript
it('should handle large documents efficiently', () => {
  const largeText = 'H2O '.repeat(10000)
  const element = createTestElement(largeText)
  
  const start = performance.now()
  processElement(element)
  const duration = performance.now() - start
  
  expect(duration).toBeLessThan(1000)  // Under 1 second
  expect(element.querySelectorAll('sub')).toHaveLength(10000)
})
```

### Special Characters

```typescript
it('should handle special characters', () => {
  const special = '™®©℃°µ¹²³'
  const element = createTestElement(special)
  
  expect(() => processElement(element)).not.toThrow()
})
```

## Mocking and Stubbing

### Mock External Dependencies

```typescript
import { vi } from 'vitest'

// Mock console
vi.mock('consola', () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}))

// Mock module
vi.mock('../src/runtime/smartscript/logger', () => ({
  log: vi.fn(),
  error: vi.fn(),
}))
```

### Spy on Functions

```typescript
it('should call process method', () => {
  const spy = vi.spyOn(engine, 'process')
  
  engine.processElement(element)
  
  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy).toHaveBeenCalledWith(element)
  
  spy.mockRestore()
})
```

## Test Data Builders

Create reusable test data:

```typescript
// test/helpers/builders.ts
export function buildTestDocument(options = {}) {
  return {
    scientific: 'H2O reacts with CO2',
    math: 'x^2 + y^2 = r^2',
    business: 'Product(TM) by Company(R)',
    mixed: 'All of the above at 25°C',
    ...options
  }
}

export function buildTestConfig(overrides = {}) {
  return {
    debug: false,
    performance: {
      debounce: 100,
      batchSize: 50,
    },
    ...overrides
  }
}
```

## Assertions Best Practices

### Use Specific Assertions

```typescript
// Good ✅
expect(element.tagName).toBe('SPAN')
expect(count).toBeGreaterThan(0)
expect(array).toHaveLength(3)

// Less specific ❌
expect(element.tagName).toBeTruthy()
expect(count > 0).toBe(true)
expect(array.length === 3).toBe(true)
```

### Custom Matchers

```typescript
// test/helpers/matchers.ts
expect.extend({
  toBeProcessed(element: HTMLElement) {
    const processed = element.querySelector('.ss-sup, .ss-sub')
    return {
      pass: processed !== null,
      message: () => `Expected element to be processed`
    }
  }
})

// Usage
expect(element).toBeProcessed()
```

## Test Organization

### Group by Feature

```typescript
describe('Trademark processing', () => {
  describe('pattern matching', () => {
    // Pattern tests
  })
  
  describe('transformation', () => {
    // Transformation tests
  })
  
  describe('rendering', () => {
    // Rendering tests
  })
})
```

### Use Descriptive Names

```typescript
// Good ✅
it('should create SPAN element for trademark symbols to allow CSS positioning')

// Bad ❌
it('should work')
it('test 1')
it('handles TM')
```

## Performance Testing

```typescript
import { bench, describe } from 'vitest'

describe('Performance', () => {
  bench('process 1000 trademarks', () => {
    const text = '(TM) '.repeat(1000)
    processText(text)
  })

  bench('process mixed content', () => {
    const text = 'H2O (TM) x^2 25°C '.repeat(100)
    processText(text)
  })
})
```

## Debugging Tests

### Debug Output

```typescript
it('should debug', () => {
  const result = processText('input')
  
  // Temporary debug output
  console.log('Result:', result)
  console.log('Type:', typeof result)
  console.log('Properties:', Object.keys(result))
  
  expect(result).toBeDefined()
})
```

### Step Through Debugger

```bash
# Run with Node debugger
node --inspect-brk ./node_modules/.bin/vitest run

# Connect Chrome DevTools to chrome://inspect
```

### Isolate Failing Test

```bash
# Run only failing test
npx vitest run -t "specific test name"

# Run in watch mode for quick iteration
npx vitest watch path/to/test.ts
```