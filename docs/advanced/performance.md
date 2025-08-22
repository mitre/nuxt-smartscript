# Performance Optimization

Learn how to optimize SmartScript for maximum performance in your application.

## Understanding Performance Impact

SmartScript processes text content in real-time, which can impact performance if not properly configured. Here's what happens:

1. **Initial Processing** - Scans all text nodes on page load
2. **Dynamic Updates** - Monitors DOM changes via MutationObserver
3. **Batch Processing** - Groups nodes for efficient processing
4. **Debouncing** - Delays processing to avoid excessive updates

## Configuration Options

### Debouncing

Control how often processing occurs:

```typescript
export default defineNuxtConfig({
  smartscript: {
    performance: {
      debounce: 200  // Wait 200ms before processing (default: 100)
    }
  }
})
```

**When to increase debounce:**
- High-frequency content updates
- Typing in real-time editors
- Animation-heavy pages

### Batch Size

Process nodes in groups:

```typescript
export default defineNuxtConfig({
  smartscript: {
    performance: {
      batchSize: 100  // Process 100 nodes at a time (default: 50)
    }
  }
})
```

**Batch size guidelines:**
- **Small pages (<1000 nodes):** 25-50
- **Medium pages (1000-5000 nodes):** 50-100
- **Large pages (>5000 nodes):** 100-200

### Initial Delay

Delay initial processing after mount:

```typescript
export default defineNuxtConfig({
  smartscript: {
    performance: {
      delay: 2000  // Wait 2 seconds after mount (default: 1500)
    }
  }
})
```

**Why delay?**
- Prevents Vue hydration mismatches
- Allows critical content to render first
- Improves perceived performance

## Targeted Processing

### Limit Scope

Only process specific areas:

```typescript
export default defineNuxtConfig({
  smartscript: {
    selectors: {
      include: [
        '.content',      // Only process content areas
        'article',       // And article elements
      ],
      exclude: [
        '.sidebar',      // Skip sidebars
        '.navigation',   // Skip navigation
        '.footer'        // Skip footers
      ]
    }
  }
})
```

### Disable Features

Turn off unused transformations:

```typescript
export default defineNuxtConfig({
  smartscript: {
    symbols: {
      ordinals: false,    // Disable ordinal processing
      chemicals: false    // Disable chemical formulas
    }
  }
})
```

## Performance Patterns

### Lazy Processing

Process content only when visible:

```vue
<script setup>
import { useIntersectionObserver } from '@vueuse/core'

const { process } = useSmartScript()
const contentRef = ref(null)
const { stop } = useIntersectionObserver(
  contentRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      process()
      stop() // Process once
    }
  }
)
</script>

<template>
  <div ref="contentRef">
    <!-- Content processed when scrolled into view -->
  </div>
</template>
```

### Manual Control

Disable automatic processing for heavy operations:

```vue
<script setup>
const { $smartscript } = useNuxtApp()

async function loadBulkContent() {
  // Stop automatic processing
  $smartscript.stopObserving()
  
  // Load and render content
  const items = await fetchManyItems()
  renderItems(items)
  
  // Process once after all updates
  await nextTick()
  $smartscript.process()
  
  // Resume automatic processing
  $smartscript.startObserving()
}
</script>
```

### Virtual Scrolling

For lists with thousands of items:

```vue
<script setup>
import { VirtualList } from '@tanstack/vue-virtual'

const { process } = useSmartScript()

// Process items as they become visible
function onVisibleChange(visibleItems) {
  nextTick(() => {
    visibleItems.forEach(item => {
      const element = document.getElementById(`item-${item.id}`)
      if (element && !element.dataset.smartscriptProcessed) {
        // Process individual item
        process()
      }
    })
  })
}
</script>
```

## Measuring Performance

### Built-in Statistics

Monitor processing metrics:

```vue
<script setup>
const { stats } = useSmartScript()

watch(stats, (newStats) => {
  console.log('Performance metrics:', {
    elements: newStats.processedElements,
    transformations: newStats.total,
    ratio: newStats.total / newStats.processedElements
  })
})
</script>
```

### Performance API

Track processing time:

```vue
<script setup>
const { process } = useSmartScript()

function measurePerformance() {
  const startMark = 'smartscript-start'
  const endMark = 'smartscript-end'
  
  performance.mark(startMark)
  process()
  performance.mark(endMark)
  
  performance.measure('smartscript-process', startMark, endMark)
  
  const measure = performance.getEntriesByName('smartscript-process')[0]
  console.log(`Processing took ${measure.duration}ms`)
  
  // Clean up
  performance.clearMarks()
  performance.clearMeasures()
}
</script>
```

