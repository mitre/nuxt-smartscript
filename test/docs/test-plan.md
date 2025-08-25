# SmartScript Test Plan

## Test Organization

### 1. `patterns.test.ts` - Pattern/Regex Testing
- Test regex patterns match correct strings
- Test patterns DON'T match incorrect strings
- Test pattern edge cases
- Currently covered by: typography.test.ts (pattern matching section)

### 2. `processor.test.ts` - Text Processing Logic
- Test `processMatch()` returns correct transformation
- Test `processText()` splits and processes correctly
- Test `needsProcessing()` detection
- Currently covered by: edge-cases.test.ts, integration.test.ts

### 3. `dom.test.ts` - DOM Creation Functions
- Test `createSuperscriptElement()` 
- Test `createSubscriptElement()`
- Test `createFragmentFromParts()`
- Test class names, aria-labels, etc.
- Currently covered by: dom-output.test.ts ✅

### 4. `integration.test.ts` - End-to-End
- Test full pipeline: text → process → DOM
- Test with complex real-world examples
- Currently covered by: integration.test.ts, dom-output.test.ts

### 5. `performance.test.ts` - Optimization Testing
- Test caching mechanisms
- Test batching
- Test memory management
- Currently covered by: performance.test.ts ✅

### 6. `engine.test.ts` - DOM Walking & Processing
- Test TreeWalker functionality
- Test element processing
- Test exclusion rules
- Currently missing!

## Current Issues to Fix

### ❌ Useless Tests (need removal/fixing)
- typography.test.ts lines 125-134: Tests manual DOM creation
- typography.test.ts lines 144-159: Tests DOM API, not our code

### ⚠️ Tests That Need Updates
- Typography tests that check for `auto-sub` class (should be `ss-sub`)
- Any tests assuming old class names

### ✅ Good Tests
- performance.test.ts - Properly tests our functions
- dom-output.test.ts - Properly tests DOM creation
- Pattern matching tests - Valid regex testing

## Recommended Actions

1. **Keep pattern matching tests** - They're testing our regex patterns correctly
2. **Remove useless DOM API tests** - They don't test our code
3. **Add engine.test.ts** - Test TreeWalker and element processing
4. **Update class name references** - Change auto-sub to ss-sub
5. **Ensure each layer is tested** - Separate concerns properly