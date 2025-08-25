# Vue Integration

Learn how to integrate @mitre/nuxt-smartscript with your Vue components.

## Automatic Processing

By default, SmartScript works automatically without any integration:

- Processes content after app mount
- Watches for DOM changes via MutationObserver
- Handles navigation between pages
- Applies transformations based on your configuration

## Plugin API Access

Access SmartScript functionality in your components:

```vue
<script setup>
const { $smartscript } = useNuxtApp()

// Manually trigger processing
$smartscript.processAll()

// Process specific element
const element = document.querySelector('.content')
if (element) {
  $smartscript.processElement(element)
}
</script>
```

## Common Patterns

### Dynamic Content Loading

Process content after AJAX/fetch operations:

```vue
<template>
  <div>
    <article v-html="content" ref="articleRef" />
  </div>
</template>

<script setup>
const { $smartscript } = useNuxtApp()
const content = ref('')
const articleRef = ref(null)

async function loadArticle(id) {
  const response = await fetch(`/api/articles/${id}`)
  content.value = await response.json()
  
  // Process after DOM update
  await nextTick()
  if (articleRef.value) {
    $smartscript.processElement(articleRef.value)
  }
}

onMounted(() => loadArticle(1))
</script>
```

### Live Preview

Create a live preview with transformations:

```vue
<template>
  <div class="editor-container">
    <textarea 
      v-model="source" 
      placeholder="Type (TM), 1st, H2O, x^2..."
    />
    
    <div class="preview">
      <h3>Preview:</h3>
      <div ref="previewRef" v-html="source" />
    </div>
  </div>
</template>

<script setup>
import { debounce } from 'perfect-debounce'

const { $smartscript } = useNuxtApp()
const source = ref('Try typing Product(TM) or H2O')
const previewRef = ref(null)

// Debounced preview update
const updatePreview = debounce(async () => {
  if (previewRef.value) {
    previewRef.value.innerHTML = source.value
    $smartscript.processElement(previewRef.value)
  }
}, 200)

watch(source, updatePreview)
onMounted(updatePreview)
</script>
```

### Toggle Processing

Enable/disable processing for specific sections:

```vue
<template>
  <div>
    <button @click="toggleProcessing">
      {{ enabled ? 'Disable' : 'Enable' }} SmartScript
    </button>
    
    <div :class="{ 'no-superscript': !enabled }">
      <p>This content has (TM) and (R) symbols.</p>
      <p>Water formula: H2O</p>
    </div>
  </div>
</template>

<script setup>
const { $smartscript } = useNuxtApp()
const enabled = ref(true)

function toggleProcessing() {
  enabled.value = !enabled.value
  if (enabled.value) {
    // Reprocess when enabled
    nextTick(() => $smartscript.processAll())
  }
}
</script>
```

## Exclusion Zones

### Using Classes

```vue
<template>
  <div>
    <!-- Processed -->
    <p>Regular text with (TM)</p>
    
    <!-- NOT processed -->
    <pre class="no-superscript">
      Code with (TM) stays unchanged
    </pre>
  </div>
</template>
```

### Using Data Attributes

```vue
<template>
  <div>
    <!-- Processed -->
    <p>Normal content (R)</p>
    
    <!-- NOT processed -->
    <div data-no-superscript>
      Raw content (R) preserved
    </div>
  </div>
</template>
```

### Automatic Exclusions

These elements are never processed:

- `<pre>` - Code blocks
- `<code>` - Inline code
- `<script>` - JavaScript
- `<style>` - CSS
- `<textarea>` - Form inputs

## SSR Considerations (v0.4.0+)

SmartScript now supports server-side rendering:

### Development Mode

SSR is disabled by default in development to avoid hydration warnings:

```vue
<script setup>
// Only process client-side in dev
if (process.client && process.dev) {
  onMounted(() => {
    const { $smartscript } = useNuxtApp()
    $smartscript.processAll()
  })
}
</script>
```

### Production Mode

In production, content is pre-transformed during SSR:

```vue
<script setup>
// Check if already processed server-side
onMounted(() => {
  const processed = document.querySelector('[data-smartscript-processed]')
  if (!processed) {
    // Only process if not already done server-side
    const { $smartscript } = useNuxtApp()
    $smartscript.processAll()
  }
})
</script>
```

## Performance Optimization

### Batch Updates

Process multiple changes at once:

```vue
<script setup>
const { $smartscript } = useNuxtApp()
const items = ref([])

async function loadAllItems() {
  // Load all data first
  const promises = ids.map(id => fetch(`/api/item/${id}`))
  const responses = await Promise.all(promises)
  items.value = await Promise.all(responses.map(r => r.json()))
  
  // Single process call after all updates
  await nextTick()
  $smartscript.processAll()
}
</script>
```

### Selective Processing

Process only visible content:

```vue
<script setup>
import { useIntersectionObserver } from '@vueuse/core'

const { $smartscript } = useNuxtApp()
const sectionRef = ref(null)
const processed = ref(false)

useIntersectionObserver(sectionRef, ([{ isIntersecting }]) => {
  if (isIntersecting && !processed.value) {
    $smartscript.processElement(sectionRef.value)
    processed.value = true
  }
})
</script>

<template>
  <section ref="sectionRef">
    <!-- Content processed when visible -->
  </section>
</template>
```

## API Reference

### Plugin Methods

```typescript
interface SmartScriptPlugin {
  // Process entire page
  processAll(): void
  
  // Process specific element
  processElement(element: Element): void
  
  // Re-process everything (clears cache)
  refresh(): void
  
  // Clean up and stop processing
  destroy(): void
}
```

### Accessing the Plugin

```vue
<script setup>
// In Composition API
const { $smartscript } = useNuxtApp()

// In Options API
export default {
  methods: {
    process() {
      this.$smartscript.processAll()
    }
  }
}
</script>
```

## Troubleshooting

### Content Not Processing

1. **Check element is not excluded**:
   - No `no-superscript` class
   - Not inside `<pre>` or `<code>`
   - No `data-no-superscript` attribute

2. **Verify timing**:
   ```vue
   // Ensure DOM is ready
   await nextTick()
   $smartscript.processAll()
   ```

3. **Check configuration**:
   ```vue
   // Verify transformations are enabled
   const config = useRuntimeConfig()
   console.log(config.public.smartscript)
   ```

### Memory Management

Clean up when components unmount:

```vue
<script setup>
onUnmounted(() => {
  // If using custom observers
  observer?.disconnect()
})
</script>
```

## Next Steps

- [Configuration Options](/api/configuration) - Customize SmartScript
- [Deployment Modes](/guide/deployment-modes) - SSR vs Client configurations
- [Examples](/examples) - Real-world usage patterns