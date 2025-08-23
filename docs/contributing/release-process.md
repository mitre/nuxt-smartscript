# Release Process

This document describes the release process for @mitre/nuxt-smartscript.

## Two Release Paths

### Path 1: Contributors (Via Pull Request)

**Standard workflow for all contributors:**

1. **Create feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   # or fix/your-bug-fix, docs/your-docs-update, etc.
   ```

2. **Make your changes**
   - Write your code
   - **Add tests for all new features**
   - Update documentation as needed

3. **Ensure quality**
   ```bash
   pnpm test        # All tests must pass (including your new ones)
   pnpm lint        # Code must be clean
   pnpm dev:prepare # Test in playground if needed
   ```

4. **Commit with conventional format** (see [Commit Conventions](#changelog-conventions))
   ```bash
   git add .
   git commit -m "feat: add awesome new feature"
   # Types: feat:, fix:, docs:, chore:, test:, refactor:, perf:
   ```

5. **Push to your fork/branch**
   ```bash
   git push origin your-branch-name
   ```

6. **Create Pull Request**
   - PR description should explain the change
   - Link any related issues
   - Wait for CI/CD checks to pass

7. **After review and merge**
   - **You're done!** 
   - Maintainers will handle release when appropriate
   - Your commits will appear in auto-generated changelog

### Path 2: Maintainers (With Release Rights)

**Maintainers should also use branches, but can release after merge:**

1. **Create feature branch** (same as contributors)
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Develop and test** (same quality standards)
   ```bash
   pnpm test        # Must pass
   pnpm lint        # Must be clean
   ```

3. **Push branch and create PR** (even as maintainer)
   ```bash
   git push origin your-branch-name
   # Create PR for review/CI checks
   ```

4. **After PR is merged to main**
   ```bash
   git checkout main
   git pull origin main
   ```

5. **Wait for CI/CD to pass on main**
   - Check GitHub Actions for green checkmark
   - Never release with failing CI

6. **Run release command**
   ```bash
   pnpm release         # Auto version from commits
   # or for specific version type:
   pnpm release:minor   # Force minor bump (0.x.0)
   pnpm release:patch   # Force patch bump (0.0.x)
   pnpm release:major   # Force major bump (x.0.0)
   ```

## Prerequisites for Direct Release

Before releasing:
1. Ensure you have push access to the repository
2. Ensure you have npm publish rights for the package
3. `NPM_TOKEN` must be set as a GitHub secret for automated publishing
4. You must be on the main branch with a clean working tree

## How Direct Release Works

The release process is fully automated:

1. **Run `pnpm release`** locally
2. **Changelogen automatically**:
   - Analyzes commits since last release
   - Determines version bump based on conventional commits
   - Updates version in package.json
   - Generates/updates CHANGELOG.md
   - Creates git commit and tag
   - Pushes to GitHub with tags
   - **Does NOT open browser** (CHANGELOGEN_NO_GITHUB=true is set)
3. **GitHub Actions automatically**:
   - Runs tests and linting
   - Builds the module
   - Publishes to npm with provenance
   - Creates GitHub release

## Release Commands (Maintainers Only)

### Standard Release

```bash
# PREREQUISITE: Must be on main branch with clean working tree
git checkout main
git pull origin main
git status  # Should show "nothing to commit, working tree clean"

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
pnpm release:patch    # 0.1.0 → 0.1.1
pnpm release:minor    # 0.1.0 → 0.2.0
pnpm release:major    # 0.1.0 → 1.0.0
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

- [ ] Verify npm package: https://www.npmjs.com/package/@mitre/nuxt-smartscript
- [ ] Check GitHub release: https://github.com/mitre/nuxt-smartscript/releases
- [ ] Test installation: `npm create nuxt-app test-app && cd test-app && npm i @mitre/nuxt-smartscript`

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
2. Verify `NPM_TOKEN` is set in repository secrets
3. Check npm publish permissions

## For Contributors (PR-Based Workflow)

If you're contributing but don't have release permissions:

1. **Create your branch**
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make changes with conventional commits**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   # or
   git commit -m "fix: resolve issue with trademark processing"
   ```

3. **Push and create PR**
   ```bash
   git push origin your-branch-name
   # Then create PR on GitHub
   ```

4. **After PR is merged**
   - Maintainers will run `pnpm release` when ready
   - Your changes will be included in the next release
   - You'll be credited in the changelog automatically

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