/**
 * Vue composable for SmartScript
 */

import type { SuperscriptConfig } from '../smartscript/types'
import { useNuxtApp } from '#imports'
import { onMounted, ref } from 'vue'

export interface SmartScriptApi {
  process: () => void
  startObserving: () => void
  stopObserving: () => void
  getConfig: () => SuperscriptConfig
  updateConfig: (config: Partial<SuperscriptConfig>) => boolean
  reset: () => void
  getStats: () => {
    processedElements: number
    superscripts: number
    subscripts: number
    total: number
  }
}

/**
 * Use SmartScript in Vue components
 */
export function useSmartScript() {
  const nuxtApp = useNuxtApp()
  const smartscript = nuxtApp.$smartscript as SmartScriptApi | undefined

  const isProcessing = ref(false)
  const stats = ref({
    processedElements: 0,
    superscripts: 0,
    subscripts: 0,
    total: 0,
  })

  /**
   * Update statistics
   */
  const updateStats = () => {
    if (!smartscript)
      return
    stats.value = smartscript.getStats()
  }

  /**
   * Process content in the current component
   */
  const process = async () => {
    if (!smartscript || isProcessing.value)
      return

    isProcessing.value = true
    try {
      await smartscript.process()
      updateStats()
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Enable SmartScript for specific element
   */
  const enableForElement = (element: HTMLElement) => {
    if (element.dataset.superscriptProcessed === 'true') {
      delete element.dataset.superscriptProcessed
    }
    element.classList.remove('no-superscript')
  }

  /**
   * Disable SmartScript for specific element
   */
  const disableForElement = (element: HTMLElement) => {
    element.classList.add('no-superscript')
  }

  /**
   * Toggle SmartScript for specific element
   */
  const toggleForElement = (element: HTMLElement) => {
    if (element.classList.contains('no-superscript')) {
      enableForElement(element)
    } else {
      disableForElement(element)
    }
  }

  // Auto-process on mount if smartscript is available
  onMounted(() => {
    if (smartscript) {
      setTimeout(() => {
        process()
      }, 100)
    }
  })

  return {
    // State
    isProcessing,
    stats,

    // Methods
    process,
    updateStats,
    enableForElement,
    disableForElement,
    toggleForElement,

    // Direct access to API
    api: smartscript,
  }
}
