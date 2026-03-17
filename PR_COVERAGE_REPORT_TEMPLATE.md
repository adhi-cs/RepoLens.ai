# Pull Request – Test Coverage Analysis Report

**PR:** _[PR number/title]_  
**Branch:** _[base] → [head]_  
**Analyzed at:** _[date]_

---

## 1. Code changes summary

| Category | Count |
|----------|--------|
| New files | _N_ |
| Modified files | _N_ |
| New functions/methods | _N_ |
| Modified functions/methods | _N_ |
| Formatting-only files (excluded) | _N_ |

### Changed files and symbols

| File | Change type | New/Modified symbols |
|------|-------------|----------------------|
| `path/to/file.py` | Added / Modified | `function_a()`, `ClassB.method_c()` |
| … | … | … |

---

## 2. Map: code → tests

| Source (file: symbol) | Test file(s) | Test name(s) / describe blocks |
|-----------------------|--------------|---------------------------------|
| `src/foo.py: bar()` | `tests/test_foo.py` | `test_bar_basic`, `test_bar_edge_case` |
| `src/foo.py: Baz.qux()` | _None found_ | — |
| … | … | … |

**Legend:**  
- ✅ Has matching tests  
- ❌ No matching tests found  

---

## 3. Coverage analysis (per changed symbol)

### 3.1 Functions / methods

| Symbol | Tested? | # Test cases | Test type(s) | Edge cases / branches |
|--------|---------|--------------|--------------|-------------------------|
| `module.func_a` | Yes / No | _n_ | unit / integration | _List: covered vs missing_ |
| `Module.Class.method_b` | Yes / No | _n_ | unit / integration | _e.g. error path untested_ |
| … | … | … | … | … |

### 3.2 Missing coverage (action items)

| Symbol | Missing coverage |
|--------|------------------|
| `module.func_x` | No tests; add unit tests for success and error paths. |
| `Module.method_y` | Branch `if error:` not covered; add test that triggers error. |
| … | … |

### 3.3 Untested branches / edge cases

- **File:** `path/to/file.ext`
  - **Branch:** `if condition` (line _N_) – not covered.
  - **Edge case:** _e.g. empty input, null, boundary value._
- …

---

## 4. Coverage delta

| Metric | Before PR (existing) | After PR | Delta |
|--------|----------------------|----------|--------|
| Line coverage | _X%_ | _Y%_ | _+Z%_ / _-Z%_ |
| Branch coverage | _X%_ | _Y%_ | _+Z%_ / _-Z%_ |
| Functions covered | _n_ / _total_ | _n_ / _total_ | _+k_ / _-k_ |

_If exact report unavailable: “Approximate; based on manual mapping of changed symbols to tests.”_

---

## 5. Verdict and recommendations

- **Overall:** ✅ **Approved** / ⚠️ **Conditional** / ❌ **Needs more tests**
- **Summary:** _1–2 sentences on whether new/modified code is adequately tested._
- **Recommendations:**
  1. _e.g. Add unit tests for `module.new_func()`._
  2. _e.g. Add test for error handling in `Class.method()`._
  3. _e.g. Consider integration test for new API endpoint._

---

## Appendix: Commands used

```bash
# Diff
git diff main...feature-branch

# Tests / coverage (examples)
pytest --cov=src --cov-report=term-missing
npm test -- --coverage
go test -cover ./...
```
