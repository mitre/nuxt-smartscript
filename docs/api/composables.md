# Composables

Nuxt SmartScript provides Vue composables for integrating typography transformations into your components.

## `useSmartScript`

The primary composable for interacting with SmartScript functionality.

### Basic Usage

```vue
<script setup>
const { process, stats, isProcessing, config, updateConfig } = useSmartScript()
</script>
```

### Return Values

The composable returns an object with the following properties and methods:

#### `process()`

Manually trigger text processing.

- **Type:** `() => void`
- **Returns:** `void`

```vue
<script setup>
const { process } = useSmartScript()

// Process after dynamic content loads
async function loadContent() {
  await fetchData()
  process()
}
</script>
```

#### `stats`

Reactive object containing processing statistics.

- **Type:** `Ref<SmartScriptStats>`
- **Properties:**
  - `processedElements: number` - Number of elements processed
  - `superscripts: number` - Number of superscripts created
  - `subscripts: number` - Number of subscripts created  
  - `total: number` - Total transformations applied

```vue
<template>
  <div class="stats">
    <p>Elements processed: {{ stats.processedElements }}</p>
    <p>Total transformations: {{ stats.total }}</p>
  </div>
</template>

<script setup>
const { stats } = useSmartScript()
</script>
```

#### `isProcessing`

Reactive boolean indicating if processing is currently active.

- **Type:** `Ref<boolean>`

```vue
<template>
  <div v-if="isProcessing" class="loading">
    Processing typography...
  </div>
</template>

<script setup>
const { isProcessing } = useSmartScript()
</script>
```

#### `config`

Current SmartScript configuration.

- **Type:** `Ref<SuperscriptConfig>`

```vue
<script setup>
const { config } = useSmartScript()

console.log('Current config:', config.value)
console.log('Debounce delay:', config.value.performance.debounce)
</script>
```

#### `updateConfig()`

Update configuration at runtime.

- **Type:** `(newConfig: Partial<SuperscriptConfig>) => void`
- **Parameters:**
  - `newConfig` - Partial configuration to merge

```vue
<script setup>
const { updateConfig } = useSmartScript()

// Disable ordinals
updateConfig({
  symbols: {
    ordinals: false
  }
})

// Adjust positioning
updateConfig({
  positioning: {
    trademark: {
      body: '-0.6em'
    }
  }
})
</script>
```

## Complete Example

Here's a comprehensive example using all features:

```vue
<template>
  <div class="smartscript-demo">
    <!-- Controls -->
    <div class="controls">
      <button @click="toggleOrdinals">
        {{ config.symbols.ordinals ? 'Disable' : 'Enable' }} Ordinals
      </button>
      
      <button @click="process" :disabled="isProcessing">
        Reprocess ({{ stats.total }} transformations)
      </button>
      
      <label>
        TM Position:
        <input 
          type="range" 
          min="-10" 
          max="0" 
          v-model.number="tmPosition"
          @change="updatePositioning"
        >
        {{ tmPosition / 10 }}em
      </label>
    </div>
    
    <!-- Content -->
    <div class="content" ref="contentRef">
      <h1>SmartScript(TM) Demo</h1>
      <p>This is the 1st example with H2O formula.</p>
      <p>Copyright(C) 2024 - All rights reserved(R)</p>
    </div>
    
    <!-- Stats -->
    <div class="stats" v-if="stats.total > 0">
      <h3>Statistics</h3>
      <ul>
        <li>Processed Elements: {{ stats.processedElements }}</li>
        <li>Superscripts: {{ stats.superscripts }}</li>
        <li>Subscripts: {{ stats.subscripts }}</li>
        <li>Total: {{ stats.total }}</li>
      </ul>
    </div>
    
    <!-- Loading indicator -->
    <div v-if="isProcessing" class="processing">
      Processing...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const { 
  process, 
  stats, 
  isProcessing, 
  config, 
  updateConfig 
} = useSmartScript()

const contentRef = ref(null)
const tmPosition = ref(-5) // -0.5em

// Toggle ordinal processing
function toggleOrdinals() {
  updateConfig({
    symbols: {
      ...config.value.symbols,
      ordinals: !config.value.symbols.ordinals
    }
  })
  
  // Reprocess after config change
  process()
}

// Update positioning
function updatePositioning() {
  updateConfig({
    positioning: {
      trademark: {
        body: `${tmPosition.value / 10}em`
      }
    }
  })
  
  process()
}

// Process on mount
onMounted(() => {
  // Wait for content to be ready
  nextTick(() => {
    process()
  })
})
</script>

<style scoped>
.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.stats {
  margin-top: 2rem;
  padding: 1rem;
  background: #e8f4f8;
  border-radius: 8px;
}

.processing {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border-radius: 4px;
}
</style>
```

