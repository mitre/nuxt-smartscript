# Vue Integration

This guide shows how to integrate nuxt-smartscript with your Vue components using the provided composable and API.

## Auto-Processing

By default, nuxt-smartscript automatically processes your content without any component integration needed. The module will:

- Process content after app mount
- Watch for DOM changes
- Handle navigation between pages
- Apply transformations to all configured selectors

## Using the Composable

For more control, use the `useSmartScript` composable in your components:

### Basic Usage

```vue
<template>
  <div>
    <button @click="process">Reprocess Content</button>
    <p>Transformations applied: {{ stats.total }}</p>
    <p v-if="isProcessing">Processing...</p>
  </div>
</template>

<script setup>
const { process, stats, isProcessing } = useSmartScript()

// Manually trigger processing
const handleContentChange = () => {
  process()
}
</script>
```

### Available Methods and Properties

```typescript
const {
  process,        // Function to trigger processing
  stats,          // Reactive statistics object
  isProcessing,   // Reactive processing state
  config,         // Current configuration
  updateConfig,   // Update configuration at runtime
} = useSmartScript()
```

## Real-World Examples

### Dynamic Content Loading

```vue
<template>
  <div class="blog-post">
    <article v-html="content" />
    <div v-if="isProcessing" class="loading">
      Applying typography transformations...
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const { process, isProcessing } = useSmartScript()
const content = ref('')

// Fetch content from API
async function loadContent() {
  const response = await fetch('/api/posts/latest')
  content.value = await response.text()
  
  // Process after content loads
  await nextTick()
  process()
}

onMounted(() => {
  loadContent()
})
</script>
```

### Configuration Updates

```vue
<template>
  <div class="settings">
    <h3>Typography Settings</h3>
    
    <label>
      <input type="checkbox" v-model="enableOrdinals">
      Transform ordinals (1st, 2nd, 3rd)
    </label>
    
    <label>
      Trademark position:
      <input 
        type="range" 
        min="-10" 
        max="0" 
        step="1"
        v-model.number="tmPosition"
        @change="updatePositioning"
      >
      {{ tmPosition / 10 }}em
    </label>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const { updateConfig, config } = useSmartScript()

const enableOrdinals = ref(config.value.symbols.ordinals)
const tmPosition = ref(-5) // -0.5em

function updatePositioning() {
  updateConfig({
    symbols: {
      ordinals: enableOrdinals.value
    },
    positioning: {
      trademark: {
        body: `${tmPosition.value / 10}em`
      }
    }
  })
}
</script>
```

### Content Editor Integration

```vue
<template>
  <div class="editor">
    <div class="toolbar">
      <button @click="insertTrademark">Insert ™</button>
      <button @click="insertRegistered">Insert ®</button>
      <button @click="insertCopyright">Insert ©</button>
    </div>
    
    <div 
      ref="editorRef"
      contenteditable="true"
      @input="handleInput"
      class="editor-content"
    />
    
    <div class="preview">
      <h4>Preview with SmartScript:</h4>
      <div ref="previewRef" v-html="content" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const { process } = useSmartScript()

const editorRef = ref(null)
const previewRef = ref(null)
const content = ref('')

function handleInput() {
  content.value = editorRef.value.innerHTML
  
  // Update preview
  nextTick(() => {
    previewRef.value.innerHTML = content.value
    // Process only the preview element
    processElement(previewRef.value)
  })
}

function insertTrademark() {
  document.execCommand('insertText', false, '(TM)')
  handleInput()
}

function insertRegistered() {
  document.execCommand('insertText', false, '(R)')
  handleInput()
}

function insertCopyright() {
  document.execCommand('insertText', false, '(C)')
  handleInput()
}

// Process specific element
function processElement(element) {
  const { $smartscript } = useNuxtApp()
  // This is a hypothetical method - actual implementation may vary
  if ($smartscript?.processElement) {
    $smartscript.processElement(element)
  }
}
</script>
```

### Monitoring Statistics

```vue
<template>
  <div class="stats-dashboard">
    <h3>Typography Statistics</h3>
    
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.processedElements }}</div>
        <div class="stat-label">Elements Processed</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{{ stats.superscripts }}</div>
        <div class="stat-label">Superscripts</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{{ stats.subscripts }}</div>
        <div class="stat-label">Subscripts</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">Total Transformations</div>
      </div>
    </div>
    
    <button @click="refresh" :disabled="isProcessing">
      {{ isProcessing ? 'Processing...' : 'Refresh Stats' }}
    </button>
  </div>
</template>

<script setup>
const { stats, isProcessing, process } = useSmartScript()

function refresh() {
  process()
}

// Auto-refresh stats every 5 seconds
const interval = setInterval(() => {
  if (!isProcessing.value) {
    process()
  }
}, 5000)

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.stat-label {
  color: #666;
  font-size: 0.875rem;
}
</style>
```

