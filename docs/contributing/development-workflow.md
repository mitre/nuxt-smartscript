# Development Workflow

This guide explains the day-to-day development workflow for working on nuxt-smartscript.

## Prerequisites

- Node.js 20+ 
- pnpm (NOT npm or yarn)
- Git

## Initial Setup

```bash
# Clone the repository
git clone https://github.com/mitre/nuxt-smartscript.git
cd nuxt-smartscript

# Install dependencies
pnpm install

# Build the module and prepare playground
pnpm dev:prepare
```

## Development Cycle

### When You Need to Rebuild

**IMPORTANT**: The playground uses the built version of the module. You MUST rebuild when you change:

1. **Any TypeScript files in `src/`** (module.ts, runtime files)
2. **CSS files** (src/runtime/superscript.css)
3. **Configuration structures** (types, interfaces)
4. **Export statements** (index.ts files)

```bash
# After making changes to source files:
pnpm prepack          # Rebuilds the module
pnpm dev:prepare      # Prepares the playground with new build

# Then start the dev server
pnpm dev              # Starts playground with hot reload
```

### When You DON'T Need to Rebuild

You can just use hot reload when changing:
- Playground files (`playground/` directory)
- Documentation (`docs/` directory)
- Tests (`test/` directory)

## Common Development Tasks

### Running the Playground

```bash
# Start development server with playground
pnpm dev

# The playground will be available at http://localhost:3000
# Nuxt DevTools available at http://localhost:3000/_nuxt
```

### Testing Your Changes

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test processor.test.ts

# Check types
pnpm test:types
```

### Code Quality

```bash
# Run linting (MUST pass before committing)
pnpm lint

# Run linting with auto-fix
pnpm lint -- --fix

# Type checking
pnpm test:types
```

## Troubleshooting

### Changes Not Appearing in Playground

**Problem**: Made changes but playground doesn't reflect them
**Solution**: 
```bash
pnpm prepack          # Rebuild the module
pnpm dev:prepare      # Refresh playground
# Restart dev server (Ctrl+C then pnpm dev)
```

### Module Not Found Errors

**Problem**: `Cannot find module` errors
**Solution**:
```bash
# Clean and rebuild
rm -rf dist/
rm -rf playground/.nuxt/
pnpm prepack
pnpm dev:prepare
```

### Nuxt DevTools Not Appearing

**Problem**: DevTools tab missing at bottom of playground
**Solution**:
1. Check that module built successfully: `pnpm prepack`
2. Clear browser cache and hard refresh
3. Check console for errors
4. Ensure you're on `http://localhost:3000` (not 127.0.0.1)

### Tests Failing Unexpectedly

**Problem**: Tests pass individually but fail when run together
**Solution**:
```bash
# Clear any test cache
pnpm test -- --clearCache

# Run tests serially instead of parallel
pnpm test -- --run --no-parallel
```

## Project Structure

```
nuxt-smartscript/
├── src/
│   ├── module.ts                 # Main module entry (rebuild needed)
│   └── runtime/
│       ├── plugin.ts            # Client plugin (rebuild needed)
│       ├── superscript.css      # Styles (rebuild needed)
│       └── smartscript/         # Core logic (rebuild needed)
├── playground/                   # Test app (hot reload works)
├── test/                        # Tests (no rebuild needed)
├── docs/                        # Documentation (no rebuild needed)
└── dist/                        # Built output (auto-generated)
```

## Quick Command Reference

| Task | Command | When to Use |
|------|---------|-------------|
| Install deps | `pnpm install` | First time setup |
| Build module | `pnpm prepack` | After changing src/ files |
| Prepare playground | `pnpm dev:prepare` | After building module |
| Start dev server | `pnpm dev` | To test in playground |
| Run tests | `pnpm test` | Before committing |
| Lint code | `pnpm lint` | Before committing |
| Build docs | `pnpm docs:build` | To preview documentation |

## Golden Rules

1. **Always use pnpm**, never npm or yarn
2. **Rebuild after source changes** with `pnpm prepack`
3. **Run tests before committing** with `pnpm test`
4. **Fix linting before committing** with `pnpm lint`
5. **Use conventional commits** (feat:, fix:, docs:, etc.)

## Getting Help

- Check existing issues: https://github.com/mitre/nuxt-smartscript/issues
- Read the docs: https://mitre.github.io/nuxt-smartscript
- Ask in discussions: https://github.com/mitre/nuxt-smartscript/discussions