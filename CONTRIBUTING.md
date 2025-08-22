# Contributing to nuxt-smartscript

Thank you for your interest in contributing! We welcome contributions from the community and are excited to work with you.

## 🎯 We Welcome PRs!

Whether you're fixing a bug, adding a feature, or improving documentation, we appreciate your contribution. No contribution is too small!

## 📁 Module Architecture

Understanding our architecture helps you contribute effectively:

| File/Directory | Purpose | When to Modify |
|---------------|---------|----------------|
| `src/runtime/plugin.ts` | Main plugin orchestrator | When adding new hooks or API methods |
| `src/runtime/smartscript/types.ts` | TypeScript interfaces | When adding new configuration options |
| `src/runtime/smartscript/config.ts` | Configuration defaults | When adding new settings |
| `src/runtime/smartscript/patterns.ts` | Regex patterns | **When adding new text patterns** |
| `src/runtime/smartscript/processor.ts` | Text processing | When changing how matches are transformed |
| `src/runtime/smartscript/dom.ts` | DOM utilities | When modifying element creation/manipulation |
| `src/runtime/smartscript/engine.ts` | Processing engine | When changing the processing flow |
| `src/runtime/smartscript/errors.ts` | Error handling | When adding new error types |
| `src/runtime/composables/useSmartScript.ts` | Vue composable | When adding component features |
| `src/runtime/superscript.css` | Styling | When adjusting visual positioning |

## 🚀 Adding New Capabilities

### Adding a New Pattern (Most Common)

1. **Add pattern to `patterns.ts`:**
```typescript
// In createPatterns()
fractions: /\b(\d+)\/(\d+)\b/g,  // Matches 1/2, 3/4, etc.

// In PatternMatchers
isFraction: (text: string): boolean => /^\d+\/\d+$/.test(text),
```

2. **Add processing logic to `processor.ts`:**
```typescript
// In processMatch()
if (PatternMatchers.isFraction(matched)) {
  const [numerator, denominator] = matched.split('/')
  return {
    modified: true,
    parts: [
      { type: 'super', content: numerator },
      { type: 'text', content: '⁄' },  // Fraction slash
      { type: 'sub', content: denominator },
    ],
  }
}
```

3. **Add test cases to `test/typography.test.ts`:**
```typescript
describe('Fractions', () => {
  it('should match fraction patterns', () => {
    const pattern = /\b(\d+)\/(\d+)\b/g
    expect('1/2 cup'.match(pattern)).toEqual(['1/2'])
  })
})
```

4. **Update playground example:**
```vue
<!-- In playground/app.vue -->
<section>
  <h2>Fractions</h2>
  <p>Measurements: 1/2 cup, 3/4 teaspoon</p>
</section>
```

### Adding Configuration Options

1. **Update types in `types.ts`:**
```typescript
positioning?: {
  fractions?: {
    fontSize?: string
  }
}
```

2. **Add defaults in `config.ts`:**
```typescript
fractions: {
  fontSize: '0.7em'
}
```

3. **Document in README.md**

## ✅ Testing Guidelines

### Running Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test test/typography.test.ts

# Watch mode
pnpm test:watch
```

### Writing Tests

Tests should cover:
1. **Pattern matching** - Does the regex work?
2. **Text processing** - Is the output correct?
3. **Edge cases** - Empty strings, special characters
4. **Performance** - Large text blocks

Example test structure:
```typescript
describe('Feature Name', () => {
  // Test pattern matching
  it('should match expected patterns', () => {
    const pattern = /your-pattern/g
    expect('test input'.match(pattern)).toEqual(['expected'])
  })
  
  // Test processing
  it('should transform correctly', () => {
    const result = processMatch('input')
    expect(result.parts).toEqual([
      { type: 'super', content: 'expected' }
    ])
  })
  
  // Test edge cases
  it('should handle edge cases', () => {
    expect(processMatch('')).toEqual({ modified: false, parts: [] })
  })
})
```

## 📋 Pull Request Process

### Before Submitting

1. **Fork & Clone** the repository
2. **Create a feature branch:** `git checkout -b feature/your-feature`
3. **Make your changes**
4. **Add/update tests** - All new features need tests
5. **Run tests:** `pnpm test` - Must pass
6. **Run linter:** `pnpm lint` - Must pass
7. **Test in playground:** `pnpm dev` - Verify visually
8. **Update documentation** if needed

### PR Requirements

Your PR should:
- ✅ Have a clear title and description
- ✅ Include tests for new features
- ✅ Pass all CI checks
- ✅ Update relevant documentation
- ✅ Follow existing code style
- ✅ Be focused on a single feature/fix

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Tested in playground

## Screenshots (if applicable)
Before/after screenshots for visual changes
```

## 🎨 Code Style

- Use TypeScript for all new code
- Follow ESLint rules (auto-fixed on commit)
- Keep functions small and focused
- Add JSDoc comments for public APIs
- Use descriptive variable names

## 🐛 Bug Reports

When reporting bugs, include:
1. Description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Browser/Node version
6. Minimal reproduction (CodeSandbox/StackBlitz)

## 💡 Feature Requests

We love new ideas! When requesting features:
1. Describe the use case
2. Provide examples
3. Consider performance impact
4. Suggest implementation approach (optional)

## 🤝 Getting Help

- Open an issue for questions
- Tag with `help wanted` or `question`
- Join discussions in issues/PRs
- Contact: saf@mitre.org

## 📝 Development Workflow

```bash
# 1. Install dependencies
pnpm install

# 2. Start dev server
pnpm dev

# 3. Make changes & test
pnpm test

# 4. Lint & format
pnpm lint --fix

# 5. Build
pnpm prepack

# 6. Commit with conventional commits
git commit -m "feat: add fraction support"
```

## 🏆 Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- Special thanks in documentation

Thank you for making nuxt-smartscript better! 🎉