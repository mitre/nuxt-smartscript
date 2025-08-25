# TypeScript Architecture

## Overview

nuxt-smartscript uses a **two-type architecture** to handle the boundary between Nuxt's module system and the runtime environment. This design pattern is necessary due to how Nuxt transforms and passes configuration between build-time and runtime.

## The Two-Type System

### 1. ModuleOptions (User-Facing)

Located in `src/module.ts`, this interface defines what users can configure in their `nuxt.config.ts`:

```typescript
export interface ModuleOptions {
  enabled?: boolean
  debug?: boolean
  ssr?: boolean | 'force'
  client?: boolean
  positioning?: {
    trademark?: { body?: string; headers?: string }
    // ... other positioning options
  }
  transformations?: {
    trademark?: boolean
    registered?: boolean
    // ... other transformations
  }
  cssVariables?: Record<string, string>
  // ... other options
}
```

**Key characteristics:**
- All properties are **optional** (users only specify what they want to override)
- Designed for developer ergonomics
- Validated and merged with defaults by Nuxt

### 2. SuperscriptConfig (Runtime)

Located in `src/runtime/smartscript/types.ts`, this interface defines the complete configuration used internally:

```typescript
export interface SuperscriptConfig {
  enabled: boolean  // Note: NOT optional
  debug: boolean
  ssr: boolean | 'force'
  client: boolean
  symbols: {  // Note: Additional runtime property
    trademark: string[]
    registered: string[]
    copyright: string[]
    ordinals: boolean
  }
  // ... all properties are required
}
```

**Key characteristics:**
- All properties are **required** (runtime always has complete config)
- Includes computed properties like `symbols` derived from `transformations`
- Used by all processing functions

## The Module Boundary

### Why We Need `any`

At the boundary between module and runtime (`src/module.ts` line ~224), we have:

```typescript
// The options are merged with defaults by Nuxt, so all required fields are present
// eslint-disable-next-line ts/no-explicit-any
nuxt.options.runtimeConfig.public.smartscript = options as any
```

This `any` is **intentional and correct** because:

1. **Nuxt's transformation is opaque to TypeScript** - The module system merges user options with defaults, but TypeScript can't track this
2. **Runtime transformation happens** - Properties like `symbols` are computed from `transformations`
3. **The boundary is dynamic** - The transformation happens at runtime, not compile time

## For Module Contributors

### When Working on Configuration

1. **User-facing changes** go in `ModuleOptions` (src/module.ts)
2. **Runtime changes** go in `SuperscriptConfig` (src/runtime/smartscript/types.ts)
3. **Keep them in sync** - If you add a property to one, consider if it needs to be in the other

### When Working on Processing Functions

- Always use `SuperscriptConfig` - never `ModuleOptions`
- Trust that the config is complete (all required fields are present)
- Don't add optional checks for required config properties

### Type Safety Best Practices

```typescript
// ✅ GOOD: Use SuperscriptConfig in runtime code
function processContent(config: SuperscriptConfig) {
  if (config.debug) {  // No need for config.debug ?? false
    logger.info('Processing...')
  }
}

// ❌ BAD: Don't use ModuleOptions in runtime code
function processContent(config: ModuleOptions) {
  if (config.debug ?? false) {  // Unnecessary defaulting
    logger.info('Processing...')
  }
}
```

## For Module Users

**You don't need to know about this!** The two-type system is an internal implementation detail. You only interact with `ModuleOptions` in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript'],
  smartscript: {
    // All properties are optional - defaults are provided
    debug: true,
    transformations: {
      trademark: false  // Disable only trademark transformation
    }
  }
})
```

## Why This Architecture?

1. **Better Developer Experience** - Users get optional properties with IntelliSense
2. **Runtime Safety** - Processing functions get guaranteed complete configs
3. **Nuxt Compatibility** - Works with Nuxt's module transformation system
4. **Type Safety** - Maximum type safety where TypeScript can help

## Related Files

- `src/module.ts` - ModuleOptions interface and module setup
- `src/runtime/smartscript/types.ts` - SuperscriptConfig interface
- `src/runtime/smartscript/config.ts` - Config merging and defaults
- `src/runtime/types.ts` - RuntimeConfig interface (bridge type)