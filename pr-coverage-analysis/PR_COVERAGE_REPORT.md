# Pull Request – Test Coverage Analysis Report

**Branch:** main → temp/test-pr  
**Analyzed at:** 2026-03-17

---

## 1. Code changes summary

| Category | Count |
|----------|--------|
| New files | 0 |
| Modified files | 2 |
| New functions/methods | 1 |
| Formatting-only files (excluded) | 0 |

### Changed files and symbols

| File | Change type | New/Modified symbols |
|------|-------------|----------------------|
| `src/calculator.js` | Modified | power() |
| `tests/calculator.test.js` | Modified (tests) | (see diff) |

---

## 2. Map: code → tests

| Source (file: symbol) | Test file(s) | Test name(s) / describe blocks |
|-----------------------|--------------|---------------------------------|
| `src/calculator.js`: `power()` | `tests/calculator.test.js` | power ✅ |

**Legend:** ✅ Has matching tests | ❌ No matching tests found

---

## 3. Coverage analysis (per changed symbol)

### 3.1 Functions / methods

| Symbol | Tested? | Test type(s) | Notes |
|--------|---------|--------------|--------|
| `calculator.power` | Yes | unit | — |

### 3.2 Missing coverage (action items)

| Symbol / File | Uncovered |
|---------------|-----------|
| — | No uncovered lines in coverage report |

### 3.3 Untested branches / edge cases

- None identified from coverage report.

---

## 4. Coverage delta

| Metric | Before PR (existing) | After PR | Delta |
|--------|----------------------|----------|--------|
| Line coverage | 100% (6/6) | 100% (9/9) | +0.00% |
| Branch coverage | 100% | 100% | +0.00% |
| Functions covered | 3/3 | 4/4 | — |

---

## 5. Verdict and recommendations

- **Overall:** ✅ **Approved** – coverage maintained or improved.
- **Recommendations:**
  1. Review uncovered line(s) above and add unit tests where appropriate.
  2. Re-run `./analyze_pr_coverage.sh main temp/test-pr` after changes.

---

## Appendix: Commands used

```bash
git diff main...temp/test-pr
./analyze_pr_coverage.sh main temp/test-pr
```
