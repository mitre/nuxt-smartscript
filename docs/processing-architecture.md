# Processing Architecture

## Overview

This document details how nuxt-smartscript processes text and transforms it into properly formatted typography. The processing pipeline is identical for both client and server, ensuring consistent results.

## The Processing Pipeline

```mermaid
graph TD
    A[Input Element] --> B{Exclusion Check}
    B -->|Excluded| C[Skip Element]
    B -->|Process| D[TreeWalker Creation]
    
    D --> E[Find Text Nodes]
    E --> F{For Each Text Node}
    
    F --> G[Pattern Matching]
    G --> H{Matches Found?}
    H -->|No| I[Skip Node]
    H -->|Yes| J[Process Text]
    
    J --> K[Split into Parts]
    K --> L[Create Elements]
    L --> M[Build Fragment]
    M --> N[Replace Node]
    
    N --> F
    
    style A fill:#e3f2fd
    style N fill:#c8e6c9
```

## Detailed Processing Steps

### Step 1: Element Selection and Exclusion

```mermaid
graph LR
    A[Element] --> B{Matches Include Selector?}
    B -->|No| C[Skip]
    B -->|Yes| D{In Exclusion Zone?}
    
    D -->|Yes| E[Skip]
    D -->|No| F{Has Exclusion Attribute?}
    
    F -->|Yes| G[Skip]
    F -->|No| H{Already Processed?}
    
    H -->|Yes| I[Skip]
    H -->|No| J[Process Element]
    
    style C fill:#ffcdd2
    style E fill:#ffcdd2
    style G fill:#ffcdd2
    style I fill:#ffcdd2
    style J fill:#c8e6c9
```

**Exclusion Zones:**
- `<pre>` - Code blocks
- `<code>` - Inline code  
- `<script>` - JavaScript
- `<style>` - CSS
- `[data-no-superscript]` - Explicit opt-out
- `.no-superscript` - Class-based opt-out

### Step 2: Text Node Discovery

```javascript
// TreeWalker configuration
const walker = document.createTreeWalker(
  element,
  NodeFilter.SHOW_TEXT,
  {
    acceptNode(node) {
      // Skip empty nodes
      if (!node.textContent?.trim()) {
        return NodeFilter.FILTER_REJECT
      }
      
      // Skip if parent is already transformed
      if (parent.classList.contains('ss-tm')) {
        return NodeFilter.FILTER_REJECT
      }
      
      // Skip if in exclusion zone
      if (shouldExclude(node)) {
        return NodeFilter.FILTER_REJECT
      }
      
      return NodeFilter.FILTER_ACCEPT
    }
  }
)
```

### Step 3: Pattern Matching

```mermaid
graph TD
    A[Text Content] --> B[Combined Pattern]
    B --> C{Test Match}
    C -->|No Match| D[Return Original]
    C -->|Has Match| E[Reset lastIndex]
    
    E --> F[Process Each Pattern]
    F --> G[Trademark Check]
    F --> H[Registered Check]
    F --> I[Chemical Check]
    F --> J[Ordinal Check]
    F --> K[Math Check]
    
    G --> L[Collect Matches]
    H --> L
    I --> L
    J --> L
    K --> L
    
    L --> M[Sort by Position]
    M --> N[Return Match Array]
    
    style C fill:#fff9c4
    style N fill:#c8e6c9
```

**Pattern Priority Order:**
1. Symbols (™, ®, ©) - Highest priority
2. Ordinals (1st, 2nd) - Common in text
3. Chemicals (H2O, CO2) - Scientific notation
4. Math superscript (x^2) - Mathematical
5. Math subscript (x_n) - Lowest priority

### Step 4: Text Processing

```mermaid
graph LR
    A[Text: "Product(TM) is 1st"] --> B[Process Text]
    
    B --> C[Part 1: "Product"]
    B --> D[Part 2: "™" - symbol]
    B --> E[Part 3: " is 1"]
    B --> F[Part 4: "st" - ordinal]
    
    C --> G[Text Node]
    D --> H[SPAN Element]
    E --> I[Text Node]
    F --> J[SUP Element]
    
    style D fill:#ffecb3
    style F fill:#ffecb3
```

