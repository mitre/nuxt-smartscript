# Pattern Expectations Analysis

## Math Notation Patterns

### What Should Match

#### Subscripts
- `x_1` → x₁ (single digit)
- `x_n` → x_n_ (single letter) **Currently fails**
- `x_i` → x_i_ (single letter) **Currently fails**
- `x_{10}` → x₁₀ (multi-digit in braces)
- `x_{n+1}` → x_{n+1}_ (expression in braces)
- `x_{ij}` → x_{ij}_ (multiple letters in braces)

#### Superscripts
- `x^2` → x² (single digit)
- `x^n` → xⁿ (single letter) **Currently fails**
- `x^i` → xⁱ (single letter) **Currently fails**
- `x^{10}` → x¹⁰ (multi-digit in braces)
- `x^{n+1}` → x^{n+1} (expression in braces)
- `x^{-1}` → x⁻¹ (negative in braces)

### What Should NOT Match
- `x_` (underscore alone)
- `x^` (caret alone)
- `_x` (underscore at start)
- `^x` (caret at start)
- `file_name` (underscore in file names)
- `x__n` (double underscore)

## Symbol Patterns

### Trademark
- `(TM)` → ™ ✓
- `Product(TM)` → Product™ ✓
- ` TM ` → ™ (standalone with spaces) ✓
- `TMNT` → no change (part of word) ✓
- `HTML` → no change (TM inside word) ✓

### Registered
- `(R)` → ® ✓
- `Brand(R)` → Brand® ✓
- `(R).` → ®. ✓
- `(R))` → no change (likely typo) ✓
- `((R))` → (®) **Currently fails - should we support?**

### Copyright
- `(C)` → © ✓
- `Copyright(C)` → Copyright© ✓
- `(C))` → no change (likely typo) ✓
- `((C))` → (©) **Currently fails - should we support?**

## Chemical Formulas

### What Should Match
- `H2O` → H₂O ✓
- `CO2` → CO₂ ✓
- `H2SO4` → H₂SO₄ ✓
- `Ca(OH)2` → Ca(OH)₂ ✓
- `Al2(SO4)3` → Al₂(SO₄)₃ ✓

### What Should NOT Match
- `H2` at start of sentence might be legitimate
- `2H2O` → only the H2O part matches ✓
- `mp3` → no change (lowercase) ✓
- `ABC2` → matches C2 (C is an element) **Is this right?**

## Ordinals

### What Should Match
- `1st` → 1ˢᵗ ✓
- `2nd` → 2ⁿᵈ ✓
- `3rd` → 3ʳᵈ ✓
- `21st` → 21ˢᵗ ✓
- `42nd` → 42ⁿᵈ ✓
- `11th` → 11ᵗʰ (not 11st) ✓
- `12th` → 12ᵗʰ (not 12nd) ✓
- `13th` → 13ᵗʰ (not 13rd) ✓

### What Should NOT Match
- `1street` → no change ✓
- `test1st` → no change ✓
- `1sttest` → no change ✓

## Questions to Resolve

1. **Math notation**: Should we support single-letter subscripts/superscripts without braces?
   - Recommendation: YES - this is standard mathematical notation

2. **Nested symbols**: Should `((R))` and `((C))` be supported?
   - Recommendation: MAYBE - could be legitimate emphasis, but rare

3. **Chemical elements**: Should standalone elements like `C`, `H`, `O` be ignored?
   - Current: Only matches when followed by numbers
   - Recommendation: Keep current behavior

4. **Mixed patterns**: How to handle `H2O^2` (water squared)?
   - Current: Would match both H2 and ^2
   - Recommendation: This seems correct

5. **Performance**: Should we limit pattern complexity for performance?
   - Current: All patterns run on all text
   - Recommendation: Keep simple, add config to disable unused patterns