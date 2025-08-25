---
layout: home

hero:
  name: Nuxt SmartScript
  text: Automatic Typography Transformations
  tagline: Smart, accessible typography enhancements for your Nuxt applications
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
  - icon: ⚡
    title: Performance First
    details: Optimized with debouncing, batching, and lazy loading for smooth user experience
  - icon: ♿
    title: Fully Accessible
    details: ARIA labels and semantic HTML ensure screen reader compatibility
  - icon: 🚀
    title: SSR/SSG Support
    details: Server-side rendering and static generation for SEO-friendly content (v0.4.0)
---

## What is Nuxt SmartScript?

Nuxt SmartScript is a powerful Nuxt module that automatically transforms typography patterns in your content to enhance readability and visual appeal. It works seamlessly with your existing Nuxt application, requiring minimal configuration.

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

## Installation

Install the module to your Nuxt application with one command:

```bash
npm install @mitre/nuxt-smartscript
```

Add it to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@mitre/nuxt-smartscript']
})
```

That's it! SmartScript will automatically enhance your typography.

## License

Apache 2.0 - © 2025 MITRE Corporation