# Nuxt SmartScript

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Smart typography transformations for Nuxt - automatic superscript, subscript, and symbol formatting.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- [📖 &nbsp;Documentation](https://mitre.github.io/nuxt-smartscript)
- [🏀 &nbsp;Playground](./playground)

## Features

- 🔤 **Trademark, Registered & Copyright Symbols** - Converts (TM) → ™, (R) → ®, and (C) → ©
- 🔢 **Ordinal Numbers** - 1st, 2nd, 3rd with proper superscript
- 🧪 **Chemical Formulas** - H2O, CO2 with subscripts
- 📐 **Mathematical Notation** - x^2 superscript, x_1 subscript
- ⚡ **Performance Optimized** - Debounced processing, batch updates
- 🎨 **Fully Customizable** - Adjust positioning for different fonts
- ♿ **Accessible** - Proper ARIA labels for screen readers
- 🔧 **TypeScript Support** - Full type safety

## Quick Setup

Install the module:

```bash
# npm
npm install @mitre/nuxt-smartscript

# pnpm
pnpm add @mitre/nuxt-smartscript

# yarn
yarn add @mitre/nuxt-smartscript
```

Add to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript']
})
```

That's it! The plugin will automatically process your content ✨

## Architecture

The module follows a modular architecture for maintainability:

```
src/runtime/
├── plugin.ts                 # Main plugin orchestrator
├── composables/
│   └── useSmartScript.ts    # Vue composable for components
└── smartscript/
    ├── types.ts             # TypeScript interfaces
    ├── config.ts            # Configuration management
    ├── patterns.ts          # Regex patterns & matchers
    ├── processor.ts         # Text processing logic
    ├── dom.ts               # DOM manipulation utilities
    ├── engine.ts            # Core processing engine
    ├── errors.ts            # Error handling & recovery
    └── index.ts             # Public API exports
```

## Configuration

Customize the behavior in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript'],
  
  smartscript: {
    // Customize positioning for your font
    positioning: {
      trademark: {
        body: '-0.5em',
        headers: '-0.7em'
      },
      registered: {
        body: '-0.25em',
        headers: '-0.45em'
      }
    },
    
    // Performance tuning
    performance: {
      debounce: 100,
      batchSize: 50
    }
  }
})
```

## Vue Composable

Use in your components:

```vue
<script setup>
const { process, stats, isProcessing } = useSmartScript()

// Manually trigger processing
onMounted(() => {
  process()
})
</script>

<template>
  <div>
    <p>Processed: {{ stats.total }} transformations</p>
  </div>
</template>
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build module
pnpm prepack

# Run playground
pnpm dev

# Lint code
pnpm lint
```

## License

[Apache-2.0](./LICENSE.md) - MITRE Corporation

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@mitre/nuxt-smartscript/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@mitre/nuxt-smartscript

[npm-downloads-src]: https://img.shields.io/npm/dm/@mitre/nuxt-smartscript.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@mitre/nuxt-smartscript

[license-src]: https://img.shields.io/npm/l/@mitre/nuxt-smartscript.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@mitre/nuxt-smartscript

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com