## TypeScript Types

### `SuperscriptConfig`

```typescript
interface SuperscriptConfig {
  symbols: {
    trademark: string[]
    registered: string[]
    copyright: string[]
    ordinals: boolean
  }
  selectors: {
    include: string[]
    exclude: string[]
  }
  performance: {
    debounce: number
    batchSize: number
    delay: number
  }
  positioning?: {
    trademark?: {
      body?: string
      headers?: string
      fontSize?: string
    }
    registered?: {
      body?: string
      headers?: string
      fontSize?: string
    }
    ordinals?: {
      fontSize?: string
    }
    chemicals?: {
      fontSize?: string
    }
  }
}
```

### `SmartScriptStats`

```typescript
interface SmartScriptStats {
  processedElements: number
  superscripts: number
  subscripts: number
  total: number
}
```

## Advanced Usage

### Reactive Configuration

Create reactive configuration controls:

```vue
<script setup>
const { config, updateConfig } = useSmartScript()

// Create reactive controls
const settings = reactive({
  enableTrademark: true,
  enableOrdinals: true,
  debounce: 100
})

// Watch for changes
watch(settings, (newSettings) => {
  updateConfig({
    symbols: {
      ordinals: newSettings.enableOrdinals
    },
    performance: {
      debounce: newSettings.debounce
    }
  })
})
</script>
```

### Performance Monitoring

Track performance and optimize settings:

```vue
<script setup>
const { stats, isProcessing, updateConfig } = useSmartScript()

// Monitor processing time
const processingTime = ref(0)
let startTime = 0

watch(isProcessing, (processing) => {
  if (processing) {
    startTime = performance.now()
  } else if (startTime > 0) {
    processingTime.value = performance.now() - startTime
    
    // Auto-adjust batch size based on performance
    if (processingTime.value > 100) {
      updateConfig({
        performance: {
          batchSize: 25 // Reduce batch size
        }
      })
    }
  }
})
</script>
```

### Scoped Processing

Process only specific elements:

```vue
<script setup>
const { $smartscript } = useNuxtApp()

function processElement(element: HTMLElement) {
  // Note: This requires extending the plugin API
  // Currently not available but shown for illustration
  if ($smartscript.processElement) {
    $smartscript.processElement(element)
  }
}

// Process specific section
onMounted(() => {
  const section = document.querySelector('.special-content')
  if (section) {
    processElement(section)
  }
})
</script>
```

## Best Practices

### 1. Lazy Processing

Process content only when visible:

```vue
<script setup>
const { process } = useSmartScript()
const target = ref(null)

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    process()
  }
})
</script>
```

### 2. Batch Updates

When making multiple config changes:

```vue
<script setup>
const { updateConfig, process } = useSmartScript()

function applyPreset(preset: string) {
  // Make all config changes at once
  updateConfig({
    symbols: presets[preset].symbols,
    positioning: presets[preset].positioning,
    performance: presets[preset].performance
  })
  
  // Single reprocess
  process()
}
</script>
```

### 3. Memory Management

Clean up on unmount:

```vue
<script setup>
const { $smartscript } = useNuxtApp()

onUnmounted(() => {
  $smartscript.stopObserving()
})
</script>
```

## See Also

- [Plugin API](/api/plugin) - Direct plugin access
- [Configuration](/api/configuration) - Configuration options
- [Vue Integration Guide](/vue-integration) - Integration patterns