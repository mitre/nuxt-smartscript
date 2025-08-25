/**
 * SINGLE SOURCE OF TRUTH for module defaults
 * This file is imported by BOTH module.ts and runtime/config.ts
 * NEVER duplicate these values elsewhere!
 */

export const SHARED_DEFAULTS = {
  enabled: true,
  positioning: {
    trademark: {
      body: '-0.5em',
      headers: '-0.7em',
      fontSize: '0.8em',
    },
    registered: {
      body: '-0.25em',
      headers: '-0.45em',
      fontSize: '0.8em',
    },
    ordinals: {
      fontSize: '0.75em',
    },
    chemicals: {
      fontSize: '0.75em',
    },
  },
  selectors: {
    include: [
      // Container elements
      'main',
      'article',
      '.content',
      '[role="main"]',
      '.prose',
      '.blog-post',
      '.blog-content',
      'section',
      'header',
      'footer',
      // Heading elements
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      // Text content elements
      'p',
      'li',
      'td',
      'th',
      'blockquote',
      'caption',
      'dt',
      'dd',
      'figcaption',
      // Inline elements
      'span',
      'a',
      'strong',
      'em',
      'b',
      'i',
      'small',
      'cite',
      'abbr',
      // Interactive elements
      'button',
      'label',
      'legend',
      'summary',
      // Other semantic elements
      'address',
    ],
    exclude: [
      'pre',
      'code',
      'script',
      'style',
      '.no-superscript',
      '[data-no-superscript]',
      // Exclude our own generated elements
      'sup.ss-sup',
      'sub.ss-sub',
      '.ss-tm',
      '.ss-reg',
      '.ss-ordinal',
      '.ss-chemical',
      '.ss-math',
    ],
  },
  performance: {
    debounce: 100,
    batchSize: 50,
    delay: 1500,
  },
  transformations: {
    trademark: true,
    registered: true,
    copyright: true,
    ordinals: true,
    chemicals: true,
    mathSuper: true,
    mathSub: true,
  },
  // Runtime-specific defaults (only used in runtime)
  symbols: {
    trademark: ['™', '(TM)'],
    registered: ['®', '(R)'],
    copyright: ['©', '(C)'],
    ordinals: true,
  },
  ssr: true,
  client: true,
  debug: false,
}
