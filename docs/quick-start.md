# Quick Start

Get up and running with Nuxt SmartScript in under 2 minutes.

## Installation

::: code-group

```bash [npm]
npm install @mitre/@mitre/nuxt-smartscript
```

```bash [pnpm]
pnpm add @mitre/@mitre/nuxt-smartscript
```

```bash [yarn]
yarn add @mitre/@mitre/nuxt-smartscript
```

:::

## Basic Setup

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@mitre/@mitre/nuxt-smartscript']
})
```

That's it! SmartScript is now active and will automatically process your content.

## What Happens Next?

Once installed, SmartScript will:

1. **Scan your content** - Automatically detects typography patterns
2. **Transform text** - Applies smart replacements and formatting
3. **Watch for changes** - Updates dynamically as content changes
4. **Maintain accessibility** - Adds proper ARIA labels

## Try It Out

Add this content to any page in your Nuxt app:

```vue
<template>
  <div>
    <h1>Welcome to Our Product(TM)</h1>
    <p>This is the 1st example of SmartScript!</p>
    <p>Chemical formula: H2O and CO2</p>
    <p>Math equation: E=mc^2</p>
    <p>Copyright(C) 2024 - All rights reserved(R)</p>
  </div>
</template>
```

You'll see the content automatically transformed with proper typography!

## Default Transformations

Out of the box, SmartScript handles:

| Pattern | Input | Output |
|---------|-------|--------|
| Trademark | `(TM)` or `TM` | ™ |
| Registered | `(R)` | ® |
| Copyright | `(C)` | © |
| Ordinals | `1st`, `2nd`, `3rd` | 1<sup>st</sup>, 2<sup>nd</sup>, 3<sup>rd</sup> |
| Chemicals | `H2O`, `CO2` | H<sub>2</sub>O, CO<sub>2</sub> |
| Math Super | `x^2`, `x^{10}` | x<sup>2</sup>, x<sup>10</sup> |
| Math Sub | `x_1`, `x_{n}` | x<sub>1</sub>, x<sub>n</sub> |

## Basic Configuration

Want to customize the behavior? Add options to your config:

```typescript
export default defineNuxtConfig({
  modules: ['@mitre/@mitre/nuxt-smartscript'],
  
  smartscript: {
    // Disable ordinal transformations
    symbols: {
      ordinals: false
    },
    
    // Adjust performance settings
    performance: {
      debounce: 200,  // Wait 200ms before processing
      batchSize: 100   // Process 100 nodes at a time
    }
  }
})
```

## Using in Components

Access SmartScript functionality in your Vue components:

```vue
<script setup>
const { process, stats } = useSmartScript()

// Manually trigger processing
onMounted(() => {
  process()
})

// Check statistics
console.log(`Transformed ${stats.value.total} items`)
</script>
```

## Excluding Content

To prevent processing of specific content:

```vue
<template>
  <!-- This WILL be processed -->
  <p>Product(TM) is great!</p>
  
  <!-- This will NOT be processed -->
  <pre class="no-superscript">
    Keep (TM) as-is in code blocks
  </pre>
  
  <!-- Using data attribute -->
  <div data-no-superscript>
    Raw (R) symbols here
  </div>
</template>
```

## Next Steps

- [Configure positioning](/api/configuration) for your fonts
- [Learn Vue integration](/vue-integration) patterns
- [Explore examples](/examples) of common use cases
- [Add custom patterns](/advanced/custom-patterns)

## Need Help?

- Check our [troubleshooting guide](/guide/getting-started#troubleshooting)
- View [architecture documentation](/architecture)
- Report issues on [GitHub](https://github.com/mitre/@mitre/@mitre/nuxt-smartscript/issues)