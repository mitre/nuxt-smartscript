// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  // Type of the project
  typescript: true,
  vue: true,

  // Enable stylistic formatting rules
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false,
  },

  // Customize rules
  rules: {
    // Allow console.warn and console.error
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // TypeScript
    'ts/no-explicit-any': 'warn',
    'ts/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],

    // Node/Process - we're in a browser environment primarily
    'node/prefer-global/process': 'off',
    'no-restricted-globals': 'off', // Allow 'global' in test files

    // Allow assignment in conditions when intentional
    'no-cond-assign': ['error', 'except-parens'],

    // Allow function hoisting
    'ts/no-use-before-define': ['error', { functions: false }],

    // Vue/Nuxt specific
    'vue/multi-word-component-names': 'off',

    // Style preferences for this project
    'style/brace-style': ['error', '1tbs'],
    'style/arrow-parens': ['error', 'always'],

    // JSON sorting - not critical
    'jsonc/sort-keys': 'off',
  },

  // Files to ignore
  ignores: [
    '**/dist',
    '**/node_modules',
    '**/.nuxt',
    '**/coverage',
    '**/playground/.nuxt',
    '**/playground/.output',
    '**/*.md',
  ],
})
