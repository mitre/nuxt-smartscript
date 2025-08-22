# Security Policy

## Reporting Security Issues

The MITRE SAF team takes security seriously. If you discover a security vulnerability in the nuxt-smartscript plugin, please report it responsibly.

### Contact Information

- **Email**: [saf@mitre.org](mailto:saf@mitre.org)
- **GitHub**: Use the [Security tab](https://github.com/mitre/nuxt-smartscript/security) to report vulnerabilities privately

### What to Include

When reporting security issues, please provide:

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** assessment
4. **Suggested fix** (if you have one)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Timeline**: Varies by severity

## Security Best Practices

### For Users

- **Keep Updated**: Use the latest version of the plugin
- **Configuration**: Review your typography configuration for any unexpected transformations
- **Content Sanitization**: The plugin only transforms visual display, not underlying content
- **CSP Compatibility**: Plugin is compatible with Content Security Policy

### For Contributors

- **Dependency Scanning**: Run security checks before submitting PRs
- **DOM Safety**: Ensure all DOM manipulations are safe
- **Input Validation**: All regex patterns must be properly escaped
- **Test Security**: Include tests for XSS and injection scenarios

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ Yes    |

## Security Testing

The plugin includes security testing:

```bash
# Run tests
pnpm test

# Check for vulnerable dependencies
pnpm audit

# Lint for security issues
pnpm lint
```

## Known Security Considerations

### DOM Manipulation
- The plugin modifies DOM text nodes for visual presentation only
- Original content is preserved in data attributes
- No execution of user content

### Pattern Matching
- All regex patterns are pre-compiled and tested
- No dynamic pattern generation from user input
- Patterns are scoped to specific text transformations

### Performance
- Debounced processing prevents DOM flooding
- Batch processing limits resource consumption
- MutationObserver has configurable thresholds

### Content Security
- Plugin respects `data-no-superscript` attributes
- Excluded selectors prevent processing of sensitive areas
- Compatible with strict CSP policies