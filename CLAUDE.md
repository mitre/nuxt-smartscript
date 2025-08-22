# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nuxt SmartScript is a Nuxt 3 module that performs automatic typography transformations in the browser. It transforms patterns like (TM) → ™, ordinals (1st, 2nd), chemical formulas (H2O), and mathematical notation (x^2, x_n) using client-side DOM manipulation.

## Commands

### Development
```bash
# Install dependencies
pnpm install

# Run development playground
pnpm dev

# Build module for production
pnpm prepack

# Prepare development environment (stub builds)
pnpm dev:prepare
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run a specific test file
pnpm test typography
pnpm test edge-cases
pnpm test integration

# Check for test failures
pnpm test 2>&1 | grep "×"

# Type checking
pnpm test:types
```

### Documentation
```bash
# Run documentation site locally
pnpm docs:dev

# Build documentation
pnpm docs:build

# Preview built documentation
pnpm docs:preview
```

### Code Quality
```bash
# Lint and auto-fix
pnpm lint --fix

# Just lint
pnpm lint

# Release (lint, test, build, changelog, publish)
pnpm release
```

## Git Workflow Requirements

- **NEVER use `git add -A`, `git add .`, or `git add -u`** - These are FORBIDDEN
- **ALWAYS run `git status` first** to examine what files have changed
- **ALWAYS add files individually** with `git add <filename>`
- **Group related changes** in logical commits
- **Use conventional commits**: `feat:`, `fix:`, `test:`, `docs:`, `chore:`
- **Commit signatures**: Use `Authored by: Aaron Lippold<lippold@gmail.com>`
- **NO Claude signatures** in commits

## Architecture

### Module Structure
The module consists of three main parts:

1. **Module Definition** (`src/module.ts`)
   - Registers the client-side plugin
   - Manages configuration through `nuxt.config.ts`
   - Adds CSS for styling transformations

2. **Runtime Plugin** (`src/runtime/plugin.ts`)
   - Main orchestrator that initializes on client mount
   - Sets up MutationObserver for dynamic content
   - Provides `$smartscript` API to Nuxt app
   - Delays processing by 1500ms to avoid Vue hydration issues

3. **SmartScript Core** (`src/runtime/smartscript/`)
   - `patterns.ts`: Regex patterns for text matching
   - `processor.ts`: Transforms matched text into DOM elements
   - `engine.ts`: TreeWalker-based DOM traversal and processing
   - `dom.ts`: DOM element creation and manipulation
   - `config.ts`: Default configuration and merging
   - `logger.ts`: Logging with consola for debug mode

### Pattern System

**Critical Design Decision**: Math patterns include the variable (e.g., `x^2` not just `^2`) to prevent false matches in identifiers like `file_name`.

```typescript
// Math patterns use positive lookbehind to ensure proper context
mathSuper: /(?<=^|[\s=+\-*/().,\d]|[a-z])([a-zA-Z])\^(\d+|[a-zA-Z]|\{[^}]+\})/g
mathSub: /(?<=^|[\s=+\-*/().,])([a-zA-Z])_(\d+|[a-zA-Z]|\{[^}]+\})/g
```

Patterns support:
- Both LaTeX formats: `x_n` (shorthand) and `x_{n}` (with braces)
- Single-letter variables only (prevents false matches)
- Positive lookbehind ensures proper context (after operators, whitespace, etc.)
- Special support for E=mc² (superscript after lowercase letter)

### Processing Pipeline

1. **Initialization** (100ms delay after mount)
   - Load configuration from runtime config
   - Create regex patterns
   - Set up MutationObserver

2. **DOM Processing**
   - TreeWalker traverses text nodes
   - Combined regex tests for any matches
   - Matching nodes queued for batch processing
   - Document fragments replace original text nodes

3. **Performance Optimizations**
   - Debounced processing (100ms default)
   - Batch processing (50 nodes default)
   - Early exit if no patterns match
   - Regex lastIndex reset to avoid state issues

## Configuration

Users configure via `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-smartscript'],
  smartscript: {
    debug: true, // Enable debug logging
    positioning: {
      trademark: { body: '-0.5em', headers: '-0.7em' }
    },
    performance: {
      debounce: 100,
      batchSize: 50,
      delay: 100
    }
  }
})
```

## Testing Approach

Tests are organized into:
- `test/typography.test.ts` - Pattern matching tests
- `test/edge-cases.test.ts` - Boundary conditions (41 tests)
- `test/integration.test.ts` - Full pipeline tests
- `test/math-notation.test.ts` - Math pattern specifics
- `test/basic.test.ts` - Module loading test

All 91 tests must pass before committing.

## Key Technical Considerations

1. **Vue Hydration**: Process after mount to avoid hydration mismatches
2. **Regex State**: Always reset `lastIndex` on global regex patterns
3. **Pattern Conflicts**: Math patterns must not match in word contexts (file_name)
4. **DOM Safety**: Use TreeWalker and document fragments, never innerHTML
5. **Exclusions**: Respect `no-superscript` class and `data-no-superscript` attribute
6. **Content Detection**: Check for actual text changes, not just element type changes

## Common Issues and Solutions

1. **Hydration Warnings**: Increase delay in config
2. **Pattern Not Matching**: Check for preceding/following context
3. **Performance Issues**: Adjust batchSize and debounce settings
4. **False Positives**: Math patterns require single-letter variables
5. **Symbol not transforming**: Ensure content change detection works

## Release Process

We use changelogen for releases:

```bash
# Standard release (auto version from commits)
pnpm release

# Specific version
pnpm release -- --minor
pnpm release -- --major

# Beta release
pnpm release -- --prerelease beta
```

This automatically:
1. Runs tests and linting
2. Determines version from commits
3. Updates CHANGELOG.md
4. Creates git commit and tag
5. Pushes to GitHub

GitHub Actions then publishes to npm.

## Module Publishing

The module is configured for npm publishing:
- Entry: `dist/module.mjs`
- Types: `dist/types.d.mts`
- Build: `pnpm prepack`
- Version: 0.1.0 (beta)
- License: Apache-2.0