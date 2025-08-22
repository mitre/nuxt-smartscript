<template>
  <div class="container">
    <h1>Navigation Test Page™</h1>
    <p>This page tests if transformations work after navigation.</p>
    <p>The Platform™ should show proper superscript here too.</p>
    <p>Chemical formula: H2O and CO2</p>
    <p>Ordinals: 1st, 2nd, 3rd test</p>

    <NuxtLink to="/">Back to Home</NuxtLink>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
