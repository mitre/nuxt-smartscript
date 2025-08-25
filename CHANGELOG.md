# Changelog

All notable changes to nuxt-smartscript will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.3.1

[compare changes](https://github.com/mitre/nuxt-smartscript/compare/v0.3.0...v0.3.1)

### 🚀 Enhancements

- Add server-side rendering (SSR) and static generation (SSG) support ([cdabdca](https://github.com/mitre/nuxt-smartscript/commit/cdabdca))
- Migrate to @nuxt/module-builder for proper TypeScript support ([86a2211](https://github.com/mitre/nuxt-smartscript/commit/86a2211))
- V0.4.0 - SSR support, expanded selectors, DRY fixes ([1878204](https://github.com/mitre/nuxt-smartscript/commit/1878204))

### 🩹 Fixes

- Correct trademark pattern to not match standalone TM ([2f600b1](https://github.com/mitre/nuxt-smartscript/commit/2f600b1))
- Correct GitHub Actions workflow order for pnpm setup ([32ecec2](https://github.com/mitre/nuxt-smartscript/commit/32ecec2))
- Use playwright-core command instead of playwright ([63b9d33](https://github.com/mitre/nuxt-smartscript/commit/63b9d33))
- Resolve TypeScript errors for v0.4.0 release ([68510e0](https://github.com/mitre/nuxt-smartscript/commit/68510e0))
- Resolve all TypeScript strict null check errors ([5320453](https://github.com/mitre/nuxt-smartscript/commit/5320453))
- Hardcode Apache-2.0 license badge in docs ([60d2342](https://github.com/mitre/nuxt-smartscript/commit/60d2342))
- Correct release scripts to use proper changelogen flags ([06f9da5](https://github.com/mitre/nuxt-smartscript/commit/06f9da5))
- Add dev:prepare step to release workflow for tsconfig generation ([a017a5b](https://github.com/mitre/nuxt-smartscript/commit/a017a5b))

### 💅 Refactors

- Update tests and runtime for v0.4.0 compatibility ([8801208](https://github.com/mitre/nuxt-smartscript/commit/8801208))

### 📖 Documentation

- Add comprehensive v0.4.0 documentation ([9542f89](https://github.com/mitre/nuxt-smartscript/commit/9542f89))
- Update performance and contributing documentation ([aab6f0c](https://github.com/mitre/nuxt-smartscript/commit/aab6f0c))
- Add TypeScript architecture documentation ([ba12ed5](https://github.com/mitre/nuxt-smartscript/commit/ba12ed5))
- Improve navigation structure for better user workflow ([74642fa](https://github.com/mitre/nuxt-smartscript/commit/74642fa))
- Rename LICENSE.md to LICENSE and update documentation ([0530671](https://github.com/mitre/nuxt-smartscript/commit/0530671))
- Update README and CLAUDE.md for v0.4.0 release ([0690ab4](https://github.com/mitre/nuxt-smartscript/commit/0690ab4))

### 🏡 Chore

- Add vitepress-plugin-mermaid for documentation diagrams ([898ceb9](https://github.com/mitre/nuxt-smartscript/commit/898ceb9))
- Update eslint and TypeScript configuration ([b1138d6](https://github.com/mitre/nuxt-smartscript/commit/b1138d6))
- Move CLAUDE.md to local-only file ([42bc13b](https://github.com/mitre/nuxt-smartscript/commit/42bc13b))

### ✅ Tests

- Add comprehensive SSR and integration tests ([fdcd25a](https://github.com/mitre/nuxt-smartscript/commit/fdcd25a))
- Update playground for SSR testing ([95239be](https://github.com/mitre/nuxt-smartscript/commit/95239be))

### 🤖 CI

- Improve GitHub Actions workflows ([850a913](https://github.com/mitre/nuxt-smartscript/commit/850a913))

### ❤️ Contributors

- Aaron Lippold ([@aaronlippold](https://github.com/aaronlippold))

## v0.3.0

[compare changes](https://github.com/mitre/nuxt-smartscript/compare/v0.1.2...v0.3.0)

### 🚀 Enhancements

- Add CSS variables for runtime style customization ([4e48b98](https://github.com/mitre/nuxt-smartscript/commit/4e48b98))
- Add custom pattern overrides for advanced users ([022bd71](https://github.com/mitre/nuxt-smartscript/commit/022bd71))
- Add transformation control to enable/disable specific types ([9ed7ccd](https://github.com/mitre/nuxt-smartscript/commit/9ed7ccd))
- ⚠️  Migrate to @mitre npm scope and align with org standards ([8dc3413](https://github.com/mitre/nuxt-smartscript/commit/8dc3413))

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
- **release:** V0.1.3 ([0033257](https://github.com/mitre/nuxt-smartscript/commit/0033257))
- Improve release scripts to prevent version and browser issues ([71e6e67](https://github.com/mitre/nuxt-smartscript/commit/71e6e67))
- **release:** V0.1.3" ([e22869b](https://github.com/mitre/nuxt-smartscript/commit/e22869b))

### ✅ Tests

- Add comprehensive font testing to playground ([c108ea7](https://github.com/mitre/nuxt-smartscript/commit/c108ea7))
- Add comprehensive performance test suite ([f190635](https://github.com/mitre/nuxt-smartscript/commit/f190635))

#### ⚠️ Breaking Changes

- ⚠️  Migrate to @mitre npm scope and align with org standards ([8dc3413](https://github.com/mitre/nuxt-smartscript/commit/8dc3413))
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