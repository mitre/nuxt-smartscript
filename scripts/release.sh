#!/bin/bash

# Release script for nuxt-smartscript
# Uses changelogen for automated changelog generation and versioning

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DRY_RUN=false
VERSION_TYPE="patch"

# Function to show help
show_help() {
  echo -e "${BLUE}Nuxt SmartScript Release Script${NC}"
  echo ""
  echo "Usage: $0 [OPTIONS] [VERSION_TYPE]"
  echo ""
  echo "VERSION_TYPE:"
  echo "  patch      Patch release (0.1.0 → 0.1.1) - default"
  echo "  minor      Minor release (0.1.0 → 0.2.0)"
  echo "  major      Major release (0.x.x → 1.0.0)"
  echo "  prepatch   Pre-patch release (0.1.0 → 0.1.1-beta.0)"
  echo "  preminor   Pre-minor release (0.1.0 → 0.2.0-beta.0)"
  echo "  premajor   Pre-major release (0.x.x → 1.0.0-beta.0)"
  echo "  prerelease Pre-release version"
  echo ""
  echo "OPTIONS:"
  echo "  --dry-run  Perform a dry run without making changes"
  echo "  --help     Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                    # Patch release"
  echo "  $0 minor              # Minor release"
  echo "  $0 --dry-run major    # Dry run of major release"
  echo "  $0 prerelease         # Create beta/RC version"
  exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --help|-h)
      show_help
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    patch|minor|major|prepatch|preminor|premajor|prerelease)
      VERSION_TYPE=$1
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Header
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}🧪 DRY RUN MODE - No changes will be made${NC}"
fi
echo -e "${GREEN}🚀 Nuxt SmartScript Release Process${NC}"
echo -e "${BLUE}Version type: $VERSION_TYPE${NC}"
echo ""

# Check if we're on main branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo -e "${RED}❌ You must be on the main branch to release${NC}"
  exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo -e "${RED}❌ You have uncommitted changes. Please commit or stash them first.${NC}"
  exit 1
fi

# Function to run command (handles dry-run)
run_cmd() {
  if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}[DRY-RUN] Would run: $@${NC}"
  else
    "$@"
  fi
}

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
run_cmd pnpm test

# Run linting
echo -e "${YELLOW}🔍 Running linter...${NC}"
run_cmd pnpm lint

# Build the module
echo -e "${YELLOW}🔨 Building module...${NC}"
run_cmd pnpm prepack

# Update version in package.json
echo -e "${YELLOW}📝 Updating version...${NC}"
if [ "$DRY_RUN" = true ]; then
  # Calculate what version would be
  CURRENT_VERSION=$(node -p "require('./package.json').version")
  echo -e "${BLUE}[DRY-RUN] Current version: $CURRENT_VERSION${NC}"
  echo -e "${BLUE}[DRY-RUN] Would bump to: $VERSION_TYPE${NC}"
  NEW_VERSION="$CURRENT_VERSION-dryrun"
else
  npm version $VERSION_TYPE --no-git-tag-version
  NEW_VERSION=$(node -p "require('./package.json').version")
fi
echo -e "${GREEN}✨ New version: $NEW_VERSION${NC}"

# Update changelog
if [ "$DRY_RUN" = false ]; then
  echo -e "${YELLOW}📋 Update CHANGELOG.md with version $NEW_VERSION${NC}"
  echo "Please update the CHANGELOG.md file with the new version and press enter to continue..."
  read -p "Press enter when done..."
else
  echo -e "${BLUE}[DRY-RUN] Would prompt to update CHANGELOG.md${NC}"
fi

# Commit changes
echo -e "${YELLOW}💾 Committing changes...${NC}"
if [ "$DRY_RUN" = true ]; then
  echo -e "${BLUE}[DRY-RUN] Would run: git add -A${NC}"
  echo -e "${BLUE}[DRY-RUN] Would run: git commit -m \"chore: release v$NEW_VERSION\"${NC}"
else
  git add -A
  git commit -m "chore: release v$NEW_VERSION

Authored by: Aaron Lippold<lippold@gmail.com>"
fi

# Create tag
echo -e "${YELLOW}🏷️  Creating tag...${NC}"
if [ "$DRY_RUN" = true ]; then
  echo -e "${BLUE}[DRY-RUN] Would run: git tag -a \"v$NEW_VERSION\" -m \"Release v$NEW_VERSION\"${NC}"
else
  git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
fi

# Push to origin
echo -e "${YELLOW}📤 Pushing to origin...${NC}"
if [ "$DRY_RUN" = true ]; then
  echo -e "${BLUE}[DRY-RUN] Would run: git push origin main${NC}"
  echo -e "${BLUE}[DRY-RUN] Would run: git push origin \"v$NEW_VERSION\"${NC}"
else
  git push origin main
  git push origin "v$NEW_VERSION"
fi

echo -e "${GREEN}✅ Release v$NEW_VERSION complete!${NC}"
echo ""
echo "The GitHub Action will now:"
echo "  1. Create a GitHub release"
echo "  2. Publish to npm"
echo ""
echo "Monitor the release at: https://github.com/mitre/nuxt-smartscript/actions"