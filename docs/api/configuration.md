# Configuration

## Module Options

Configure the plugin in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript'],
  
  smartscript: {
    // Enable/disable the plugin
    enabled: true,
    
    // SSR/SSG configuration (v0.4.0+)
    ssr: true,        // Enable server-side rendering
    client: true,     // Enable client-side processing
    
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
    },
    
    // Customize CSS class names (optional)
    cssClasses: {
      superscript: 'custom-sup',    // Default: 'ss-sup'
      subscript: 'custom-sub',      // Default: 'ss-sub'
      trademark: 'custom-tm',       // Default: 'ss-tm'
      registered: 'custom-reg',     // Default: 'ss-reg'
      ordinal: 'custom-ord',        // Default: 'ss-ordinal'
      math: 'custom-math'           // Default: 'ss-math'
    },
    
    // Enable/disable specific transformations (optional)
    transformations: {
      trademark: true,    // Transform (TM) and ™
      registered: true,   // Transform (R) and ®
      copyright: true,    // Transform (C) and ©
      ordinals: true,     // Transform 1st, 2nd, etc.
      chemicals: true,    // Transform H2O, CO2, etc.
      mathSuper: true,    // Transform x^2, E=mc^2
      mathSub: true       // Transform x_1, x_n
    }
  }
})
```

## Custom Patterns (Advanced)

For advanced users, you can override the default regex patterns with custom ones. This allows you to:
- Handle special cases specific to your content
- Add support for new pattern types
- Restrict patterns to more specific formats

### ⚠️ Warning
Custom patterns require regex knowledge. Invalid patterns will fall back to defaults with a warning.

### Custom Pattern Examples

#### Restrict Trademark to Specific Format
```typescript
export default defineNuxtConfig({
  smartscript: {
    customPatterns: {
      // Only match (TM) in parentheses, not standalone TM
      trademark: '\\(TM\\)'
    }
  }
})
```

#### Extended Ordinal Support
```typescript
export default defineNuxtConfig({
  smartscript: {
    customPatterns: {
      // Include Roman numerals: 1st, XXIst, IVth
      ordinals: '\\b(\\d+|[IVX]+)(st|nd|rd|th)\\b'
    }
  }
})
```

#### Specific Chemical Formulas
```typescript
export default defineNuxtConfig({
  smartscript: {
    customPatterns: {
      // Only match water, carbon dioxide, and oxygen
      chemicals: '(H2O|CO2|O2)'
    }
  }
})
```

#### Custom Math Notation
```typescript
export default defineNuxtConfig({
  smartscript: {
    customPatterns: {
      // Require whitespace before math notation
      mathSuper: '\\s([a-z])\\^(\\d+)',
      mathSub: '\\s([a-z])_(\\d+)'
    }
  }
})
```

### Pattern Format

All custom patterns should be provided as strings (without regex delimiters):
- ✅ Correct: `'\\(TM\\)'`
- ❌ Wrong: `/\(TM\)/g`

The patterns will be compiled with the global flag (`g`) automatically.

### Combining with Transformations

You can combine custom patterns with transformation toggles:

```typescript
export default defineNuxtConfig({
  smartscript: {
    // Disable ordinals
    transformations: {
      ordinals: false
    },
    // Custom trademark pattern
    customPatterns: {
      trademark: '\\bTM\\b'  // Only standalone TM
    }
  }
})
```

## Transformation Control

You can selectively enable or disable specific transformation types. This is useful when you only need certain transformations or want to avoid conflicts with specific content.

### Disable Specific Transformations

```typescript
export default defineNuxtConfig({
  smartscript: {
    transformations: {
      // Only process trademark and registered symbols
      trademark: true,
      registered: true,
      copyright: true,
      // Disable all others
      ordinals: false,    // Won't transform 1st, 2nd, etc.
      chemicals: false,   // Won't transform H2O, CO2
      mathSuper: false,   // Won't transform x^2
      mathSub: false      // Won't transform x_1
    }
  }
})
```

### Common Use Cases

#### Legal/Business Documents
Only process trademark and copyright symbols:

```typescript
transformations: {
  trademark: true,
  registered: true,
  copyright: true,
  ordinals: false,
  chemicals: false,
  mathSuper: false,
  mathSub: false
}
```

#### Scientific Documents
Only process chemicals and math:

```typescript
transformations: {
  trademark: false,
  registered: false,
  copyright: false,
  ordinals: false,
  chemicals: true,
  mathSuper: true,
  mathSub: true
}
```

#### Blog/General Content
Process everything except math (which might conflict with markdown):

```typescript
transformations: {
  trademark: true,
  registered: true,
  copyright: true,
  ordinals: true,
  chemicals: true,
  mathSuper: false,  // Avoid conflicts with markdown
  mathSub: false     // Avoid conflicts with file_names
}
```

## CSS Class Names

### Default Classes

The plugin uses the following default CSS classes:

| Element Type | Default Class | Secondary Class | Description |
|-------------|---------------|-----------------|-------------|
| Superscript | `ss-sup` | - | Base class for all superscript elements |
| Subscript | `ss-sub` | - | Base class for all subscript elements |
| Trademark | `ss-sup` | `ss-tm` | Trademark symbols (™, TM) |
| Registered | `ss-sup` | `ss-reg` | Registered symbols (®, R) |
| Ordinal | `ss-sup` | `ss-ordinal` | Ordinal numbers (1st, 2nd, etc.) |
| Math | `ss-sup` or `ss-sub` | `ss-math` | Math notation (x^2, x_1) |

### Working with CSS Classes

The default CSS classes can be targeted in your stylesheets:

```css
/* Target specific element types */
.ss-sup.ss-tm { /* Trademark symbols */ }
.ss-sup.ss-reg { /* Registered symbols */ }
.ss-sup.ss-ordinal { /* Ordinal numbers */ }
.ss-sup.ss-math { /* Math superscripts */ }
.ss-sub.ss-math { /* Math subscripts */ }
.ss-sub { /* Chemical formulas and subscripts */ }
```

### Finding Elements in JavaScript

```javascript
// Find all transformed elements
const trademarks = document.querySelectorAll('.ss-tm')
const registered = document.querySelectorAll('.ss-reg')
const ordinals = document.querySelectorAll('.ss-ordinal')
const mathElements = document.querySelectorAll('.ss-math')
const subscripts = document.querySelectorAll('.ss-sub')
```

## CSS Customization

Override the default styles in your CSS:

```css
/* Adjust all superscript elements */
sup.ss-sup {
  vertical-align: super;
  font-size: 0.75em;
  line-height: 0;
}

/* Customize trademark symbols specifically */
sup.ss-sup.ss-tm {
  font-size: 0.8em;
  position: relative;
  top: -0.1em;
}

/* Customize registered symbols */
sup.ss-sup.ss-reg {
  font-size: 0.8em;
}

/* Style ordinal numbers */
sup.ss-sup.ss-ordinal {
  font-size: 0.7em;
}

/* Different styles for headers */
h1 sup.ss-sup {
  font-size: 0.6em;
}

/* Customize subscript elements */
sub.ss-sub {
  vertical-align: sub;
  font-size: 0.75em;
  line-height: 0;
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
- **Automatically excluded**: Elements already processed by the plugin (`sup.ss-sup`, `sub.ss-sub`)

### Why Processed Elements are Excluded

The plugin automatically excludes its own generated `<sup>` and `<sub>` elements to prevent double-processing. This ensures that:
- Text is only transformed once
- Performance is optimized by skipping already-processed content
- The plugin can safely run multiple times without creating nested elements