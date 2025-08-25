<script setup>
import { useNuxtApp } from '#app'
import { onMounted, ref } from 'vue'

const { $smartscript } = useNuxtApp()
const debugMode = ref(false)
const stats = ref(null)

function toggleDebug() {
  if ($smartscript) {
    debugMode.value = !debugMode.value
    const config = $smartscript.getConfig()
    $smartscript.updateConfig({ ...config, debug: debugMode.value })
    // Debug mode toggle handled by updateConfig
  }
}

function manualProcess() {
  if ($smartscript) {
    $smartscript.process()
    stats.value = $smartscript.getStats()
  }
}

function getStats() {
  if ($smartscript) {
    stats.value = $smartscript.getStats()
  }
}

onMounted(() => {
  // Get initial debug state
  if ($smartscript) {
    const config = $smartscript.getConfig()
    debugMode.value = config.debug || false
  }
})
</script>

<template>
  <div class="container">
    <h1>H1: Nuxt SmartScript™ Demo - MITRE(TM)</h1>
    <h2>H2: MITRE(TM) Test</h2>
    <h3>H3: MITRE(TM) Test</h3>
    <h4>H4: MITRE(TM) Test</h4>
    <h5>H5: MITRE(TM) Test</h5>
    <h6>H6: MITRE(TM) Test</h6>

    <section>
      <h2>Debug Info</h2>
      <p>Plugin status: <ClientOnly><span>{{ $smartscript ? 'Loaded' : 'Not loaded' }}</span></ClientOnly></p>
      <p>Debug mode: {{ debugMode ? 'ON' : 'OFF' }}</p>
      <button @click="toggleDebug">
        Toggle Debug Mode
      </button>
      <button @click="manualProcess">
        Manual Process
      </button>
      <button @click="getStats">
        Get Stats
      </button>
      <div v-if="stats">
        <p>Processed elements: {{ stats.processedElements }}</p>
        <p>Superscripts: {{ stats.superscripts }}, Subscripts: {{ stats.subscripts }}</p>
        <p>Trademarks: {{ stats.trademarks }}, Registered: {{ stats.registered }}</p>
        <p>Total transformations: {{ stats.total }}</p>
      </div>
    </section>

    <section>
      <h2>Font Testing</h2>
      <div style="font-family: Arial, sans-serif;">
        <h3>Arial: MITRE(TM) ACT(TM)</h3>
        <p>Body text: MITRE(TM) and ACT(TM) testing</p>
      </div>
      <div style="font-family: 'Times New Roman', serif;">
        <h3>Times New Roman: MITRE(TM) ACT(TM)</h3>
        <p>Body text: MITRE(TM) and ACT(TM) testing</p>
      </div>
      <div style="font-family: Georgia, serif;">
        <h3>Georgia: MITRE(TM) ACT(TM)</h3>
        <p>Body text: MITRE(TM) and ACT(TM) testing</p>
      </div>
      <div style="font-family: 'Courier New', monospace;">
        <h3>Courier New: MITRE(TM) ACT(TM)</h3>
        <p>Body text: MITRE(TM) and ACT(TM) testing</p>
      </div>
      <div style="font-family: system-ui, -apple-system, sans-serif;">
        <h3>System UI: MITRE(TM) ACT(TM)</h3>
        <p>Body text: MITRE(TM) and ACT(TM) testing</p>
      </div>
    </section>

    <section>
      <h2>Copyright Symbol</h2>
      <p>Copyright: (C) 2024 Example Corporation</p>
      <p>Should NOT be superscript: © stays baseline</p>
    </section>

    <section>
      <h2>Trademark & Registered Symbols</h2>
      <p>Regular text: Product™ and Brand® are registered.</p>
      <p>Parentheses format: Product(TM) and Brand(R) conversion.</p>
      <p>Standalone: TM and R should not be converted in isolation.</p>
      <h3>In Headers: Platform™ Software®</h3>
      <h4>H4: Platform™ Software®</h4>
      <h5>H5: Platform™ Software®</h5>
      <h6>H6: Platform™ Software®</h6>
    </section>

    <section>
      <h2>Ordinal Numbers</h2>
      <p>Rankings: 1st place, 2nd runner-up, 3rd position, 4th quarter</p>
      <p>Dates: 21st century, 42nd anniversary, 100th celebration</p>
      <p>Edge cases: 11th hour, 12th day, 13th floor</p>
    </section>

    <section>
      <h2>Chemical Formulas</h2>
      <p>Water: H2O</p>
      <p>Carbon dioxide: CO2</p>
      <p>Sulfuric acid: H2SO4</p>
      <p>Complex: Al2(SO4)3 and Ca(OH)2</p>
      <p>Multiple: Mix H2O with CO2 to get H2CO3</p>
    </section>

    <section>
      <h2>Mathematical Notation</h2>
      <p>Basic superscript: x^2 + y^3 = z^4</p>
      <p>With braces: x^{10} and a^{n+1}</p>
      <p>Physics equations: E=mc^2 (Einstein's famous equation)</p>
      <p>After digits: 2x^2 + 3y^2 = 5z^2</p>
      <p>Basic subscript: x_1 + x_2 = x_n</p>
      <p>With braces: a_{n+1} = a_n + d</p>
      <p>Chemistry context: H_2O has subscript, log_2 does not</p>
      <p>Mixed notation: f(x) = x^2 + a_1·x + a_0</p>
    </section>

    <section>
      <h2>Mixed Content</h2>
      <p>The Platform™ uses H2O cooling in the 21st century. Formula x^2 + CO2 = success®!</p>
      <p>On the 1st day, we mixed H2SO4 with the Solution(TM) at position x_1.</p>
    </section>

    <section>
      <h2>Exclusions & Edge Cases</h2>
      <h3>Code Blocks (Not Transformed)</h3>
      <pre>Code blocks should not transform: H2O, 1st, Product(TM), x^2</pre>
      <code>Inline code: H2O, CO2, 1st, Product(TM), E=mc^2</code>

      <h3>Explicit Exclusion</h3>
      <div data-no-superscript>
        <p>This section excluded: H2O, CO2, 1st, Product(TM), x^2</p>
      </div>

      <h3>Programming Identifiers (Correctly Not Transformed)</h3>
      <p>Variables: file_name, some_var, MAX_SIZE stay unchanged</p>
      <p>But math after equals works: var=x^2 transforms x^2</p>

      <h3>Edge Cases That Work</h3>
      <p>After lowercase: abc^2 transforms c^2 (like E=mc^2)</p>
      <p>After uppercase: ABC^2 doesn't transform (intentional)</p>
    </section>

    <section>
      <h2>Navigation Test</h2>
      <NuxtLink to="/test">
        Test Page Link
      </NuxtLink>
    </section>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

section {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

h1 {
  color: #333;
  border-bottom: 3px solid #007bff;
  padding-bottom: 0.5rem;
}

h2 {
  color: #555;
  margin-top: 0;
}

p {
  line-height: 1.6;
  margin: 0.5rem 0;
}

pre, code {
  background: #f4f4f4;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

pre {
  padding: 1rem;
  overflow-x: auto;
}
</style>
