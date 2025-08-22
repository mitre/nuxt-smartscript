# Configuration

## Module Options

Configure the plugin in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-smartscript'],
  
  smartscript: {
    // Enable/disable the plugin
    enabled: true,
    
    // Customize positioning (in em units)
    positioning: {
      trademark: {
        body: '-0.5em',      // ™ in body text
        headers: '-0.7em',   // ™ in headers
        fontSize: '0.8em'
      },
      registered: {
        body: '-0.25em',     // ® in body text  
        headers: '-0.45em',  // ® in headers
        fontSize: '0.8em'
      }
    },
    
    // Performance settings
    performance: {
      debounce: 100,      // Debounce delay in ms
      batchSize: 50,      // Process in batches
      delay: 1500         // Initial delay for hydration
    }
  }
})
```

## CSS Customization

Override the default styles in your CSS:

```css
/* Adjust trademark positioning */
sup.trademark-symbol {
  top: -0.4em !important;
}

/* Adjust registered symbol */
sup.registered-symbol {
  top: -0.2em !important;
}

/* Different sizes for headers */
h1 sup.trademark-symbol {
  font-size: 0.6em;
}
```

## Excluding Elements

### Using Data Attributes

Exclude specific elements from processing:

```html
<!-- This content won't be processed -->
<div data-no-superscript>
  Keep (TM) and H2O as-is
</div>
```

### Using CSS Classes

```html
<!-- Add the no-superscript class -->
<p class="no-superscript">
  This text won't be transformed
</p>
```

## Selectors

By default, the plugin processes:
- `main`, `article`, `section`
- `.content`, `.prose`
- All heading tags (`h1`-`h6`)
- Elements with `role="main"`

And excludes:
- `pre`, `code` blocks
- `script`, `style` tags
- Elements with `data-no-superscript`
- Elements with `.no-superscript` class