### Chrome DevTools

Profile in the browser:

1. Open Chrome DevTools
2. Go to Performance tab
3. Start recording
4. Trigger SmartScript processing
5. Stop recording
6. Look for:
   - Long tasks (>50ms)
   - Layout thrashing
   - Excessive reflows

## Common Performance Issues

### Issue 1: Slow Initial Load

**Symptoms:**
- Page freezes on load
- High CPU usage
- Janky scrolling

**Solutions:**
```typescript
// Increase initial delay
performance: {
  delay: 3000  // Wait 3 seconds
}

// Reduce batch size
performance: {
  batchSize: 25  // Smaller batches
}

// Limit scope
selectors: {
  include: ['.main-content']  // Only main content
}
```

### Issue 2: Laggy Typing

**Symptoms:**
- Input delays in forms
- Choppy text editing
- High CPU during typing

**Solutions:**
```typescript
// Increase debounce
performance: {
  debounce: 500  // Wait longer
}

// Exclude input areas
selectors: {
  exclude: ['input', 'textarea', '[contenteditable]']
}
```

### Issue 3: Memory Leaks

**Symptoms:**
- Memory usage grows over time
- Page becomes slower
- Browser crashes

**Solutions:**
```vue
<script setup>
const { $smartscript } = useNuxtApp()

// Always clean up
onUnmounted(() => {
  $smartscript.stopObserving()
})

// Clear references
onBeforeUnmount(() => {
  // Clear any stored references
  elements.value = null
})
</script>
```

## Optimization Checklist

### Before Deployment

- [ ] Test with production data volumes
- [ ] Profile on slower devices
- [ ] Measure initial load time
- [ ] Check memory usage over time
- [ ] Test with slow network

### Configuration Review

- [ ] Appropriate debounce value
- [ ] Optimal batch size
- [ ] Targeted selectors
- [ ] Disabled unused features
- [ ] Sufficient initial delay

### Code Review

- [ ] Cleanup in `onUnmounted`
- [ ] No memory leaks
- [ ] Efficient selectors
- [ ] Minimal DOM queries
- [ ] Batch DOM updates

## Advanced Techniques

### Web Workers (Future)

Processing in background thread:

```javascript
// Future API concept
const worker = new Worker('smartscript-worker.js')

worker.postMessage({
  text: documentText,
  patterns: patterns
})

worker.onmessage = (e) => {
  applyTransformations(e.data)
}
```

### RequestIdleCallback

Process during idle time:

```javascript
function processWhenIdle() {
  requestIdleCallback((deadline) => {
    while (deadline.timeRemaining() > 0 && pendingNodes.length > 0) {
      const node = pendingNodes.shift()
      processNode(node)
    }
    
    if (pendingNodes.length > 0) {
      processWhenIdle() // Continue in next idle period
    }
  })
}
```

### Progressive Enhancement

Start with CSS, enhance with JS:

```css
/* Basic styling without JS */
.trademark::after {
  content: "™";
  vertical-align: super;
  font-size: 0.8em;
}

/* Enhanced with JS */
.auto-super.trademark-symbol {
  /* More precise positioning */
}
```

## Performance Budgets

Set limits for your application:

| Metric | Target | Maximum |
|--------|--------|---------|
| Initial processing | <100ms | <200ms |
| Update processing | <50ms | <100ms |
| Memory overhead | <5MB | <10MB |
| CPU usage | <10% | <20% |

## Monitoring in Production

Track real-world performance:

```javascript
// Send metrics to analytics
if (window.performance && window.performance.measure) {
  const measure = performance.getEntriesByName('smartscript-process')[0]
  
  // Send to analytics
  gtag('event', 'timing_complete', {
    name: 'smartscript_process',
    value: Math.round(measure.duration)
  })
}
```

## Conclusion

SmartScript is designed to be performant by default, but every application is different. Use these techniques to optimize for your specific needs:

1. **Start with defaults** - They work well for most cases
2. **Measure first** - Don't optimize prematurely
3. **Target bottlenecks** - Focus on actual problems
4. **Test thoroughly** - On real devices and data

Remember: The best performance optimization is often to process less content less frequently.