# Plugin API

The SmartScript plugin provides a comprehensive API accessible through the Nuxt app instance.

## Accessing the Plugin

```javascript
const { $smartscript } = useNuxtApp()
```

## Available Methods

### `process()`

Manually trigger processing of all content.

```javascript
$smartscript.process()
```

**Use Cases:**
- After dynamically loading content
- After changing configuration
- When content visibility changes

### `startObserving()`

Start the MutationObserver to watch for DOM changes.

```javascript
$smartscript.startObserving()
```

**Note:** The observer starts automatically on mount. Use this only if you've previously stopped it.

### `stopObserving()`

Stop watching for DOM changes.

```javascript
$smartscript.stopObserving()
```

**Use Cases:**
- Temporarily disable processing during heavy DOM operations
- Clean up when component unmounts
- Improve performance during animations

### `getConfig()`

Get the current configuration.

```javascript
const config = $smartscript.getConfig()
console.log('Current config:', config)
```

**Returns:** `SuperscriptConfig` object

### `updateConfig(newConfig)`

Update configuration at runtime.

```javascript
$smartscript.updateConfig({
  symbols: {
    ordinals: false
  },
  positioning: {
    trademark: {
      body: '-0.6em'
    }
  }
})
```

**Parameters:**
- `newConfig: Partial<SuperscriptConfig>` - Configuration changes to apply

**Returns:** `boolean` - Success status

### `reset()`

Reset all processing and restart the observer.

```javascript
$smartscript.reset()
```

**What it does:**
1. Stops the observer
2. Clears all processing flags
3. Restarts the observer
4. Reprocesses all content

### `getStats()`

Get current processing statistics.

```javascript
const stats = $smartscript.getStats()
console.log(`Processed ${stats.total} transformations`)
```

**Returns:**
```typescript
{
  processedElements: number  // Elements with data-superscript-processed
  superscripts: number       // Count of .auto-super elements
  subscripts: number         // Count of .auto-sub elements
  total: number             // Total transformations
}
```

## Complete Example

```vue
<template>
  <div class="plugin-api-demo">
    <div class="controls">
      <button @click="handleProcess">Process</button>
      <button @click="handleToggleObserver">
        {{ isObserving ? 'Stop' : 'Start' }} Observer
      </button>
      <button @click="handleReset">Reset</button>
      <button @click="handleUpdateConfig">Update Config</button>
    </div>
    
    <div class="stats">
      <h3>Statistics</h3>
      <pre>{{ JSON.stringify(stats, null, 2) }}</pre>
    </div>
    
    <div class="config">
      <h3>Current Config</h3>
      <pre>{{ JSON.stringify(config, null, 2) }}</pre>
    </div>
    
    <div class="content">
      <p>Test content with (TM) and 1st ordinal.</p>
      <p>Chemical: H2O, Math: x^2</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const { $smartscript } = useNuxtApp()

const stats = ref({})
const config = ref({})
const isObserving = ref(true)

function updateStats() {
  stats.value = $smartscript.getStats()
}

function updateConfig() {
  config.value = $smartscript.getConfig()
}

function handleProcess() {
  $smartscript.process()
  updateStats()
}

function handleToggleObserver() {
  if (isObserving.value) {
    $smartscript.stopObserving()
  } else {
    $smartscript.startObserving()
  }
  isObserving.value = !isObserving.value
}

function handleReset() {
  $smartscript.reset()
  updateStats()
}

function handleUpdateConfig() {
  const success = $smartscript.updateConfig({
    positioning: {
      trademark: {
        body: '-0.7em'
      }
    }
  })
  
  if (success) {
    updateConfig()
    $smartscript.process()
    updateStats()
  }
}

onMounted(() => {
  updateStats()
  updateConfig()
})

onUnmounted(() => {
  // Clean up
  $smartscript.stopObserving()
})
</script>
```

## Advanced Patterns

### Performance Optimization

Batch operations for better performance:

