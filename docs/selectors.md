# Default Selectors

This document describes which HTML elements are processed by nuxt-smartscript by default and which are excluded.

## Elements Processed by Default

### Container Elements
- `main` - Main content areas
- `article` - Article containers
- `section` - Content sections
- `header` - Header areas
- `footer` - Footer areas
- `.content` - Elements with "content" class
- `[role="main"]` - Elements with main ARIA role
- `.prose` - Prose content (common in documentation)
- `.blog-post` - Blog post containers
- `.blog-content` - Blog content areas

### Heading Elements
All heading levels are processed:
- `h1`, `h2`, `h3`, `h4`, `h5`, `h6`

### Text Content Elements
- `p` - Paragraphs
- `li` - List items
- `td` - Table cells
- `th` - Table headers
- `blockquote` - Block quotes
- `caption` - Table/figure captions
- `dt` - Definition terms
- `dd` - Definition descriptions
- `figcaption` - Figure captions

### Inline Elements
- `span` - Generic inline containers
- `a` - Links
- `strong` - Strong emphasis
- `em` - Emphasis
- `b` - Bold text
- `i` - Italic text
- `small` - Small print (often legal text)
- `cite` - Citations
- `abbr` - Abbreviations

### Interactive Elements
- `button` - Button text
- `label` - Form labels
- `legend` - Fieldset legends
- `summary` - Details/summary elements

### Other Semantic Elements
- `address` - Contact information

## Elements Excluded by Default

### Code Elements
- `pre` - Preformatted code blocks
- `code` - Inline code
- `script` - Script tags
- `style` - Style tags

### Custom Exclusions
- `.no-superscript` - Elements with this class
- `[data-no-superscript]` - Elements with this data attribute

### Already Processed
These classes indicate content already transformed:
- `sup.ss-sup` - Already superscripted elements
- `sub.ss-sub` - Already subscripted elements
- `.ss-tm` - Trademark symbols
- `.ss-reg` - Registered symbols
- `.ss-ordinal` - Ordinal numbers
- `.ss-chemical` - Chemical formulas
- `.ss-math` - Mathematical notation

## Customizing Selectors

You can customize which elements are processed in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  smartscript: {
    selectors: {
      // Add more selectors
      include: [
        ...defaultSelectors,
        '.my-custom-class',
        'custom-element'
      ],
      // Add more exclusions
      exclude: [
        ...defaultExclusions,
        '.skip-this',
        '[data-raw-text]'
      ]
    }
  }
})
```

## Best Practices

1. **Performance**: More specific selectors (classes, IDs) are faster than broad element selectors
2. **Avoid Over-Processing**: Don't include generic containers like `div` unless necessary
3. **Test Thoroughly**: When adding new selectors, test that they don't interfere with your layout
4. **Use Exclusions**: Use the exclusion classes/attributes to skip specific elements

## Common Use Cases

### Documentation Sites
The default selectors work well for documentation with the `.prose` class and semantic HTML.

### Blogs
Blog-specific classes like `.blog-post` and `.blog-content` are included by default.

### Applications
Interactive elements like buttons and form labels are processed to handle branded UI text.

### Legal Text
The `small` element is included as it often contains copyright notices and legal text with ® and ™ symbols.