**TextPart Structure:**
```typescript
interface TextPart {
  content: string      // The text content
  type: 'text' | 'super' | 'sub'
  subtype?: 'trademark' | 'registered' | 'ordinal' | 'chemical' | 'math'
  originalLength: number  // For tracking position
}
```

### Step 5: Element Creation

```mermaid
graph TD
    A[TextPart] --> B{Type?}
    
    B -->|text| C[Create Text Node]
    
    B -->|super| D{Subtype?}
    D -->|trademark| E[Create SPAN.ss-tm]
    D -->|registered| F[Create SPAN.ss-reg]
    D -->|ordinal| G[Create SUP.ss-ordinal]
    D -->|math| H[Create SUP.ss-math]
    
    B -->|sub| I{Subtype?}
    I -->|chemical| J[Create SUB.ss-sub]
    I -->|math| K[Create SUB.ss-sub]
    
    E --> L[Add aria-label]
    F --> L
    G --> L
    H --> L
    J --> L
    K --> L
    
    style E fill:#ffe0b2
    style F fill:#ffe0b2
    style G fill:#e1bee7
    style H fill:#e1bee7
    style J fill:#c5e1a5
    style K fill:#c5e1a5
```

**Element Types:**
- **SPAN** - For positioned symbols (™, ®)
  - Allows `position: relative` for fine control
  - Used for trademark and registered marks
  
- **SUP** - For semantic superscripts
  - Ordinals (1st, 2nd)
  - Math superscripts (x²)
  
- **SUB** - For semantic subscripts  
  - Chemical formulas (H₂O)
  - Math subscripts (xₙ)

### Step 6: DOM Replacement

```mermaid
sequenceDiagram
    participant TextNode
    participant Fragment
    participant Parent
    participant DOM
    
    TextNode->>Fragment: Add processed parts
    Fragment->>Fragment: Build complete fragment
    
    Parent->>Parent: Store reference
    Parent->>TextNode: Remove original
    Parent->>Fragment: Insert at position
    
    Fragment->>DOM: Update complete
    DOM->>DOM: Mark as processed
```

## Pattern Details

### Symbol Patterns

```mermaid
graph LR
    A["(TM)"] --> B[Match Groups]
    B --> C[Full: "(TM)"]
    C --> D[Transform: "™"]
    D --> E["<span class='ss-tm'>™</span>"]
    
    F["™"] --> G[Direct Match]
    G --> H[Transform: "™"]
    H --> E
    
    style A fill:#e3f2fd
    style F fill:#e3f2fd
    style E fill:#c8e6c9
```

### Chemical Patterns

```mermaid
graph TD
    A["H2O"] --> B[Regex: /([A-Z][a-z]?)(\d+)/g]
    B --> C[Group 1: "H"]
    B --> D[Group 2: "2"]
    B --> E[After: "O"]
    
    C --> F[Keep as text]
    D --> G[Create subscript]
    E --> H[Keep as text]
    
    F --> I["H"]
    G --> J["<sub>2</sub>"]
    H --> K["O"]
    
    I --> L[Result: "H<sub>2</sub>O"]
    J --> L
    K --> L
    
    style A fill:#e3f2fd
    style L fill:#c8e6c9
```

### Math Notation Patterns

```mermaid
graph LR
    subgraph "Superscript"
        A1["x^2"] --> B1[Variable: "x"]
        A1 --> C1[Symbol: "^"]
        A1 --> D1[Exponent: "2"]
        D1 --> E1["<sup>2</sup>"]
    end
    
    subgraph "Subscript"
        A2["x_n"] --> B2[Variable: "x"]
        A2 --> C2[Symbol: "_"]
        A2 --> D2[Index: "n"]
        D2 --> E2["<sub>n</sub>"]
    end
    
    subgraph "LaTeX Braces"
        A3["x_{n+1}"] --> B3[Variable: "x"]
        A3 --> C3[Symbol: "_"]
        A3 --> D3[Expression: "{n+1}"]
        D3 --> E3[Strip braces]
        E3 --> F3["<sub>n+1</sub>"]
    end
```