```javascript
async function performHeavyOperation() {
  const { $smartscript } = useNuxtApp()
  
  // Stop observing during heavy DOM manipulation
  $smartscript.stopObserving()
  
  try {
    // Perform multiple DOM operations
    await updateContent()
    await loadMoreItems()
    await renderCharts()
  } finally {
    // Restart and process once
    $smartscript.startObserving()
    $smartscript.process()
  }
}
```

### Configuration Presets

Create and apply configuration presets:

```javascript
const presets = {
  minimal: {
    symbols: {
      trademark: ['™'],
      registered: ['®'],
      copyright: ['©'],
      ordinals: false
    },
    performance: {
      debounce: 300,
      batchSize: 100
    }
  },
  
  full: {
    symbols: {
      trademark: ['™', '(TM)', 'TM'],
      registered: ['®', '(R)'],
      copyright: ['©', '(C)'],
      ordinals: true
    },
    performance: {
      debounce: 100,
      batchSize: 50
    }
  }
}

function applyPreset(presetName) {
  const { $smartscript } = useNuxtApp()
  
  if (presets[presetName]) {
    $smartscript.updateConfig(presets[presetName])
    $smartscript.process()
  }
}
```

### Dynamic Content Loading

Handle content loaded via API:

```javascript
async function loadDynamicContent() {
  const { $smartscript } = useNuxtApp()
  
  // Temporarily stop observing
  $smartscript.stopObserving()
  
  // Load content
  const response = await fetch('/api/articles')
  const articles = await response.json()
  
  // Render articles
  renderArticles(articles)
  
  // Process new content
  await nextTick()
  $smartscript.process()
  
  // Resume observing
  $smartscript.startObserving()
}
```

### Monitoring Performance

Track processing performance:

```javascript
function monitorPerformance() {
  const { $smartscript } = useNuxtApp()
  
  const startTime = performance.now()
  const startStats = $smartscript.getStats()
  
  $smartscript.process()
  
  const endTime = performance.now()
  const endStats = $smartscript.getStats()
  
  console.log({
    duration: endTime - startTime,
    elementsProcessed: endStats.processedElements - startStats.processedElements,
    transformations: endStats.total - startStats.total
  })
}
```

### Conditional Processing

Process based on user preferences:

```javascript
function setupUserPreferences() {
  const { $smartscript } = useNuxtApp()
  const userPrefs = useUserPreferences()
  
  // Apply user preferences
  $smartscript.updateConfig({
    symbols: {
      ordinals: userPrefs.value.enableOrdinals,
      trademark: userPrefs.value.enableTrademark ? ['™', '(TM)'] : []
    }
  })
  
  // Watch for preference changes
  watch(userPrefs, (newPrefs) => {
    $smartscript.updateConfig({
      symbols: {
        ordinals: newPrefs.enableOrdinals
      }
    })
    $smartscript.process()
  })
}
```

## Error Handling

The plugin includes built-in error handling:

```javascript
function safeProcess() {
  const { $smartscript } = useNuxtApp()
  
  try {
    $smartscript.process()
    console.log('Processing successful')
  } catch (error) {
    console.error('SmartScript error:', error)
    
    // Attempt recovery
    $smartscript.reset()
  }
}
```

## TypeScript Support

For TypeScript projects, the plugin is fully typed:

```typescript
declare module '#app' {
  interface NuxtApp {
    $smartscript: {
      process: () => void
      startObserving: () => void
      stopObserving: () => void
      getConfig: () => SuperscriptConfig
      updateConfig: (config: Partial<SuperscriptConfig>) => boolean
      reset: () => void
      getStats: () => {
        processedElements: number
        superscripts: number
        subscripts: number
        total: number
      }
    }
  }
}
```

## Best Practices

1. **Always clean up**: Stop the observer when components unmount
2. **Batch operations**: Stop observer during multiple DOM changes
3. **Use stats wisely**: Don't poll stats too frequently
4. **Handle errors**: Wrap operations in try-catch for production
5. **Test config changes**: Verify config updates return true

## See Also

- [Composables](/api/composables) - Vue composable wrapper
- [Configuration](/api/configuration) - Configuration options
- [Architecture](/architecture) - Internal implementation details