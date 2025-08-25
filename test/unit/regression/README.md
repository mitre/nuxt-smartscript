# Regression Tests

This folder contains tests for specific bugs that were discovered and fixed. These tests ensure the bugs don't reappear.

## Tests

### `headers-bug.test.ts`
**Bug**: HTML header tags (H1, H2, H3, etc.) were being transformed as chemical formulas (H₁, H₂, H₃)
**Fix**: Updated chemical pattern to not match H followed by numbers 1-6
**Date**: During initial development
**Critical**: Yes - would break all HTML headers

### `water.test.ts`  
**Bug**: Need to ensure H2O (water) still transforms correctly while H1-H6 don't
**Fix**: Refined pattern to allow H2O but exclude H1-H6
**Date**: During initial development
**Related**: Part of the headers-bug fix validation

## Running Regression Tests

```bash
# Run all regression tests
npx vitest run test/unit/regression

# Run specific regression test
npx vitest run test/unit/regression/headers-bug.test.ts
```

## Adding New Regression Tests

When you fix a bug:
1. Create a test that reproduces the bug
2. Name it descriptively: `{feature}-{bug-description}.test.ts`
3. Add an entry to this README
4. Include the date, description, and why it was critical