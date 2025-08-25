# Integration Tests

## Overview

Integration tests verify that multiple components work correctly together. They test the complete processing pipeline using JSDOM to simulate a browser environment without the overhead of a real browser.

## Location

Integration tests are in `test/integration/`:

```
test/integration/
├── pattern-processing.test.ts  # All patterns working together
└── element-positioning.test.ts # SPAN vs SUP/SUB positioning
```

## Running Integration Tests

```bash
# Run all integration tests
npx vitest run test/integration

# Watch mode
npx vitest watch test/integration

# With debugging
DEBUG=true npx vitest run test/integration
```

## What We Test

### Pattern Processing Pipeline

Tests the complete flow from text input to DOM output:

```typescript
describe('Pattern processing pipeline', () => {
  it('should process multiple patterns in same text', () => {
    const element = createTestElement('H2O and CO2 at 25°C')
    engine.processElement(element)
    
    // Verify all patterns processed correctly
    const subs = element.querySelectorAll('sub')
    expect(subs).toHaveLength(2)
    expect(subs[0].textContent).toBe('2')
    expect(subs[1].textContent).toBe('2')
    
    const sup = element.querySelector('sup')
    expect(sup?.textContent).toBe('°')
  })
})
```

### Element Positioning System

Tests the hybrid SPAN/SUP approach:

```typescript
describe('Element positioning', () => {
  it('should use SPAN for positioned elements', () => {
    const element = createTestElement('Product(TM)')
    engine.processElement(element)
    
    const tm = element.querySelector('.ss-tm')
    expect(tm?.tagName).toBe('SPAN')
    
    // Verify CSS positioning works
    const styles = getComputedStyle(tm)
    expect(styles.position).toBe('relative')
  })

  it('should use SUP for semantic elements', () => {
    const element = createTestElement('x^2')
    engine.processElement(element)
    
    const sup = element.querySelector('sup')
    expect(sup?.tagName).toBe('SUP')
  })
})
```

### Configuration Flow

Tests config propagation through the system:

```typescript
describe('Configuration integration', () => {
  it('should apply custom CSS variables', () => {
    const config = createTestConfig({
      cssVariables: { 'tm-top': '-0.5em' }
    })
    
    const engine = new SmartScriptEngine(config)
    // Process and verify CSS variables applied
  })

  it('should respect disabled patterns', () => {
    const config = createTestConfig({
      symbols: { 
        trademark: { enabled: false }
      }
    })
    
    const element = createTestElement('(TM)')
    engine.processElement(element, config)
    
    // Should not transform
    expect(element.textContent).toBe('(TM)')
  })
})
```

## Test Scenarios

### Complex Document Processing

```typescript
describe('Complex documents', () => {
  it('should handle nested elements', () => {
    const html = `
      <div>
        <p>H2O in <strong>bold</strong></p>
        <span>CO2 in <em>italic</em></span>
      </div>
    `
    const element = createTestElement(html)
    engine.processElement(element)
    
    // Verify processing doesn't break nesting
    expect(element.querySelector('strong')).toBeTruthy()
    expect(element.querySelector('em')).toBeTruthy()
  })
})
```

### Performance Characteristics

```typescript
describe('Batch processing', () => {
  it('should process in batches', async () => {
    const config = createTestConfig({
      performance: { batchSize: 5 }
    })
    
    // Create element with many text nodes
    const element = createLargeElement(100)
    
    const processSpy = vi.spyOn(engine, 'processBatch')
    await engine.processElement(element, config)
    
    // Should have processed in batches of 5
    expect(processSpy).toHaveBeenCalledTimes(20)
  })
})
```

### Error Handling

```typescript
describe('Error recovery', () => {
  it('should continue processing after error', () => {
    const element = createTestElement('Valid (TM) and invalid')
    
    // Inject error for testing
    vi.spyOn(processor, 'processMatch')
      .mockImplementationOnce(() => { throw new Error('Test error') })
      .mockImplementation(originalImplementation)
    
    engine.processElement(element)
    
    // Should still process other patterns
    expect(element.querySelector('.ss-tm')).toBeTruthy()
  })
})
```

## Test Helpers

Integration tests use comprehensive helpers:

```typescript
import { 
  setupDOM, 
  cleanupDOM, 
  createTestElement,
  createTestConfig,
  countTransformedElements 
} from '../helpers/setup'

beforeEach(() => {
  setupDOM()
})

afterEach(() => {
  cleanupDOM()
})
```

## Best Practices

### 1. Test Real Workflows

Integration tests should mirror actual usage:

```typescript
// Good ✅ - Tests real workflow
it('should process document like Nuxt would', () => {
  const doc = createRealDocument()
  const config = loadNuxtConfig()
  engine.processDocument(doc, config)
  // Verify results
})

// Bad ❌ - Too isolated
it('should call processNode', () => {
  const spy = vi.spyOn(engine, 'processNode')
  engine.process()
  expect(spy).toHaveBeenCalled()
})
```

### 2. Use Realistic Data

```typescript
const testDocuments = {
  scientific: 'The reaction of H2O with CO2 produces H2CO3',
  math: 'The equation x^2 + y^2 = r^2 represents a circle',
  business: 'Our Product(TM) is ISO(R) certified',
  mixed: 'At 25°C, H2O has a pH of 7.0'
}
```

### 3. Test State Management

```typescript
describe('State management', () => {
  it('should handle multiple processing calls', () => {
    const element = createTestElement('(TM)')
    
    engine.processElement(element)
    const firstResult = element.innerHTML
    
    engine.processElement(element)
    const secondResult = element.innerHTML
    
    // Should not double-process
    expect(secondResult).toBe(firstResult)
  })
})
```

## Common Integration Patterns

### Testing MutationObserver

```typescript
describe('Dynamic content', () => {
  it('should process dynamically added content', async () => {
    const container = createTestElement('')
    engine.observe(container)
    
    // Add content dynamically
    container.innerHTML = 'New content with (TM)'
    
    // Wait for processing
    await waitForProcessing()
    
    expect(container.querySelector('.ss-tm')).toBeTruthy()
  })
})
```

### Testing Exclusions

```typescript
describe('Exclusion rules', () => {
  it('should respect no-superscript class', () => {
    const element = createTestElement(
      '<div class="no-superscript">H2O</div>'
    )
    engine.processElement(element)
    
    expect(element.querySelector('sub')).toBeFalsy()
  })

  it('should respect data-no-superscript', () => {
    const element = createTestElement(
      '<div data-no-superscript>x^2</div>'
    )
    engine.processElement(element)
    
    expect(element.querySelector('sup')).toBeFalsy()
  })
})
```

## Debugging Integration Tests

```bash
# Enable debug logging
DEBUG=true npx vitest run test/integration

# Run specific scenario
npx vitest run test/integration -t "complex document"

# Step debugging
node --inspect-brk ./node_modules/.bin/vitest run test/integration
```

## Performance Considerations

Integration tests are slower than unit tests but faster than E2E:
- Average runtime: 50-200ms per test
- Use JSDOM instead of real browser
- Mock external dependencies when possible
- Run in parallel when appropriate