# Unit Tests

## Overview

Unit tests verify individual functions and modules work correctly in isolation. They form the foundation of our testing pyramid and run extremely fast using JSDOM for DOM-related testing.

## Location

All unit tests are in `test/unit/` with the following structure:

```
test/unit/
├── config.test.ts       # Configuration merging and defaults
├── dom.test.ts          # DOM element creation (SPAN vs SUP/SUB)
├── engine.test.ts       # Processing engine and TreeWalker
├── patterns.test.ts     # Regex pattern matching
├── processor.test.ts    # Text transformation logic
├── hybrid-elements.test.ts  # Hybrid element approach
└── regression/          # Bug regression tests
    ├── water.test.ts    # H2O vs H1-H6 headers
    └── headers-bug.test.ts  # Header chemical confusion
```

## Running Unit Tests

```bash
# Run all unit tests
npx vitest run test/unit

# Run specific file
npx vitest run test/unit/patterns.test.ts

# Watch mode for development
npx vitest watch test/unit

# With coverage
npx vitest run test/unit --coverage
```

## What We Test

### Pattern Matching (`patterns.test.ts`)

Tests all regex patterns for accuracy:

```typescript
describe('Trademark pattern', () => {
  it('should match (TM) pattern', () => {
    const pattern = patterns.trademark
    expect('Product(TM)'.match(pattern)).toEqual(['(TM)'])
  })

  it('should not match partial patterns', () => {
    const pattern = patterns.trademark
    expect('(T M)'.match(pattern)).toBeNull()
  })
})
```

### Configuration (`config.test.ts`)

Tests configuration merging and defaults:

```typescript
describe('Config merging', () => {
  it('should merge user config with defaults', () => {
    const config = mergeConfig({
      debug: true,
      cssVariables: { 'tm-top': '-0.5em' }
    })
    
    expect(config.debug).toBe(true)
    expect(config.cssVariables?.['tm-top']).toBe('-0.5em')
    expect(config.performance.debounce).toBe(100) // Default
  })
})
```

### DOM Creation (`dom.test.ts`)

Tests the hybrid element approach:

```typescript
describe('Element creation', () => {
  it('should create SPAN for trademark', () => {
    const element = createSuperscriptElement('™', 'trademark')
    expect(element.tagName).toBe('SPAN')
    expect(element.className).toBe('ss-sup ss-tm')
  })

  it('should create SUP for math', () => {
    const element = createSuperscriptElement('2', 'math')
    expect(element.tagName).toBe('SUP')
    expect(element.className).toBe('ss-sup ss-math')
  })
})
```

### Text Processing (`processor.test.ts`)

Tests transformation logic:

```typescript
describe('Text processor', () => {
  it('should process trademark symbol', () => {
    const result = processMatch('(TM)')
    expect(result).toEqual({
      modified: true,
      parts: [{ type: 'super', content: '™', subtype: 'trademark' }]
    })
  })

  it('should process mathematical notation', () => {
    const result = processMatch('x^2')
    expect(result).toEqual({
      modified: true,
      parts: [
        { type: 'text', content: 'x' },
        { type: 'super', content: '2', subtype: 'math' }
      ]
    })
  })
})
```

## Test Helpers

Unit tests can use helpers from `test/helpers/setup.ts`:

```typescript
import { setupDOM, cleanupDOM, createTestElement } from '../helpers/setup'

beforeEach(() => {
  setupDOM()
})

afterEach(() => {
  cleanupDOM()
})

it('should process element', () => {
  const element = createTestElement('Test (TM)')
  // ... test logic
})
```

## Best Practices

### 1. Test One Thing

Each test should verify a single behavior:

```typescript
// Good ✅
it('should match trademark pattern', () => {
  expect('(TM)'.match(pattern)).toEqual(['(TM)'])
})

// Bad ❌
it('should handle all symbols', () => {
  expect('(TM)'.match(tmPattern)).toEqual(['(TM)'])
  expect('(R)'.match(rPattern)).toEqual(['(R)'])
  expect('(C)'.match(cPattern)).toEqual(['(C)'])
})
```

### 2. Use Descriptive Names

Test names should clearly describe what's being tested:

```typescript
// Good ✅
it('should create SPAN element for trademark symbols', () => {})

// Bad ❌
it('should work', () => {})
```

### 3. Test Edge Cases

Always include edge cases:

```typescript
describe('Pattern matching', () => {
  it('should handle empty string', () => {
    expect(''.match(pattern)).toBeNull()
  })

  it('should handle special characters', () => {
    expect('™®©'.match(pattern)).toBeNull()
  })

  it('should handle very long text', () => {
    const longText = 'x'.repeat(10000)
    // Test performance doesn't degrade
  })
})
```

### 4. Mock External Dependencies

Keep tests isolated:

```typescript
vi.mock('consola', () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
  }
}))
```

## Common Patterns

### Testing Regex Patterns

```typescript
describe('Pattern: ${patternName}', () => {
  const pattern = createPatterns().patternName

  it.each([
    ['input1', ['expected1']],
    ['input2', ['expected2']],
  ])('should match %s', (input, expected) => {
    expect(input.match(pattern)).toEqual(expected)
  })

  it.each([
    'invalid1',
    'invalid2',
  ])('should not match %s', (input) => {
    expect(input.match(pattern)).toBeNull()
  })
})
```

### Testing Configuration

```typescript
describe('Configuration', () => {
  it('should have sensible defaults', () => {
    const config = createDefaultConfig()
    expect(config.performance.debounce).toBeGreaterThan(0)
    expect(config.performance.batchSize).toBeGreaterThan(0)
  })

  it('should validate user input', () => {
    expect(() => mergeConfig({ performance: { debounce: -1 } }))
      .toThrow('Debounce must be positive')
  })
})
```

## Coverage Goals

We aim for:
- **100%** coverage for pattern matching
- **100%** coverage for configuration
- **95%+** coverage for processing logic
- **90%+** coverage for DOM utilities

Check coverage with:

```bash
npx vitest run test/unit --coverage
```

## Debugging

```bash
# Run with Node inspector
node --inspect-brk ./node_modules/.bin/vitest run test/unit

# Use console.log (temporarily)
it('should debug', () => {
  console.log('Debug value:', value)
  expect(value).toBe(expected)
})

# Run single test
npx vitest run test/unit -t "specific test name"
```