## Direct API Access

You can also access the smartscript API directly through the Nuxt app:

```vue
<script setup>
const { $smartscript } = useNuxtApp()

// Process content manually
$smartscript.process()

// Control observer
$smartscript.startObserving()
$smartscript.stopObserving()

// Get current configuration
const config = $smartscript.getConfig()

// Update configuration
$smartscript.updateConfig({
  performance: {
    debounce: 200,
    batchSize: 100
  }
})

// Reset all processing
$smartscript.reset()

// Get statistics
const stats = $smartscript.getStats()
console.log(`Processed ${stats.total} transformations`)
</script>
```

## Excluding Content

### Component Level

Prevent processing of specific components:

```vue
<template>
  <div>
    <!-- This content will be processed -->
    <p>Your Brand(TM) is great!</p>
    
    <!-- This content will NOT be processed -->
    <pre class="no-superscript">
      Raw text with (TM) and (R) symbols
    </pre>
    
    <!-- Using data attribute -->
    <div data-no-superscript>
      This (TM) won't be transformed
    </div>
  </div>
</template>
```

### Dynamic Exclusion

```vue
<template>
  <div :class="{ 'no-superscript': !enableProcessing }">
    <p>Content with (TM) symbols</p>
    <button @click="toggleProcessing">
      {{ enableProcessing ? 'Disable' : 'Enable' }} Processing
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const enableProcessing = ref(true)
const { process } = useSmartScript()

function toggleProcessing() {
  enableProcessing.value = !enableProcessing.value
  if (enableProcessing.value) {
    nextTick(() => process())
  }
}
</script>
```

## Performance Tips

### 1. Batch Updates

When making multiple content changes, batch them:

```vue
<script setup>
const { process } = useSmartScript()
const items = ref([])

async function loadMultipleItems() {
  // Load all items first
  const promises = [
    fetch('/api/item/1'),
    fetch('/api/item/2'),
    fetch('/api/item/3')
  ]
  
  const responses = await Promise.all(promises)
  items.value = await Promise.all(
    responses.map(r => r.json())
  )
  
  // Process once after all updates
  await nextTick()
  process()
}
</script>
```

### 2. Disable During Heavy Operations

```vue
<script setup>
const { $smartscript } = useNuxtApp()

async function heavyOperation() {
  // Stop observing during heavy DOM manipulation
  $smartscript.stopObserving()
  
  try {
    // Do heavy work
    await performBulkUpdates()
  } finally {
    // Re-enable and process
    $smartscript.startObserving()
    $smartscript.process()
  }
}
</script>
```

### 3. Targeted Processing

For large pages, process only what's needed:

```vue
<template>
  <div>
    <div v-for="section in sections" :key="section.id">
      <div 
        :ref="el => sectionRefs[section.id] = el"
        v-html="section.content"
      />
    </div>
  </div>
</template>

<script setup>
const sectionRefs = ref({})
const { $smartscript } = useNuxtApp()

function processSingleSection(sectionId) {
  const element = sectionRefs.value[sectionId]
  if (element && $smartscript.processElement) {
    $smartscript.processElement(element)
  }
}
</script>
```

## SSR Considerations

The module only runs on the client side. For SSR apps:

```vue
<template>
  <ClientOnly>
    <div class="typography-stats">
      <p>Transformations: {{ stats.total }}</p>
    </div>
    <template #fallback>
      <div>Loading typography processor...</div>
    </template>
  </ClientOnly>
</template>

<script setup>
const { stats } = useSmartScript()
</script>
```

## Troubleshooting

### Content Not Processing

```vue
<script setup>
import { onMounted } from 'vue'

const { process, isProcessing } = useSmartScript()

onMounted(() => {
  // Ensure content is ready
  setTimeout(() => {
    if (!isProcessing.value) {
      console.log('Manually triggering process')
      process()
    }
  }, 2000)
})
</script>
```

### Hydration Mismatches

If you see hydration warnings:

```vue
<script setup>
const { process } = useSmartScript()

onMounted(() => {
  // Wait for hydration to complete
  setTimeout(() => {
    process()
  }, 1500)
})
</script>
```

### Memory Leaks

Always clean up observers:

```vue
<script setup>
const { $smartscript } = useNuxtApp()

onUnmounted(() => {
  $smartscript.stopObserving()
})
</script>
```