## Performance Optimizations

### Batch Processing

```mermaid
graph TD
    A[Find All Text Nodes] --> B[Collect in Array]
    B --> C{Array Size}
    
    C -->|< 50| D[Process All]
    C -->|>= 50| E[Process Batch]
    
    E --> F[Process 50]
    F --> G[Yield to Browser]
    G --> H[Next Batch]
    H --> E
    
    D --> I[Complete]
    E --> I
    
    style G fill:#fff9c4
```

### Pattern Caching

```mermaid
graph LR
    A[Text Input] --> B{In Cache?}
    B -->|Yes| C[Return Cached]
    B -->|No| D[Process Text]
    D --> E[Store in Cache]
    E --> F[Return Result]
    
    C --> G[Fast Response]
    F --> G
    
    style C fill:#c8e6c9
    style G fill:#c8e6c9
```

### Early Exit Strategies

```mermaid
graph TD
    A[Start Processing] --> B{Quick Checks}
    
    B --> C{Empty Text?}
    C -->|Yes| D[Exit Early]
    
    B --> E{No Patterns?}
    E -->|Yes| F[Exit Early]
    
    B --> G{Already Processed?}
    G -->|Yes| H[Exit Early]
    
    B --> I{Combined Pattern Match?}
    I -->|No| J[Exit Early]
    I -->|Yes| K[Full Processing]
    
    style D fill:#ffcdd2
    style F fill:#ffcdd2
    style H fill:#ffcdd2
    style J fill:#ffcdd2
    style K fill:#c8e6c9
```

## Debugging and Logging

```mermaid
graph TD
    A[Debug Mode On] --> B[Log Level: Verbose]
    
    B --> C[Pattern Matches]
    C --> C1["[debug] Pattern 'trademark' matched at position 8"]
    
    B --> D[Processing Stats]
    D --> D1["[info] Processed 47 text nodes in 23ms"]
    
    B --> E[Exclusions]
    E --> E1["[debug] Skipped <pre> element"]
    
    B --> F[Errors]
    F --> F1["[error] Failed to process node: ..."]
    
    C1 --> G[Console Output]
    D1 --> G
    E1 --> G
    F1 --> G
    
    style A fill:#fff9c4
```

## Error Recovery

```mermaid
graph TD
    A[Processing Error] --> B{Error Type}
    
    B -->|Pattern Error| C[Log Warning]
    C --> D[Skip Pattern]
    D --> E[Continue with Others]
    
    B -->|DOM Error| F[Log Error]
    F --> G[Restore Original]
    G --> H[Mark as Failed]
    
    B -->|Memory Error| I[Stop Batch]
    I --> J[Clear Cache]
    J --> K[Retry Smaller Batch]
    
    E --> L[Partial Success]
    H --> M[Graceful Failure]
    K --> N[Recovery]
    
    style C fill:#ffe082
    style F fill:#ffccbc
    style I fill:#ffccbc
```

## Integration Points

### Client-Side Integration

```javascript
// Vue integration
app.config.globalProperties.$smartscript = {
  process: (element) => engine.processElement(element),
  refresh: () => engine.processAll(),
  disable: () => engine.stop(),
  enable: () => engine.start()
}
```

### Server-Side Integration

```javascript
// Nitro hook integration
nitro.hooks.hook('render:html', (html, { event }) => {
  const config = event.context.$config.public.smartscript
  const processed = processWithJsdom(html, config)
  return processed
})
```

### Configuration Integration

```javascript
// Runtime config merge
const finalConfig = {
  ...defaultConfig,
  ...userConfig,
  transformations: {
    ...defaultConfig.transformations,
    ...userConfig.transformations
  }
}
```