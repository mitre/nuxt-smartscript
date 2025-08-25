# Composables & Plugin API

## Plugin API

SmartScript is primarily accessed through the Nuxt plugin API rather than composables.

### Accessing the Plugin

```vue
<script setup>
const { $smartscript } = useNuxtApp()
</script>
```

### Available Methods

```typescript
interface SmartScriptPlugin {
  // Process all content on the page
  processAll(): void
  
  // Process a specific element and its children  
  processElement(element: Element): void
  
  // Re-process everything (useful after config changes)
  refresh(): void
  
  // Stop processing and clean up
  destroy(): void
}
```

## Usage Examples

### Basic Processing

```vue
<script setup>
const { $smartscript } = useNuxtApp()

onMounted(() => {
  // Process entire page
  $smartscript.processAll()
})
</script>
```

### Process Specific Elements

```vue
<template>
  <div>
    <div ref="contentRef" v-html="dynamicContent" />
    <button @click="processContent">Process</button>
  </div>
</template>

<script setup>
const { $smartscript } = useNuxtApp()
const contentRef = ref(null)
const dynamicContent = ref('Product(TM) with H2O')

function processContent() {
  if (contentRef.value) {
    $smartscript.processElement(contentRef.value)
  }
}
</script>
```

### Dynamic Content Integration

```vue
<script setup>
const { $smartscript } = useNuxtApp()

// Process after loading content
async function loadAndProcess() {
  const data = await $fetch('/api/content')
  content.value = data
  
  await nextTick()
  $smartscript.processAll()
}

// Process after route change
const route = useRoute()
watch(() => route.path, () => {
  nextTick(() => $smartscript.processAll())
})
</script>
```

## Options API Usage

If you're using the Options API:

```vue
<script>
export default {
  mounted() {
    this.$smartscript.processAll()
  },
  
  methods: {
    processNewContent() {
      this.$smartscript.processAll()
    }
  }
}
</script>
```

## SSR Considerations

With v0.4.0's SSR support, be mindful of when processing occurs:

### Client-Only Processing

```vue
<script setup>
// Only run on client side
if (process.client) {
  onMounted(() => {
    const { $smartscript } = useNuxtApp()
    $smartscript.processAll()
  })
}
</script>
```

### Check for Server Processing

```vue
<script setup>
onMounted(() => {
  // Check if already processed server-side
  const processed = document.querySelector('[data-smartscript-processed]')
  
  if (!processed) {
    const { $smartscript } = useNuxtApp()
    $smartscript.processAll()
  }
})
</script>
```

## Performance Patterns

### Debounced Processing

```vue
<script setup>
import { debounce } from 'perfect-debounce'

const { $smartscript } = useNuxtApp()

// Debounce rapid updates
const debouncedProcess = debounce(() => {
  $smartscript.processAll()
}, 200)

// Use for frequent updates
watch(content, debouncedProcess)
</script>
```

### Lazy Processing

Process content only when visible:

```vue
<script setup>
import { useIntersectionObserver } from '@vueuse/core'

const { $smartscript } = useNuxtApp()
const targetRef = ref(null)
const hasProcessed = ref(false)

useIntersectionObserver(
  targetRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !hasProcessed.value) {
      $smartscript.processElement(targetRef.value)
      hasProcessed.value = true
    }
  }
)
</script>

<template>
  <section ref="targetRef">
    <!-- Content processed when scrolled into view -->
  </section>
</template>
```

### Batch Processing

Process multiple updates at once:

```vue
<script setup>
const { $smartscript } = useNuxtApp()
const items = ref([])

async function loadAllItems() {
  // Batch load all items
  const results = await Promise.all(
    ids.map(id => $fetch(`/api/item/${id}`))
  )
  
  // Update DOM
  items.value = results
  
  // Single process call
  await nextTick()
  $smartscript.processAll()
}
</script>
```

## Advanced Patterns

### Toggle Processing

```vue
<template>
  <div>
    <button @click="toggle">
      {{ enabled ? 'Disable' : 'Enable' }} SmartScript
    </button>
    
    <div :class="{ 'no-superscript': !enabled }">
      <p>Content with (TM) symbols</p>
    </div>
  </div>
</template>

<script setup>
const { $smartscript } = useNuxtApp()
const enabled = ref(true)

function toggle() {
  enabled.value = !enabled.value
  
  if (enabled.value) {
    nextTick(() => $smartscript.processAll())
  }
}
</script>
```

### Selective Processing

Process different sections independently:

```vue
<script setup>
const { $smartscript } = useNuxtApp()

const sections = ref([
  { id: 'intro', processed: false },
  { id: 'content', processed: false },
  { id: 'footer', processed: false }
])

function processSection(section) {
  const element = document.getElementById(section.id)
  
  if (element && !section.processed) {
    $smartscript.processElement(element)
    section.processed = true
  }
}

// Process sections as needed
onMounted(() => {
  sections.value.forEach(processSection)
})
</script>
```

## Cleanup

Always clean up when components unmount if you've created custom observers:

```vue
<script setup>
const { $smartscript } = useNuxtApp()

onUnmounted(() => {
  // Clean up if needed
  $smartscript.destroy()
})
</script>
```

## TypeScript Support

The plugin is fully typed. To get TypeScript support:

```typescript
// In a .vue file
const { $smartscript } = useNuxtApp()
// $smartscript is typed as SmartScriptPlugin

// In a .ts file
import type { SmartScriptPlugin } from '@mitre/nuxt-smartscript'

function processContent(plugin: SmartScriptPlugin) {
  plugin.processAll()
}
```

## See Also

- [Vue Integration Guide](/vue-integration) - Integration patterns and examples
- [Configuration](/api/configuration) - Configuration options
- [Deployment Modes](/guide/deployment-modes) - SSR vs Client mode setup