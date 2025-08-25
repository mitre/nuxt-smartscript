# Test Structure

This directory contains the comprehensive test suite for Nuxt SmartScript with **227+ tests** across multiple categories.

## 📚 Full Documentation

For detailed testing documentation, see: **[docs/testing/](../docs/testing/index.md)**

## Quick Overview

```
test/
├── unit/              # Unit tests for individual functions (~100 tests)
│   └── regression/    # Bug regression tests
├── integration/       # Integration tests with JSDOM (~50 tests)
├── e2e/              # End-to-end browser tests with Playwright (~20 tests)
├── performance/      # Performance benchmarks (~10 tests)
├── helpers/          # Test utilities and setup functions
├── fixtures/         # Test fixtures for E2E tests
└── docs/            # Additional test documentation
```

## Running Tests

```bash
# Run all tests (227+ tests)
pnpm test

# Run specific categories
npx vitest run test/unit
npx vitest run test/integration
npx vitest run test/e2e
npx vitest run test/performance

# Run specific regression tests
npx vitest run test/unit/regression

# Watch mode for development
pnpm test:watch

# With coverage
pnpm test --coverage
```

## Test Infrastructure

- **Framework**: Vitest
- **Browser Testing**: Playwright
- **DOM Testing**: JSDOM
- **Configuration**: `vitest.config.ts`
- **Helpers**: `test/helpers/setup.ts`

## Key Features

### Hybrid Element Testing
- SPAN elements for TM/R symbols (CSS positioning)
- SUP/SUB elements for semantic content

### Regression Tests
- `water.test.ts` - H2O vs H1-H6 headers
- `headers-bug.test.ts` - Header chemical confusion

### CI/CD Integration
- GitHub Actions with matrix testing (Node 20, 22)
- Automatic Playwright browser installation
- Test annotations in GitHub UI

## Writing New Tests

See [Writing Tests Guide](../docs/testing/writing-tests.md) for:
- Test patterns and best practices
- Choosing the right test type
- Using test helpers
- Debugging techniques

## Test Coverage Goals

- Pattern matching: **100%**
- Configuration: **100%**
- Processing logic: **95%+**
- DOM manipulation: **90%+**
- Error scenarios: **80%+**