# Deployment Modes

## Overview

nuxt-smartscript supports different processing modes optimized for various deployment scenarios. Understanding these modes helps you choose the best configuration for your application's needs.

## Available Modes

### Server-Side Rendering (SSR)

**When to use**: Production deployments, static site generation, SEO-critical applications

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript'],
  smartscript: {
    ssr: true,      // Enable server-side processing
    client: true    // Also process dynamic content
  }
})
```

**Benefits**:
- ✅ SEO-friendly - search engines see transformed content
- ✅ No flash of untransformed content (FOUT)
- ✅ Faster initial render - content arrives pre-transformed
- ✅ Works with static generation (`nuxt generate`)

**Considerations**:
- Requires jsdom on the server
- Slightly increased build/generation time
- In development, disabled by default to avoid hydration warnings

### Client-Side Only

**When to use**: Development, SPAs, highly dynamic applications

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript'],
  smartscript: {
    ssr: false,     // Disable server processing
    client: true    // Enable client processing
  }
})
```

**Benefits**:
- ✅ Works with all dynamic content
- ✅ No server dependencies
- ✅ Simple debugging in browser DevTools
- ✅ Handles user-generated content

**Considerations**:
- Brief flash of untransformed content
- Requires JavaScript to be enabled
- Not ideal for SEO-critical content

### Hybrid Mode (Default)

**When to use**: Applications with both static and dynamic content

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript'],
  smartscript: {
    ssr: true,      // Process during SSR/generation
    client: true    // Also process dynamic content
  }
})
```

**Benefits**:
- ✅ Best of both worlds
- ✅ Static content is pre-transformed
- ✅ Dynamic content still works
- ✅ Automatic detection prevents double-processing

**How it works**:
1. During SSR/static generation, content is transformed server-side
2. Transformed elements are marked with `data-smartscript-processed`
3. Client-side plugin skips already-processed elements
4. New dynamic content is still transformed

## Mode Selection Guide

### Static Documentation Sites

**Examples**: Technical documentation, blogs, marketing sites

```typescript
smartscript: {
  ssr: true,       // Transform at build time
  client: false    // No client JS needed
}
```

This produces the smallest bundle and best performance for static content.

### Dynamic Applications

**Examples**: Chat apps, forums, real-time dashboards

```typescript
smartscript: {
  ssr: false,      // Skip server processing
  client: true     // Handle all content client-side
}
```

Optimized for constantly changing content.

### Content Management Systems

**Examples**: WordPress with Nuxt, Strapi sites

```typescript
smartscript: {
  ssr: true,       // Initial content from CMS
  client: true     // Handle AJAX-loaded content
}
```

Handles both server-rendered CMS content and dynamically loaded content.

## Development vs Production

### Development Mode

By default, SSR is disabled in development to avoid hydration warnings:

```typescript
// Automatic behavior in development
if (nuxt.options.dev) {
  // SSR disabled unless forced
  config.ssr = false
}
```

To force SSR in development for testing:

```typescript
smartscript: {
  ssr: 'force'    // Enable SSR even in dev mode
}
```

### Production Mode

In production builds and static generation, SSR is automatically enabled:

```typescript
// Automatic behavior in production
if (!nuxt.options.dev) {
  // SSR enabled by default
  config.ssr = true
}
```

## Performance Considerations

### Build Time Impact

| Mode | Build Time | Bundle Size | Runtime Performance |
|------|------------|-------------|-------------------|
| SSR Only | +100-200ms | Smallest | Fastest |
| Client Only | Baseline | Small | Good |
| Hybrid | +100-200ms | Medium | Best |

### Memory Usage

- **SSR**: Requires jsdom (~30MB) during build
- **Client**: Minimal memory overhead (~1MB)
- **Hybrid**: Both build and runtime overhead

## Configuration Examples

### Minimal Static Site

```typescript
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript'],
  smartscript: {
    ssr: true,
    client: false,
    transformations: {
      trademark: true,
      registered: true
    }
  }
})
```

### Full-Featured Application

```typescript
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript'],
  smartscript: {
    ssr: true,
    client: true,
    debug: true,
    performance: {
      debounce: 100,
      batchSize: 50
    },
    transformations: {
      trademark: true,
      registered: true,
      copyright: true,
      ordinals: true,
      mathSuperscript: true,
      mathSubscript: true,
      chemicalFormulas: true
    }
  }
})
```

## Troubleshooting

### Hydration Warnings

**Problem**: "Hydration text mismatch" warnings in development

**Solution**: This is expected in dev mode. SSR is disabled by default. To test SSR:
```typescript
smartscript: { ssr: 'force' }
```

### Content Not Transforming

**Problem**: Content appears untransformed

**Check**:
1. Verify mode settings match your deployment
2. Check browser console for errors
3. Ensure content isn't in an exclusion zone (`<pre>`, `<code>`)
4. Verify transformations are enabled

### Double Processing

**Problem**: Content transforms twice or incorrectly

**Solution**: Ensure you're not manually calling the processor on already-processed content. The hybrid mode handles this automatically.

## Best Practices

1. **Choose one primary mode** - Don't overthink hybrid scenarios
2. **Test your production mode** locally with `nuxt build && nuxt preview`
3. **Use exclusion zones** for content that shouldn't transform
4. **Enable debug mode** when troubleshooting: `debug: true`
5. **Monitor performance** in production with browser DevTools

## Migration Guide

### From v0.3.x (Client-Only)

```typescript
// Old (v0.3.x) - Client only
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript']
})

// New (v0.4.0) - With SSR support
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript'],
  smartscript: {
    ssr: true,     // Add SSR support
    client: true   // Keep client support
  }
})
```

### For Static Sites

To optimize your static site, disable client-side processing:

```typescript
// Before - processes client-side
smartscript: {}

// After - processes at build time only
smartscript: {
  ssr: true,
  client: false  // Disable client JS
}
```

This removes unnecessary JavaScript from your static site.