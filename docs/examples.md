# Examples

## Trademark and Registered Symbols

### Input
```html
<p>Our Product(TM) is better than Brand(R)</p>
<h1>Welcome to Platform(TM)</h1>
```

### Output
```html
<p>Our Product™ is better than Brand®</p>
<h1>Welcome to Platform™</h1>
```

## Ordinal Numbers

### Input
```html
<p>Celebrating our 21st anniversary on the 1st of May</p>
```

### Output
```html
<p>Celebrating our 21<sup>st</sup> anniversary on the 1<sup>st</sup> of May</p>
```

## Chemical Formulas

### Input
```html
<p>Water is H2O and carbon dioxide is CO2</p>
<p>Aluminum sulfate: Al2(SO4)3</p>
```

### Output
```html
<p>Water is H<sub>2</sub>O and carbon dioxide is CO<sub>2</sub></p>
<p>Aluminum sulfate: Al<sub>2</sub>(SO<sub>4</sub>)<sub>3</sub></p>
```

## Mathematical Notation

### Input
```html
<p>Einstein's equation: E = mc^2</p>
<p>Variables: x_1, x_2, x_n</p>
```

### Output
```html
<p>Einstein's equation: E = mc<sup>2</sup></p>
<p>Variables: x<sub>1</sub>, x<sub>2</sub>, x<sub>n</sub></p>
```

## Mixed Content

### Input
```html
<p>The 1st Product(TM) uses H2O at 100^o</p>
```

### Output
```html
<p>The 1<sup>st</sup> Product™ uses H<sub>2</sub>O at 100<sup>o</sup></p>
```

## Vue Component Example

```vue
<template>
  <article>
    <h1>Welcome to Our Product(TM)</h1>
    <p>
      We're the 1st company to use H2O cooling
      in our Product(R) line!
    </p>
    
    <!-- Exclude this section -->
    <pre data-no-superscript>
      Raw: H2O, CO2, 1st, Product(TM)
    </pre>
  </article>
</template>
```

## Dynamic Content

The plugin automatically handles dynamic content:

```vue
<template>
  <div>
    <p>{{ dynamicText }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const dynamicText = ref('Loading...')

// Content added later is automatically processed
setTimeout(() => {
  dynamicText.value = 'New Product(TM) is the 1st choice!'
}, 1000)
</script>
```