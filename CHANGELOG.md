# Changelog

All notable changes to nuxt-smartscript will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.1.3

[compare changes](https://github.com/mitre/nuxt-smartscript/compare/v0.1.2...v0.1.3)

### 🚀 Enhancements

- Add CSS variables for runtime style customization ([4e48b98](https://github.com/mitre/nuxt-smartscript/commit/4e48b98))
- Add custom pattern overrides for advanced users ([022bd71](https://github.com/mitre/nuxt-smartscript/commit/022bd71))
- Add transformation control to enable/disable specific types ([9ed7ccd](https://github.com/mitre/nuxt-smartscript/commit/9ed7ccd))

### 🔥 Performance

- Add advanced performance optimizations ([2cd0ab3](https://github.com/mitre/nuxt-smartscript/commit/2cd0ab3))

### 🩹 Fixes

- Render trademark symbol as superscript for consistency ([bf8ecdf](https://github.com/mitre/nuxt-smartscript/commit/bf8ecdf))
- Prevent double processing and fix H1-H6 header detection ([6145303](https://github.com/mitre/nuxt-smartscript/commit/6145303))

### 💅 Refactors

- ⚠️  Switch to browser-native CSS positioning and ss- prefix ([8311b3f](https://github.com/mitre/nuxt-smartscript/commit/8311b3f))
- DRY improvements and performance optimizations ([2834781](https://github.com/mitre/nuxt-smartscript/commit/2834781))
- Reorganize test structure into unit, integration, performance, and e2e ([ea9f4a3](https://github.com/mitre/nuxt-smartscript/commit/ea9f4a3))

### 📖 Documentation

- Improve development and release documentation ([d9a6ce0](https://github.com/mitre/nuxt-smartscript/commit/d9a6ce0))
- Clarify release process for contributors and maintainers ([ef8d5d2](https://github.com/mitre/nuxt-smartscript/commit/ef8d5d2))

### 📦 Build

- Use compiled module in playground for real-world testing ([f576e3f](https://github.com/mitre/nuxt-smartscript/commit/f576e3f))

### 🏡 Chore

- Simplify release script to avoid browser confusion ([df68f1c](https://github.com/mitre/nuxt-smartscript/commit/df68f1c))
- Fix exports and add Nuxt compatibility date ([feb621d](https://github.com/mitre/nuxt-smartscript/commit/feb621d))

### ✅ Tests

- Add comprehensive font testing to playground ([c108ea7](https://github.com/mitre/nuxt-smartscript/commit/c108ea7))
- Add comprehensive performance test suite ([f190635](https://github.com/mitre/nuxt-smartscript/commit/f190635))

#### ⚠️ Breaking Changes

- ⚠️  Switch to browser-native CSS positioning and ss- prefix ([8311b3f](https://github.com/mitre/nuxt-smartscript/commit/8311b3f))

### ❤️ Contributors

- Aaron Lippold ([@aaronlippold](https://github.com/aaronlippold))

## v0.1.2

[compare changes](https://github.com/mitre/nuxt-smartscript/compare/v0.1.1...v0.1.2)

### 🩹 Fixes

- Add public access flag to npm publish ([3965e38](https://github.com/mitre/nuxt-smartscript/commit/3965e38))

### ❤️ Contributors

- Aaron Lippold ([@aaronlippold](https://github.com/aaronlippold))

## v0.1.1


### 🚀 Enhancements

- Implement core SmartScript typography transformation engine ([9b30d6c](https://github.com/mitre/nuxt-smartscript/commit/9b30d6c))
- Add interactive playground demo ([1da020e](https://github.com/mitre/nuxt-smartscript/commit/1da020e))

### 🩹 Fixes

- Resolve all ESLint errors and warnings ([41b41de](https://github.com/mitre/nuxt-smartscript/commit/41b41de))

### 💅 Refactors

- Simplify release process to use changelogen ([3002b6e](https://github.com/mitre/nuxt-smartscript/commit/3002b6e))

### 📖 Documentation

- Add comprehensive documentation and changelog ([2c22c61](https://github.com/mitre/nuxt-smartscript/commit/2c22c61))
- Add CLAUDE.md for AI assistant context ([09318c9](https://github.com/mitre/nuxt-smartscript/commit/09318c9))

### 📦 Build

- Add build configuration and dependencies ([878aa6b](https://github.com/mitre/nuxt-smartscript/commit/878aa6b))

### 🏡 Chore

- Initial project setup ([af3556d](https://github.com/mitre/nuxt-smartscript/commit/af3556d))
- Standardize on Node.js 22 LTS and fix docs ([3e88d5e](https://github.com/mitre/nuxt-smartscript/commit/3e88d5e))

### ✅ Tests

- Add comprehensive test suite ([f00a86a](https://github.com/mitre/nuxt-smartscript/commit/f00a86a))

### 🎨 Styles

- Apply ESLint formatting fixes ([fb0f830](https://github.com/mitre/nuxt-smartscript/commit/fb0f830))

### 🤖 CI

- Add GitHub workflows and community standards ([fa015ec](https://github.com/mitre/nuxt-smartscript/commit/fa015ec))
- Add comprehensive release workflow and documentation ([6fa62d9](https://github.com/mitre/nuxt-smartscript/commit/6fa62d9))

### ❤️ Contributors

- Aaron Lippold ([@aaronlippold](https://github.com/aaronlippold))

## [Unreleased]

## [0.1.0] - 2024-08-22

### Added
- Initial beta release of nuxt-smartscript
- **Symbol Transformations**
  - Trademark: (TM) → ™ and TM → ™ (as plain Unicode, not superscript)
  - Registered: (R) → ® (as plain Unicode, not superscript)
  - Copyright: (C) → © (as plain Unicode)
- **Typography Transformations**
  - Ordinal numbers: 1st, 2nd, 3rd, 4th, 11th, 21st, etc. with proper superscript
  - Chemical formulas: H2O, CO2, H2SO4, Al2(SO4)3 with subscripts
  - Mathematical notation: 
    - Superscript: x^2, E=mc^2, x^{10} (with positive lookbehind for equations)
    - Subscript: x_1, x_{n+1} (with context awareness)
- **Developer Experience**
  - Full TypeScript support with comprehensive types
  - Nuxt 3/4 compatible module architecture
  - Vue composable (`useSmartScript`) for component integration
  - Built-in logger with debug mode (using consola)
  - Configurable debug logging levels
- **Configuration**
  - Configurable selectors for inclusion/exclusion
  - Support for excluding elements with `data-no-superscript` attribute
  - Runtime configuration updates
  - Pattern enable/disable toggles
- **Performance**
  - Debounced processing (configurable delay)
  - Batch DOM updates
  - TreeWalker API for efficient DOM traversal
  - Smart caching with processed element tracking
  - MutationObserver for dynamic content
- **Documentation & Testing**
  - VitePress documentation site
  - Interactive playground with debug controls
  - 91 comprehensive unit tests
  - Pattern expectation documentation

### Technical Details
- Client-side only processing (no SSR hydration issues)
- Automatic reprocessing on navigation (page:finish hook)
- Process statistics API (`getStats()`)
- Manual processing control (`process()`)
- Observer control (`startObserving()`, `stopObserving()`)

### Fixed
- Copyright pattern (C) now correctly transforms to © symbol
- DOM updates now properly detect text-only transformations (not just super/subscript)
- Math patterns support E=mc² format with lowercase letter prefix

### Security
- Safe DOM manipulation with DocumentFragment
- No execution of user content
- CSP compatible
- Pre-compiled regex patterns with proper escaping
- Validated configuration with error handling

### Known Limitations
- Performance optimization pending (DRY analysis needed)
- No benchmarking data available yet
- Pattern matching efficiency not yet optimized
- Some code duplication between pattern matchers and extractors

### Roadmap to v1.0.0
- Performance benchmarking and optimization
- DRY refactoring of pattern system
- Production testing and feedback incorporation
- API stability confirmation

[0.1.0]: https://github.com/mitre/nuxt-smartscript/releases/tag/v0.1.0