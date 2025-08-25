# System Architecture

## High-Level Overview

nuxt-smartscript is a Nuxt 3 module that provides automatic typography transformations for both client-side and server-side rendering environments.

```mermaid
graph TB
    subgraph "Nuxt Application"
        A[Nuxt Content/Pages] --> B{Rendering Mode}
        B -->|Development| C[Client-Only Processing]
        B -->|Production SSR| D[Server Processing + Client]
        B -->|Static Generation| E[Build-time Processing]
    end
    
    subgraph "nuxt-smartscript Module"
        C --> F[Client Plugin<br/>plugin.ts]
        D --> G[Nitro Plugin<br/>plugin-jsdom.ts]
        D --> F
        E --> G
        
        F --> H[SmartScript Core]
        G --> H
        
        H --> I[Pattern Engine<br/>patterns.ts]
        H --> J[Text Processor<br/>processor.ts]
        H --> K[DOM Engine<br/>engine.ts]
        H --> L[Element Creator<br/>dom.ts]
    end
    
    subgraph "Output"
        F --> M[Transformed DOM]
        G --> N[Transformed HTML]
        M --> O[User Sees<br/>Typography ™]
        N --> O
    end
    
    style A fill:#e1f5fe
    style O fill:#c8e6c9
    style H fill:#fff9c4
```

## Component Architecture

```mermaid
graph LR
    subgraph "Module Entry Points"
        A[module.ts] --> B[Configuration]
        A --> C[Plugin Registration]
        A --> D[CSS Injection]
    end
    
    subgraph "Runtime Plugins"
        C --> E[Client Plugin<br/>runtime/plugin.ts]
        C --> F[Server Plugin<br/>runtime/nitro/plugin-jsdom.ts]
    end
    
    subgraph "Core Processing"
        E --> G[SmartScript Core]
        F --> G
        
        G --> H[patterns.ts<br/>Regex Patterns]
        G --> I[processor.ts<br/>Text → Parts]
        G --> J[engine.ts<br/>DOM Traversal]
        G --> K[dom.ts<br/>Element Creation]
        G --> L[config.ts<br/>Settings]
        G --> M[logger.ts<br/>Debug Output]
    end
    
    style A fill:#ffccbc
    style G fill:#fff9c4
```

## Processing Flow

### Client-Side Processing

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Vue
    participant Plugin
    participant Engine
    participant DOM
    
    User->>Browser: Load Page
    Browser->>Vue: Initialize App
    Vue->>Plugin: Mount Hook
    Plugin->>Plugin: Wait 1500ms (avoid hydration)
    Plugin->>Engine: Process Elements
    
    loop For Each Text Node
        Engine->>Engine: Check Exclusions
        Engine->>Engine: Match Patterns
        Engine->>Engine: Create Fragments
        Engine->>DOM: Replace Nodes
    end
    
    Plugin->>Plugin: Setup MutationObserver
    
    User->>Browser: Dynamic Content
    Browser->>Plugin: Mutation Event
    Plugin->>Engine: Process New Content
    Engine->>DOM: Update DOM
```

### Server-Side Processing (SSR/SSG)

```mermaid
sequenceDiagram
    participant Nuxt
    participant Nitro
    participant Plugin
    participant jsdom
    participant Engine
    participant HTML
    
    Nuxt->>Nitro: Render Route
    Nitro->>Plugin: render:html Hook
    Plugin->>Plugin: Check Config
    
    loop For Each HTML Chunk
        Plugin->>jsdom: Parse HTML
        jsdom->>jsdom: Create DOM
        Plugin->>Engine: Process Elements
        Engine->>jsdom: Modify DOM
        jsdom->>HTML: Serialize
    end
    
    Plugin->>HTML: Add Processed Flag
    Plugin->>Nitro: Return HTML
    Nitro->>Nuxt: Send to Client
```

## Data Flow

```mermaid
graph TD
    subgraph "Input"
        A[Raw Text: "Product(TM)"]
    end
    
    subgraph "Pattern Matching"
        A --> B[Regex: /™|\(TM\)/g]
        B --> C{Match Found?}
        C -->|Yes| D[Create TextPart]
        C -->|No| E[Skip]
    end
    
    subgraph "Processing"
        D --> F[Determine Type]
        F -->|Symbol| G[Create SPAN]
        F -->|Super| H[Create SUP]
        F -->|Sub| I[Create SUB]
    end
    
    subgraph "Output"
        G --> J["<span class='ss-tm'>™</span>"]
        H --> K["<sup class='ss-ordinal'>st</sup>"]
        I --> L["<sub class='ss-sub'>2</sub>"]
    end
    
    style A fill:#e3f2fd
    style J fill:#c8e6c9
    style K fill:#c8e6c9
    style L fill:#c8e6c9
