---
layout: home

hero:
  name: Nuxt SmartScript
  text: Automatic Typography Transformations
  tagline: Smart, accessible typography enhancements for your Nuxt applications with full SSR/SSG support
  actions:
    - theme: brand
      text: Get Started
      link: /quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/mitre/nuxt-smartscript

features:
  - icon: 🔤
    title: Smart Symbols
    details: Automatically converts (TM) to ™, (R) to ®, and (C) to © with proper positioning
  - icon: 🔢
    title: Ordinal Numbers
    details: Transforms 1st, 2nd, 3rd, 4th with beautiful superscript formatting
  - icon: 🧪
    title: Chemical Formulas
    details: Renders H2O, CO2, Ca(OH)2 with proper subscripts for scientific content
  - icon: 📐
    title: Math Notation
    details: Supports x^2 superscripts and x_1 subscripts for mathematical expressions
  - icon: 🚀
    title: Full SSR/SSG Support
    details: Works seamlessly with server-side rendering and static generation for optimal SEO
  - icon: 🎯
    title: Smart Selectors
    details: Process 30+ HTML elements including headings, paragraphs, lists, tables, and more
  - icon: ⚡
    title: Performance Optimized
    details: Debouncing, batching, and caching for smooth performance even with large documents
  - icon: ♿
    title: Accessibility First
    details: ARIA labels and semantic HTML ensure full screen reader compatibility
---

## What is Nuxt SmartScript?

<p>
  <a href="https://www.npmjs.com/package/@mitre/nuxt-smartscript"><img src="https://img.shields.io/npm/v/@mitre/nuxt-smartscript?style=flat&colorA=18181B&colorB=28CF8D" alt="Version"></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mitre/nuxt-smartscript"><img src="https://img.shields.io/npm/dm/@mitre/nuxt-smartscript?style=flat&colorA=18181B&colorB=28CF8D" alt="Downloads"></a>&nbsp;
  <a href="https://github.com/mitre/nuxt-smartscript/blob/main/LICENSE"><img src="https://img.shields.io/github/license/mitre/nuxt-smartscript?style=flat&colorA=18181B&colorB=28CF8D" alt="License"></a>
</p>

Nuxt SmartScript is a powerful Nuxt module that automatically transforms typography patterns in your content to enhance readability and visual appeal. It works seamlessly with your existing Nuxt application, requiring minimal configuration.

## 🎉 What's New in v0.4.0

- **Full SSR/SSG Support** - Server-side rendering and static generation now work perfectly
- **30+ Element Support** - Process headings, paragraphs, lists, tables, spans, links, and more
- **Improved Performance** - Better caching and pattern matching
- **Bug Fixes** - Fixed navigation issues and configuration handling
- **Better TypeScript** - Improved type definitions and module builder integration

## Why SmartScript?

### 🎯 Problem

Web content often contains patterns like (TM), (R), chemical formulas (H2O), and ordinal numbers (1st, 2nd) that could be displayed more professionally with proper typography.

### ✨ Solution

SmartScript automatically detects and transforms these patterns into beautifully formatted typography with proper superscripts, subscripts, and symbols - all while maintaining accessibility.

## Quick Example

**Input:**
```
Your Product(TM) is the 1st choice for quality!
H2O and CO2 are common molecules.
E=mc^2 is Einstein's famous equation.
```

**Output:**
- Your Product™ is the 1<sup>st</sup> choice for quality!
- H<sub>2</sub>O and CO<sub>2</sub> are common molecules.
- E=mc<sup>2</sup> is Einstein's famous equation.

## Perfect For

- 📚 **Documentation Sites** - Technical docs with formulas and trademark symbols
- 🏢 **Corporate Websites** - Professional typography for brand names and legal marks
- 🔬 **Scientific Content** - Chemical formulas and mathematical expressions
- 📰 **Publishing Platforms** - Articles with ordinal numbers and special symbols
- 📖 **Educational Materials** - Math and science content with proper notation

## Installation

Install the module to your Nuxt application with one command:

::: code-group
```bash [npm]
npm install @mitre/nuxt-smartscript
```
```bash [pnpm]
pnpm add @mitre/nuxt-smartscript
```
```bash [yarn]
yarn add @mitre/nuxt-smartscript
```
:::

Add it to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript'],
  
  // Optional: customize the behavior
  smartscript: {
    // Enable/disable specific transformations
    transformations: {
      trademark: true,    // (TM) → ™
      registered: true,   // (R) → ®
      copyright: true,    // (C) → ©
      ordinals: true,     // 1st → 1ˢᵗ
      chemicals: true,    // H2O → H₂O
      mathSuper: true,    // x^2 → x²
      mathSub: true,      // x_1 → x₁
    },
    
    // Full SSR/SSG support
    ssr: true,
    client: true,
  }
})
```

That's it! SmartScript will automatically enhance your typography across 30+ HTML elements.

## License

Apache 2.0 - © 2025 MITRE Corporation