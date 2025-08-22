# Changelog

All notable changes to nuxt-smartscript will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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