```

## Configuration Flow

```mermaid
graph TD
    A[nuxt.config.ts] --> B[Module Options]
    B --> C[Runtime Config]
    
    C --> D{Environment}
    D -->|Client| E[Plugin reads config]
    D -->|Server| F[Nitro reads config]
    
    E --> G[mergeConfig()]
    F --> G
    
    G --> H[Default Config]
    G --> I[User Config]
    H --> J[Merged Config]
    I --> J
    
    J --> K[createPatterns()]
    K --> L[Pattern Set]
    
    J --> M[CSS Variables]
    M --> N[Runtime Styles]
    
    style A fill:#ffecb3
    style J fill:#c5e1a5
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        A[npm run dev] --> B[Vite Dev Server]
        B --> C[Client-Only Mode]
        C --> D[Hot Module Reload]
    end
    
    subgraph "Production SSR"
        E[npm run build] --> F[Nitro Build]
        F --> G[Server Bundle]
        F --> H[Client Bundle]
        G --> I[Node.js Server]
        H --> I
        I --> J[SSR + Hydration]
    end
    
    subgraph "Static Generation"
        K[npm run generate] --> L[Nitro Prerender]
        L --> M[Process All Routes]
        M --> N[Static HTML Files]
        N --> O[CDN/GitHub Pages]
    end
    
    style C fill:#fff3e0
    style J fill:#e8f5e9
    style O fill:#e1f5fe
```

## Pattern Types and Transformations

```mermaid
graph LR
    subgraph "Pattern Types"
        A[Symbols] --> A1["(TM) → ™"]
        A --> A2["(R) → ®"]
        A --> A3["(C) → ©"]
        
        B[Ordinals] --> B1["1st → 1<sup>st</sup>"]
        B --> B2["2nd → 2<sup>nd</sup>"]
        
        C[Chemicals] --> C1["H2O → H<sub>2</sub>O"]
        C --> C2["CO2 → CO<sub>2</sub>"]
        
        D[Math] --> D1["x^2 → x<sup>2</sup>"]
        D --> D2["x_n → x<sub>n</sub>"]
    end
    
    subgraph "Element Types"
        A1 --> E[SPAN with positioning]
        A2 --> E
        A3 --> E
        
        B1 --> F[SUP semantic]
        B2 --> F
        D1 --> F
        
        C1 --> G[SUB semantic]
        C2 --> G
        D2 --> G
    end
    
    style A fill:#ffcdd2
    style B fill:#f8bbd0
    style C fill:#e1bee7
    style D fill:#d1c4e9
```

## Error Handling

```mermaid
graph TD
    A[Processing Start] --> B{Try Processing}
    B -->|Success| C[Return Transformed]
    B -->|Error| D[Log Error]
    
    D --> E{Error Type}
    E -->|Pattern Error| F[Skip Pattern]
    E -->|DOM Error| G[Return Original]
    E -->|Config Error| H[Use Defaults]
    
    F --> I[Continue Processing]
    G --> J[Log Warning]
    H --> I
    
    I --> C
    J --> K[Return Unmodified]
    
    style D fill:#ffccbc
    style J fill:#ffe082
    style C fill:#c8e6c9
```

## Testing Architecture

```mermaid
graph TD
    subgraph "Test Layers"
        A[Unit Tests] --> A1[Functions in isolation]
        B[SSR Tests] --> B1[jsdom processing]
        C[Integration Tests] --> C1[Components together]
        D[Nitro Tests] --> D1[Plugin integration]
        E[E2E Tests] --> E1[Full app testing]
    end
    
    subgraph "Coverage Areas"
        A1 --> F[Pattern Matching]
        A1 --> G[Text Processing]
        B1 --> H[Server DOM]
        C1 --> I[Component Integration]
        D1 --> J[Nuxt Integration]
        E1 --> K[User Experience]
    end
    
    subgraph "Test Tools"
        L[Vitest] --> A
        L --> B
        L --> C
        L --> D
        M[Playwright] --> E
        N[jsdom] --> B
        N --> C
    end
    
    style A fill:#e8eaf6
    style B fill:#e8eaf6
    style C fill:#e8eaf6
    style D fill:#e8eaf6
    style E fill:#e8eaf6
```

## Performance Considerations

```mermaid
graph LR
    subgraph "Optimizations"
        A[Debouncing] --> A1[100ms default]
        B[Batching] --> B1[50 nodes/batch]
        C[Early Exit] --> C1[No matches check]
        D[Caching] --> D1[Pattern results]
    end
    
    subgraph "Monitoring"
        E[Debug Mode] --> E1[Console timing]
        F[Logger] --> F1[Processing stats]
        G[Performance API] --> G1[Measure duration]
    end
    
    A --> H[Reduce Operations]
    B --> H
    C --> H
    D --> H
    
    E --> I[Identify Bottlenecks]
    F --> I
    G --> I
    
    style H fill:#c8e6c9
    style I fill:#ffecb3
```

## Security Considerations

```mermaid
graph TD
    A[Input HTML/Text] --> B{Validation}
    B --> C[DOM APIs Only]
    C --> D[No innerHTML]
    C --> E[No eval()]
    C --> F[Text Content Only]
    
    D --> G[XSS Prevention]
    E --> G
    F --> G
    
    B --> H[Exclusion Zones]
    H --> I[Skip script tags]
    H --> J[Skip style tags]
    H --> K[Skip pre/code]
    
    I --> L[Safe Processing]
    J --> L
    K --> L
    
    G --> M[Secure Output]
    L --> M
    
    style A fill:#ffcdd2
    style G fill:#c8e6c9
    style M fill:#c8e6c9
```