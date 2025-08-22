# Custom Patterns

Learn how to extend SmartScript with your own custom text transformation patterns.

## Understanding the Pattern System

SmartScript uses a modular pattern system with three main components:

1. **Pattern Definition** - Regular expressions that match text
2. **Pattern Matching** - Functions to identify pattern types
3. **Pattern Processing** - Logic to transform matched text

## Adding a New Pattern

### Example: Fraction Support

Let's add support for transforming fractions like `1/2` into properly formatted HTML with superscript numerator and subscript denominator.

### Step 1: Define the Pattern

Edit `src/runtime/smartscript/patterns.ts`:

```typescript
export function createPatterns(config: SuperscriptConfig): PatternSet {
  return {
    // ... existing patterns
    
    // Add fraction pattern
    fractions: /\b(\d+)\/(\d+)\b/g,
  }
}
```

### Step 2: Add Pattern Matcher

In the same file, add to `PatternMatchers`:

```typescript
export const PatternMatchers = {
  // ... existing matchers
  
  isFraction: (text: string): boolean => /^\d+\/\d+$/.test(text),
}
```

### Step 3: Add Extraction Logic

Add to `PatternExtractors`:

```typescript
export const PatternExtractors = {
  // ... existing extractors
  
  extractFraction: (text: string): { numerator: string; denominator: string } | null => {
    const match = text.match(/^(\d+)\/(\d+)$/)
    return match ? { numerator: match[1], denominator: match[2] } : null
  },
}
```

### Step 4: Process the Match

Edit `src/runtime/smartscript/processor.ts`:

```typescript
export function processMatch(matched: string): ProcessingResult {
  // ... existing processing
  
  // Handle fractions
  if (PatternMatchers.isFraction(matched)) {
    const fraction = PatternExtractors.extractFraction(matched)
    if (fraction) {
      return {
        modified: true,
        parts: [
          { type: 'super', content: fraction.numerator },
          { type: 'text', content: '⁄' }, // Fraction slash
          { type: 'sub', content: fraction.denominator },
        ],
      }
    }
  }
  
  // ... rest of processing
}
```

### Step 5: Update Combined Pattern

Edit `src/runtime/smartscript/patterns.ts`:

```typescript
export function createCombinedPattern(patterns: PatternSet, config: SuperscriptConfig): RegExp {
  const sources = [
    patterns.trademark.source,
    patterns.registered.source,
    patterns.copyright.source,
    config.symbols.ordinals ? patterns.ordinals.source : null,
    patterns.chemicals.source,
    patterns.mathSuper.source,
    patterns.mathSub.source,
    patterns.fractions?.source, // Add fractions
  ].filter(Boolean)

  return new RegExp(sources.join('|'), 'g')
}
```

### Step 6: Add Tests

Create tests in `test/typography.test.ts`:

```typescript
describe('Fractions', () => {
  it('should match fraction patterns', () => {
    const pattern = /\b(\d+)\/(\d+)\b/g
    expect('1/2 cup'.match(pattern)).toEqual(['1/2'])
    expect('Mix 3/4 sugar'.match(pattern)).toEqual(['3/4'])
  })
  
  it('should extract fraction parts', () => {
    const extractor = PatternExtractors.extractFraction
    expect(extractor('1/2')).toEqual({ numerator: '1', denominator: '2' })
    expect(extractor('3/4')).toEqual({ numerator: '3', denominator: '4' })
    expect(extractor('not/fraction')).toBeNull()
  })
  
  it('should process fractions correctly', () => {
    const result = processMatch('1/2')
    expect(result.modified).toBe(true)
    expect(result.parts).toEqual([
      { type: 'super', content: '1' },
      { type: 'text', content: '⁄' },
      { type: 'sub', content: '2' },
    ])
  })
})
```

### Step 7: Update Playground

Add examples to `playground/app.vue`:

```vue
<section>
  <h2>Fractions</h2>
  <p>Recipe: Add 1/2 cup flour and 3/4 cup sugar</p>
  <p>Math: 2/3 + 1/4 = 11/12</p>
</section>
```

## Advanced Pattern Examples

### Unicode Arrows

Transform `->`, `=>`, `<-` into arrow symbols:

```typescript
// patterns.ts
arrows: /(->|=>|<-|<=>)/g,

// PatternMatchers
isArrow: (text: string): boolean => /^(->|=>|<-|<=>)$/.test(text),

// processor.ts
if (PatternMatchers.isArrow(matched)) {
  const arrows = {
    '->': '→',
    '=>': '⇒',
    '<-': '←',
    '<=>': '⇔',
  }
  return {
    modified: true,
    parts: [{ type: 'text', content: arrows[matched] || matched }],
  }
}
```

### Roman Numerals

Add superscript to roman numerals in specific contexts:

```typescript
// patterns.ts
romanNumerals: /\b(I{1,3}|IV|V|VI{1,3}|IX|X)\b(?=\s+(century|chapter|section))/gi,

// processor.ts
if (/^(I{1,3}|IV|V|VI{1,3}|IX|X)$/i.test(matched)) {
  return {
    modified: true,
    parts: [{ type: 'super', content: matched }],
  }
}
```

### Currency Symbols

Convert currency codes to symbols:

```typescript
// patterns.ts
currency: /\b(USD|EUR|GBP|JPY)\b/g,

// processor.ts
if (PatternMatchers.isCurrency(matched)) {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
  }
  return {
    modified: true,
    parts: [{ type: 'text', content: symbols[matched] || matched }],
  }
}
```

## Configuration-Driven Patterns

Make patterns configurable through `nuxt.config.ts`:

### Step 1: Extend Config Type

