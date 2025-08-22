# Release Process

This document describes the release process for nuxt-smartscript.

## Overview

We use [changelogen](https://github.com/unjs/changelogen) for automated versioning and changelog generation, following the patterns established by other Nuxt modules.

## Prerequisites

Before releasing:
1. Ensure you have push access to the repository
2. Ensure you have npm publish rights for the package
3. Set up `SAF_NPM_TOKEN` as a GitHub secret for automated publishing

## Release Types

- **Patch Release** (0.1.0 → 0.1.1): Bug fixes and minor updates
- **Minor Release** (0.1.0 → 0.2.0): New features, backward compatible
- **Major Release** (0.x.x → 1.0.0): Breaking changes or stable API
- **Beta Release** (0.1.0 → 0.1.1-beta.1): Pre-release for testing

## How Releases Work

Our release process follows this flow:

1. **Developer creates a git tag** (manually or via changelogen)
2. **Tag is pushed to GitHub**
3. **GitHub Actions workflow triggers** on tag push (v*)
4. **Workflow automatically**:
   - Runs tests and linting
   - Builds the module
   - Publishes to npm with provenance
   - Creates GitHub release with changelog

## Manual Release Process

### 1. Using npm script with changelogen (Recommended)

```bash
# Standard release (patch/minor/major based on commits)
pnpm release

# Specific version bump
pnpm release -- --patch
pnpm release -- --minor  
pnpm release -- --major

# Pre-release versions
pnpm release -- --prerelease
pnpm release -- --prerelease beta
```

This will:
1. Run tests and linting
2. Build the module
3. Update version in package.json
4. Generate/update CHANGELOG.md
5. Create git commit and tag
6. Push to GitHub
7. Publish to npm

### 2. Using release script

```bash
# Make script executable (first time only)
chmod +x scripts/release.sh

# Run release
./scripts/release.sh patch  # or minor, major, etc.
```

### 3. Manual steps

If you need more control:

```bash
# 1. Ensure main branch is up to date
git checkout main
git pull origin main

# 2. Run tests
pnpm test
pnpm lint

# 3. Build
pnpm prepack

# 4. Use changelogen to handle versioning
pnpm changelogen --release

# 5. Review and edit CHANGELOG.md if needed
# Then push with tags
git push origin main --follow-tags

# 6. Publish to npm
npm publish
```

## Automated Release (GitHub Actions)

When you push a tag starting with `v`, GitHub Actions will automatically:

1. Run all tests
2. Build the module
3. Publish to npm with provenance
4. Create a GitHub release

```bash
# After using changelogen or manual tagging
git push origin v0.1.0
```

## Beta Releases

For beta testing:

```bash
# Create beta version
pnpm changelogen --prerelease beta

# Push tag
git push origin v0.1.1-beta.1

# This will publish to npm with beta tag
# Users install with: npm install nuxt-smartscript@beta
```

## Post-Release Checklist

After releasing:

- [ ] Verify npm package is published: https://www.npmjs.com/package/nuxt-smartscript
- [ ] Check GitHub release was created: https://github.com/mitre/nuxt-smartscript/releases
- [ ] Test installation in a fresh project
- [ ] Update documentation if needed
- [ ] Announce release if significant

## Troubleshooting

### npm publish fails

1. Check npm authentication: `npm whoami`
2. Ensure you have publish rights: `npm owner ls nuxt-smartscript`
3. Check if SAF_NPM_TOKEN is set in GitHub secrets

### GitHub release not created

1. Check GitHub Actions: https://github.com/mitre/nuxt-smartscript/actions
2. Ensure GITHUB_TOKEN has write permissions
3. Verify tag format starts with 'v'

### Tests fail during release

1. Run tests locally: `pnpm test`
2. Check for uncommitted changes
3. Ensure dependencies are up to date: `pnpm update`

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