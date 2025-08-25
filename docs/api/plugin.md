# Plugin API

The SmartScript plugin provides methods for controlling typography transformations in your Nuxt application.

## Accessing the Plugin

```javascript
const { $smartscript } = useNuxtApp()
```

## Core Methods

### `processAll()`

Process all content on the page.

```javascript
$smartscript.processAll()
```

**Use Cases:**
- After dynamically loading content
- When enabling SmartScript after disabling
- After route changes

### `processElement(element)`

Process a specific element and its children.

```javascript
const element = document.querySelector('.content')
$smartscript.processElement(element)
```

**Parameters:**
- `element: Element` - DOM element to process

**Use Cases:**
- Process newly added content
- Target specific sections
- Optimize performance by processing only what's needed

### `refresh()`

Re-process all content (forces a complete reprocess).

```javascript
$smartscript.refresh()
```

**Use Cases:**
- After configuration changes
- When content has been modified externally
- To ensure consistency

### `destroy()`

Stop all processing and clean up resources.

```javascript
$smartscript.destroy()
```

**Use Cases:**
- Component cleanup
- Before removing the module
- Memory management

## Usage Examples

### Basic Usage

```vue
<template>
  <div>
    <button @click="processContent">Process Now</button>
    <div ref="contentRef">
      <p>Product(TM) is the 1st choice!</p>
    </div>
  </div>
</template>

<script setup>
const { $smartscript } = useNuxtApp()
const contentRef = ref(null)

function processContent() {
  // Process entire page
  $smartscript.processAll()
  
  // Or process specific element
  if (contentRef.value) {
    $smartscript.processElement(contentRef.value)
  }
}

onMounted(() => {
  // Initial processing
  $smartscript.processAll()
})

onUnmounted(() => {
  // Cleanup
  $smartscript.destroy()
})
</script>
```

### Dynamic Content

```vue
<script setup>
const { $smartscript } = useNuxtApp()

async function loadArticle(id) {
  // Load content
  const article = await $fetch(`/api/articles/${id}`)
  content.value = article.html
  
  // Process after DOM update
  await nextTick()
  $smartscript.processAll()
}
</script>
```

### Selective Processing

```vue
<template>
  <div>
    <section v-for="section in sections" :key="section.id">
      <div :id="section.id" v-html="section.content" />
      <button @click="() => processSection(section.id)">
        Process This Section
      </button>
    </section>
  </div>
</template>

<script setup>
const { $smartscript } = useNuxtApp()

function processSection(sectionId) {
  const element = document.getElementById(sectionId)
  if (element) {
    $smartscript.processElement(element)
  }
}
</script>
```

## Performance Patterns

### Batch Processing

Process multiple updates at once:

```javascript
async function loadMultipleItems(ids) {
  const { $smartscript } = useNuxtApp()
  
  // Load all items
  const items = await Promise.all(
    ids.map(id => $fetch(`/api/items/${id}`))
  )
  
  // Update DOM
  renderItems(items)
  
  // Single process call
  await nextTick()
  $smartscript.processAll()
}
```

### Debounced Processing

For frequent updates:

```javascript
import { debounce } from 'perfect-debounce'

const { $smartscript } = useNuxtApp()

const debouncedProcess = debounce(() => {
  $smartscript.processAll()
}, 200)

// Use for rapid changes
watch(content, () => {
  debouncedProcess()
})
```

### Lazy Loading

Process content when it becomes visible:

```javascript
import { useIntersectionObserver } from '@vueuse/core'

const { $smartscript } = useNuxtApp()
const sections = ref([])

sections.value.forEach(section => {
  useIntersectionObserver(
    section.ref,
    ([{ isIntersecting }]) => {
      if (isIntersecting && !section.processed) {
        $smartscript.processElement(section.ref.value)
        section.processed = true
      }
    }
  )
})
```

## SSR Considerations

With v0.4.0's SSR support:

### Check for Server Processing

```javascript
onMounted(() => {
  // Look for server-processed marker
  const processed = document.querySelector('[data-smartscript-processed]')
  
  if (!processed) {
    // Only process if not done server-side
    const { $smartscript } = useNuxtApp()
    $smartscript.processAll()
  }
})
```

### Client-Only Processing

```javascript
// Ensure client-side only
if (process.client) {
  onMounted(() => {
    const { $smartscript } = useNuxtApp()
    $smartscript.processAll()
  })
}
```

## Error Handling

The plugin handles errors gracefully:

```javascript
try {
  $smartscript.processAll()
} catch (error) {
  console.error('SmartScript processing failed:', error)
  // Content remains unchanged on error
}
```

## TypeScript Support

The plugin is fully typed:

```typescript
interface SmartScriptPlugin {
  processAll(): void
  processElement(element: Element): void
  refresh(): void
  destroy(): void
}

// Usage with TypeScript
const { $smartscript } = useNuxtApp() as {
  $smartscript: SmartScriptPlugin
}
```

## Best Practices

1. **Process once**: Avoid calling `processAll()` repeatedly
2. **Use selective processing**: Process only what's needed with `processElement()`
3. **Clean up**: Call `destroy()` when appropriate
4. **Handle timing**: Use `nextTick()` after DOM changes
5. **Consider SSR**: Check if content was already processed server-side

## Common Issues

### Content Not Processing

```javascript
// Ensure DOM is ready
await nextTick()

// Check element exists
const element = document.querySelector('.content')
if (element) {
  $smartscript.processElement(element)
}

// Verify not in exclusion zone
// Not inside <pre>, <code>, or has .no-superscript class
```

### Processing Too Early

```javascript
// Wait for hydration in SSR apps
onMounted(() => {
  setTimeout(() => {
    $smartscript.processAll()
  }, 100)
})
```

## See Also

- [Composables](/api/composables) - Additional API access patterns
- [Configuration](/api/configuration) - Module configuration
- [Vue Integration](/vue-integration) - Component integration patterns
- [Deployment Modes](/guide/deployment-modes) - SSR vs Client setup