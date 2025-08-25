# Testing Documentation

## Overview

Nuxt SmartScript has a comprehensive testing suite with **227+ tests** across multiple categories to ensure reliability and performance. Our testing infrastructure uses Vitest, Playwright, and JSDOM to provide complete coverage from unit tests to end-to-end browser testing.

## Quick Start

```bash
# Run all tests (227+ tests)
pnpm test

# Run specific test categories
pnpm test:unit        # Unit tests only
pnpm test:integration # Integration tests
pnpm test:e2e        # End-to-end browser tests
pnpm test:performance # Performance benchmarks

# Watch mode for development
pnpm test:watch

# Type checking
pnpm test:types
```

## Test Categories

### [Unit Tests](./unit-tests.md) (`test/unit/`)
- **Purpose**: Test individual functions and modules in isolation
- **Environment**: JSDOM
- **Count**: ~100 tests
- **Speed**: Very fast (<5s)
- **Examples**: Pattern matching, text processing, configuration merging

### [Integration Tests](./integration-tests.md) (`test/integration/`)
- **Purpose**: Test multiple components working together
- **Environment**: JSDOM with full SmartScript processing
- **Count**: ~50 tests
- **Speed**: Fast (<10s)
- **Examples**: DOM processing pipeline, element positioning

### [E2E Tests](./e2e-tests.md) (`test/e2e/`)
- **Purpose**: Test real browser behavior with actual Nuxt application
- **Environment**: Playwright with Chromium
- **Count**: ~20 tests
- **Speed**: Slower (20-30s)
- **Examples**: CSS positioning, configuration flow, hydration

### Performance Tests (`test/performance/`)
- **Purpose**: Benchmark processing speed and optimization
- **Environment**: Node.js
- **Count**: ~10 tests
- **Speed**: Variable
- **Examples**: Large document processing, batch processing

### Regression Tests (`test/unit/regression/`)
- **Purpose**: Ensure fixed bugs don't reappear
- **Environment**: JSDOM
- **Count**: ~10 tests
- **Speed**: Fast
- **Examples**: H2O vs H1-H6, registered symbol positioning

## Test Infrastructure

### Vitest Configuration

Our `vitest.config.ts` provides:
- Environment-specific settings (JSDOM for most tests, Node for E2E)
- Global test setup and teardown
- Test helpers and utilities
- Coverage reporting

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentMatchGlobs: [
      ['test/e2e/**', 'node'],  // E2E tests use node environment
    ],
    setupFiles: ['./test/setup.ts'],
    globals: true,
  }
})
```

### Test Helpers

Located in `test/helpers/setup.ts`:
- `setupDOM()` - Initialize JSDOM environment
- `cleanupDOM()` - Clean up after tests
- `createTestElement()` - Create test DOM elements
- `createTestConfig()` - Generate test configurations
- `countTransformedElements()` - Verify transformations

## CI/CD Integration

### GitHub Actions

Our CI workflow runs on every push and PR:
- Matrix testing across Node 20 and 22
- Automatic Playwright browser installation
- Separated test runs for better visibility
- Test annotations in GitHub UI

```yaml
strategy:
  matrix:
    os: [ubuntu-latest]
    node: [20, 22]
```

### Local Development

Before pushing:
```bash
# Full test suite
pnpm test

# Linting
pnpm lint --fix

# Type checking
pnpm test:types

# Build verification
pnpm prepack
```

## Writing Tests

### [Test Guidelines](./writing-tests.md)
- Follow existing patterns
- Use descriptive test names
- Test both success and failure cases
- Include edge cases
- Add regression tests for bugs

### Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  })

  it('should handle normal case', () => {
    // Test implementation
  })

  it('should handle edge case', () => {
    // Edge case test
  })

  afterEach(() => {
    // Cleanup
  })
})
```

## Coverage

We maintain high test coverage across:
- Pattern matching (100%)
- Text processing (95%+)
- DOM manipulation (90%+)
- Configuration handling (100%)
- Error scenarios (80%+)

## Best Practices

1. **Run tests before committing** - All tests must pass
2. **Add tests for new features** - No feature without tests
3. **Fix failing tests immediately** - Don't skip or disable
4. **Use appropriate test level** - Unit for logic, E2E for behavior
5. **Keep tests fast** - Mock external dependencies
6. **Test in isolation** - Each test should be independent

## Debugging Tests

```bash
# Run specific test file
npx vitest run test/unit/processor.test.ts

# Run with debugging output
DEBUG=true pnpm test

# Run single test by name
npx vitest run -t "should transform trademark"

# Interactive mode
npx vitest --ui
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Writing Tests Guide](./writing-tests.md)