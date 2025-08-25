# Getting Started

This guide will walk you through setting up Nuxt SmartScript in your project.

## Prerequisites

Before you begin, make sure you have:

- Node.js 18+ installed
- A Nuxt 3 project (or create one with `npx nuxi@latest init my-app`)
- Basic knowledge of Nuxt and Vue

## Installation

### Step 1: Install the Package

Add @mitre/nuxt-smartscript to your project:

::: code-group

```bash [npm]
npm install @mitre/nuxt-smartscript
```

```bash [pnpm]
pnpm add @mitre/nuxt-smartscript
```

```bash [yarn]
yarn add @mitre/nuxt-smartscript
```

:::

### Step 2: Register the Module

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    '@mitre/nuxt-smartscript'
  ]
})
```

### Step 3: Verify Installation

Start your development server:

```bash
npm run dev
```

Visit your application and check the browser console. You should see:
```
[SmartScript] Initialized
```

## How It Works

SmartScript operates in three phases:

### 1. Initialization Phase
When your Nuxt app mounts, SmartScript:
- Loads configuration
- Creates regex patterns
- Sets up DOM observers

### 2. Processing Phase
SmartScript then:
- Scans text nodes using TreeWalker API
- Matches patterns against text content
- Creates replacement elements

### 3. Monitoring Phase
After initial processing:
- MutationObserver watches for new content
- Debounced processing handles dynamic updates
- Navigation hooks re-process on route changes

## Your First Transformation

Create a test page to see SmartScript in action:

```vue
<!-- pages/test.vue -->
<template>
  <div class="container">
    <h1>SmartScript Test Page</h1>
    
    <section>
      <h2>Symbols</h2>
      <p>Trademark: Product Name(TM)</p>
      <p>Registered: Brand(R)</p>
      <p>Copyright: (C) 2024</p>
    </section>
    
    <section>
      <h2>Ordinals</h2>
      <p>Rankings: 1st place, 2nd place, 3rd place</p>
      <p>Dates: December 21st, 2024</p>
    </section>
    
    <section>
      <h2>Scientific</h2>
      <p>Water formula: H2O</p>
      <p>Photosynthesis: 6CO2 + 6H2O → C6H12O6 + 6O2</p>
    </section>
    
    <section>
      <h2>Mathematics</h2>
      <p>Einstein's equation: E=mc^2</p>
      <p>Subscript notation: x_1, x_2, x_n</p>
    </section>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

section {
  margin: 2rem 0;
}

h2 {
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}
</style>
```

## Understanding the Output

When you view this page, SmartScript transforms:

- `(TM)` becomes <sup>™</sup> with class `trademark-symbol`
- `(R)` becomes <sup>®</sup> with class `registered-symbol`
- `1st` becomes 1<sup>st</sup> with class `ordinal-suffix`
- `H2O` becomes H<sub>2</sub>O with class `auto-sub`
- `mc^2` becomes mc<sup>2</sup> with class `auto-super`

## Inspecting the DOM

Use your browser's DevTools to inspect transformed elements:

```html
<!-- Original -->
<p>Product Name(TM)</p>

<!-- After SmartScript -->
<p>Product Name<sup class="auto-super trademark-symbol" aria-label="trademark">™</sup></p>
```

Note the:
- Semantic HTML elements (`<sup>`, `<sub>`)
- CSS classes for styling
- ARIA labels for accessibility

## Configuration Basics

You can customize SmartScript behavior in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript'],
  
  smartscript: {
    // Disable specific transformations
    symbols: {
      ordinals: false  // Don't transform 1st, 2nd, etc.
    },
    
    // Target specific content areas
    selectors: {
      include: ['.content', 'article'],  // Only process these
      exclude: ['.no-smart']             // Never process these
    },
    
    // Tune performance
    performance: {
      delay: 2000,     // Wait 2s after mount
      debounce: 200,   // Debounce at 200ms
      batchSize: 100   // Process 100 nodes per batch
    }
  }
})
```

## Common Patterns

### Dynamic Content

For content loaded after initial render:

```vue
<script setup>
const { $smartscript } = useNuxtApp()
const content = ref('')

async function loadContent() {
  const response = await fetch('/api/content')
  content.value = await response.text()
  
  // Trigger processing after content loads
  await nextTick()
  $smartscript.processAll()
}
</script>
```

### Conditional Processing

Toggle processing on/off:

```vue
<script setup>
const { $smartscript } = useNuxtApp()

function toggleProcessing(enabled: boolean) {
  if (enabled) {
    $smartscript.startObserving()
  } else {
    $smartscript.stopObserving()
  }
}
</script>
```

## Troubleshooting

### Content Not Transforming

1. Check browser console for errors
2. Verify module is loaded: `nuxt.config.ts`
3. Ensure content is in included selectors
4. Check for `no-superscript` class

### Hydration Warnings

If you see Vue hydration warnings:

```typescript
// Increase delay in config
smartscript: {
  performance: {
    delay: 2000  // Wait longer for hydration
  }
}
```

### Performance Issues

For large pages with lots of content:

```typescript
smartscript: {
  performance: {
    batchSize: 200,  // Increase batch size
    debounce: 300    // Increase debounce delay
  }
}
```

## Next Steps

Now that you have SmartScript running:

- [Learn Vue integration patterns](/vue-integration)
- [Explore configuration options](/api/configuration)
- [See real-world examples](/examples)
- [Understand the architecture](/architecture)