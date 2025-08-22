# Pattern Design Documentation

## Math Pattern Evolution

This document explains the design decisions behind our math notation patterns, particularly the complex regex patterns used for superscript and subscript detection.

## The Challenge

We needed to detect mathematical notation like `x^2` and `x_n` while avoiding false positives in programming identifiers like `file_name` or `MAX_SIZE`. Additionally, we wanted to support famous equations like `E=mc^2`.

## Pattern Evolution

### Version 1: Simple Pattern (Too Broad)
```javascript
/\^(\d+|\{[^}]+\})/g  // Matches just ^2, ^{n+1}
/_(\d+|\{[^}]+\})/g   // Matches just _n, _{10}
```
**Problem**: Would match `file_name` → `file` + subscript `name`

### Version 2: Negative Lookbehind (Too Restrictive)
```javascript
/(?<![a-zA-Z])([a-zA-Z])\^(\d+|[a-zA-Z]|\{[^}]+\})/g
```
**Problem**: Wouldn't match `E=mc^2` because `c` follows `m`

### Version 3: Context-Aware (Final Solution)

#### Superscript Pattern
```javascript
/(?<=^|[\s=+\-*/().,\d]|[a-z])([a-zA-Z])\^(\d+|[a-zA-Z]|\{[^}]+\})/g
```

**Lookbehind contexts where superscript is valid:**
- `^` - Start of string
- `[\s=+\-*/().,\d]` - After whitespace, operators, or digits
- `[a-z]` - After lowercase letter (for physics equations)

**Why it works:**
- `E=mc^2` → Matches `c^2` (c after lowercase m)
- `2x^2` → Matches `x^2` (x after digit)
- `file^name` → Matches `e^n` (acceptable limitation)
- `MAX^2` → Doesn't match (X after uppercase A)

#### Subscript Pattern
```javascript
/(?<=^|[\s=+\-*/().,])([a-zA-Z])_(\d+|[a-zA-Z]|\{[^}]+\})/g
```

**More restrictive than superscript** (no `[a-z]` option):
- Underscores are common in identifiers
- Must only match in clear math contexts

**Examples:**
- ✅ `H_2O` → Matches `H_2`
- ✅ `x_1 + y_2` → Matches both
- ❌ `file_name` → No match
- ❌ `some_var` → No match

## Test Coverage

See `test-pattern4.js` for comprehensive testing:

```javascript
// Real-world examples that work correctly:
"The formula E=mc^2 shows" → c^2 transformed
"Calculate x^2 + y^2" → Both transformed  
"Water is H_2O" → H_2 transformed
"The file_name variable" → Unchanged
```

## Trade-offs

1. **`file^name`** will match `e^n` - This is unlikely in real code and acceptable
2. **Multi-letter variables** like `log_2` won't match - This is intentional
3. **Performance** - Positive lookbehind is well-optimized in modern JS engines

## Implementation Notes

The patterns are defined in `src/runtime/smartscript/patterns.ts` with extensive inline documentation. Each pattern includes:
- The regex with explanation
- Breakdown of each component
- Examples of matches and non-matches
- Known limitations

## Future Considerations

If we need to handle more complex cases:
1. Consider a two-pass approach: identify math contexts first, then apply patterns
2. Use a proper math expression parser (like KaTeX) for sections marked as math
3. Allow configuration to choose between strict and permissive modes