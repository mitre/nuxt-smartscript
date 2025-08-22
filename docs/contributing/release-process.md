# Release Process

This document describes the release process for nuxt-smartscript.

## Overview

We use [changelogen](https://github.com/unjs/changelogen) for automated versioning and changelog generation, following the standard Nuxt module patterns.

## Prerequisites

Before releasing:
1. Ensure you have push access to the repository
2. Ensure you have npm publish rights for the package
3. `SAF_NPM_TOKEN` must be set as a GitHub secret for automated publishing

## How It Works

The release process is fully automated:

1. **Run `pnpm release`** locally
2. **Changelogen automatically**:
   - Analyzes commits since last release
   - Determines version bump based on conventional commits
   - Updates version in package.json
   - Generates/updates CHANGELOG.md
   - Creates git commit and tag
   - Pushes to GitHub with tags
3. **GitHub Actions automatically**:
   - Runs tests and linting
   - Builds the module
   - Publishes to npm with provenance
   - Creates GitHub release

## Release Commands

### Standard Release

```bash
# Automatic version based on commits (recommended)
pnpm release
```

This analyzes your commits and determines the version bump:
- `fix:` commits → patch release
- `feat:` commits → minor release  
- `BREAKING CHANGE:` → major release

### Specific Version

```bash
# Force specific version type
pnpm release -- --patch    # 0.1.0 → 0.1.1
pnpm release -- --minor    # 0.1.0 → 0.2.0
pnpm release -- --major    # 0.1.0 → 1.0.0
```

### Pre-releases

```bash
# Beta releases
pnpm release -- --prerelease beta    # 0.1.0 → 0.1.1-beta.0

# Alpha releases  
pnpm release -- --prerelease alpha   # 0.1.0 → 0.1.1-alpha.0

# RC releases
pnpm release -- --prerelease rc      # 0.1.0 → 0.1.1-rc.0
```

## Manual Process (if needed)

Only use this if the automated process fails:

```bash
# 1. Ensure main branch is up to date
git checkout main
git pull origin main

# 2. Run tests
pnpm test
pnpm lint

# 3. Build
pnpm prepack

# 4. Use changelogen
pnpm changelogen --release --push

# 5. The GitHub Action will handle the rest
```


## Example Release Flow

```bash
# 1. Make your changes and commit with conventional format
git add .
git commit -m "feat: add new awesome feature"

# 2. Run the release (changelogen handles everything)
pnpm release

# This will:
# - Run tests and linting
# - Build the module  
# - Determine version from commits (feat = minor)
# - Update package.json version
# - Generate CHANGELOG.md
# - Create commit and tag
# - Push to GitHub with tags

# 3. GitHub Actions automatically:
# - Publishes to npm
# - Creates GitHub release
```

## Post-Release Checklist

- [ ] Verify npm package: https://www.npmjs.com/package/nuxt-smartscript
- [ ] Check GitHub release: https://github.com/mitre/nuxt-smartscript/releases
- [ ] Test installation: `npm create nuxt-app test-app && cd test-app && npm i nuxt-smartscript`

## Troubleshooting

### Release fails locally

```bash
# Check you're on main branch
git branch --show-current

# Ensure no uncommitted changes
git status

# Manually run tests
pnpm test
pnpm lint
```

### GitHub Actions fails

1. Check Actions tab: https://github.com/mitre/nuxt-smartscript/actions
2. Verify `SAF_NPM_TOKEN` is set in repository secrets
3. Check npm publish permissions

## Version Guidelines

Follow semantic versioning:

- **0.x.x**: Pre-stable releases (current phase)
  - API may change between minor versions
  - Use for initial development and feedback gathering
  
- **1.0.0**: First stable release
  - API is stable
  - Breaking changes only in major versions
  - Ready for production use

- **Beta/Alpha tags**
  - Use for testing new features
  - Not recommended for production
  - May have breaking changes

## Changelog Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features → minor version bump
- `fix:` Bug fixes → patch version bump  
- `docs:` Documentation only
- `chore:` Maintenance tasks
- `test:` Test improvements
- `perf:` Performance improvements
- `refactor:` Code refactoring
- `BREAKING CHANGE:` → major version bump

Changelogen automatically parses these and updates CHANGELOG.md accordingly.