```typescript
// types.ts
interface SuperscriptConfig {
  symbols: {
    // ... existing
    fractions?: boolean
    arrows?: boolean
    currency?: boolean
  }
  customPatterns?: {
    [key: string]: {
      pattern: string
      flags?: string
      replacer: (match: string) => string
    }
  }
}
```

### Step 2: Use Config in Patterns

```typescript
// patterns.ts
export function createPatterns(config: SuperscriptConfig): PatternSet {
  const patterns: PatternSet = {
    // Core patterns...
  }
  
  // Add optional patterns
  if (config.symbols.fractions) {
    patterns.fractions = /\b(\d+)\/(\d+)\b/g
  }
  
  if (config.symbols.arrows) {
    patterns.arrows = /(->|=>|<-|<=>)/g
  }
  
  // Add custom patterns
  if (config.customPatterns) {
    Object.entries(config.customPatterns).forEach(([key, def]) => {
      patterns[key] = new RegExp(def.pattern, def.flags || 'g')
    })
  }
  
  return patterns
}
```

### Step 3: User Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-smartscript'],
  
  smartscript: {
    symbols: {
      fractions: true,
      arrows: true,
    },
    
    customPatterns: {
      emoji: {
        pattern: ':([a-z]+):',
        replacer: (match) => {
          const emojis = {
            ':smile:': '😊',
            ':heart:': '❤️',
            ':check:': '✓',
          }
          return emojis[match] || match
        }
      }
    }
  }
})
```

## Pattern Best Practices

### 1. Performance Considerations

```typescript
// ❌ Bad: Too broad, matches everything
/\w+/g

// ✅ Good: Specific and bounded
/\b(TM|R|C)\b/g
```

### 2. Avoid Conflicts

```typescript
// Check for conflicts with existing patterns
export function validatePatterns(patterns: PatternSet): string[] {
  const errors = []
  
  // Test for overlapping patterns
  const testString = 'H2O (TM) 1st x^2'
  const matches = {}
  
  Object.entries(patterns).forEach(([name, pattern]) => {
    const found = testString.match(pattern)
    if (found) {
      found.forEach(match => {
        if (matches[match]) {
          errors.push(`Pattern conflict: "${match}" matched by both ${matches[match]} and ${name}`)
        }
        matches[match] = name
      })
    }
  })
  
  return errors
}
```

### 3. Use Non-Capturing Groups

```typescript
// ❌ Bad: Creates unnecessary capture groups
/(hello|world)/g

// ✅ Good: Non-capturing for performance
/(?:hello|world)/g
```

### 4. Handle Edge Cases

```typescript
export function processMatch(matched: string): ProcessingResult {
  // Always validate input
  if (!matched || matched.length > 100) {
    return { modified: false, parts: [] }
  }
  
  // Handle special characters
  const escaped = matched.replace(/[<>&]/g, (char) => {
    const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;' }
    return entities[char] || char
  })
  
  // Process...
}
```

## Testing Custom Patterns

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { PatternMatchers, processMatch } from '../src/runtime/smartscript'

describe('Custom Pattern: Fractions', () => {
  it('should identify fractions', () => {
    expect(PatternMatchers.isFraction('1/2')).toBe(true)
    expect(PatternMatchers.isFraction('10/3')).toBe(true)
    expect(PatternMatchers.isFraction('a/b')).toBe(false)
  })
  
  it('should process simple fractions', () => {
    const result = processMatch('1/2')
    expect(result.parts).toHaveLength(3)
    expect(result.parts[0].type).toBe('super')
    expect(result.parts[2].type).toBe('sub')
  })
  
  it('should handle edge cases', () => {
    expect(processMatch('0/0').modified).toBe(true)
    expect(processMatch('1/0').modified).toBe(true) // May want to handle differently
  })
})
```

### Integration Tests

```typescript
describe('Custom Pattern Integration', () => {
  it('should work with existing patterns', () => {
    const text = 'Mix 1/2 cup H2O at 100(C)'
    const processed = processAllPatterns(text)
    
    expect(processed).toContain('<sup>1</sup>')
    expect(processed).toContain('<sub>2</sub>')
    expect(processed).toContain('©')
  })
  
  it('should respect configuration', () => {
    const config = { symbols: { fractions: false } }
    const patterns = createPatterns(config)
    
    expect(patterns.fractions).toBeUndefined()
  })
})
```

## Debugging Tips

### 1. Pattern Testing Tool

Create a test page for pattern development:

```vue
<!-- pages/pattern-test.vue -->
<template>
  <div class="pattern-tester">
    <textarea v-model="input" placeholder="Enter test text..." />
    <input v-model="pattern" placeholder="Enter regex pattern..." />
    
    <div class="results">
      <h3>Matches:</h3>
      <pre>{{ matches }}</pre>
      
      <h3>Processed:</h3>
      <div v-html="processed" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const input = ref('Test 1/2 and 3/4 fractions')
const pattern = ref('\\b(\\d+)\\/(\\d+)\\b')

const matches = computed(() => {
  try {
    const regex = new RegExp(pattern.value, 'g')
    return input.value.match(regex)
  } catch (e) {
    return `Error: ${e.message}`
  }
})
</script>
```

### 2. Logging

Add debug logging to pattern processing:

```typescript
export function processMatch(matched: string): ProcessingResult {
  if (process.env.NODE_ENV === 'development') {
    console.log('[SmartScript] Processing:', matched)
  }
  
  // Processing logic...
  
  if (process.env.NODE_ENV === 'development' && result.modified) {
    console.log('[SmartScript] Result:', result)
  }
  
  return result
}
```

## Next Steps

- Review [Performance](/advanced/performance) considerations
- See [Architecture](/architecture) for deeper understanding
- Check [Contributing Guide](https://github.com/mitre/nuxt-smartscript/blob/main/CONTRIBUTING.md) for submitting patterns