# PR Test Coverage Analysis – Process & Output Format

This folder contains a **repeatable process** and **structured output format** for analyzing whether a GitHub PR’s new or modified code is covered by unit tests.

---

## Process (Steps 1–5)

### Step 1: Identify code changes
- Parse the git diff (e.g. `git diff main...feature-branch`).
- Extract:
  - **New** functions, classes, methods.
  - **Modified** logic blocks (not just formatting).
- Ignore formatting-only changes (whitespace, comments-only).

### Step 2: Map code to tests
- Search the repo for unit tests that relate to the changed code.
- Match by:
  - Function/class names (e.g. `test_<name>`, `describe('<name>')`).
  - File layout (e.g. `src/foo.py` → `tests/test_foo.py`).
  - Imports and references to the changed modules.

### Step 3: Coverage analysis (per changed symbol)
For each changed function/method:
- **Is it tested?** Yes / No.
- **Number of test cases** that hit it.
- **Type of tests:** unit vs integration.
- **Gaps:**
  - Missing edge cases.
  - Untested branches (if/else, error handling, early returns).

### Step 4: Coverage delta
- **Existing coverage** (before PR), if you have a report.
- **New coverage** after the PR (from tooling or manual mapping).
- **Delta:** % or count increase/decrease.

### Step 5: Output format
Use the **structured report** in `PR_COVERAGE_REPORT_TEMPLATE.md`:
- Code changes summary + changed files/symbols.
- Map: source symbol → test file(s) and test name(s).
- Per-symbol: tested? # cases, type, edge cases/branches.
- Missing coverage and untested branches.
- Coverage delta (before/after/delta).
- Verdict (Approved / Conditional / Needs more tests) and recommendations.

---

## How to use

1. **When you have a real PR and repo:**
   - Run `./analyze_pr_coverage.sh [base] [head]` (e.g. `./analyze_pr_coverage.sh main feature/xyz`).
   - This writes the diff and optional coverage run into `pr-coverage-analysis/`.

2. **Fill the report:**
   - Open `PR_COVERAGE_REPORT_TEMPLATE.md`.
   - Use the diff, changed files, and test layout to complete Sections 1–2.
   - For each changed symbol, complete Section 3 (and list missing coverage / branches).
   - Add coverage numbers and delta in Section 4, then verdict and recommendations in Section 5.

3. **Optional:** Integrate with your CI to run the script on PRs and paste coverage output into the template.

---

## Files in this folder

| File | Purpose |
|------|--------|
| `PR_COVERAGE_REPORT_TEMPLATE.md` | Structured report to fill for each PR. |
| `analyze_pr_coverage.sh` | Script to capture diff, changed files, and (if possible) coverage. |
| `README_PR_COVERAGE.md` | This process and usage guide. |

---

## If you already have a diff or PR

To get a **filled report** instead of a template:
- Provide the **git diff** (or patch) of the PR.
- Point to the **repo root** or **test directory** (or paste relevant test file paths).
- Optionally provide an **existing coverage report** (e.g. `pytest --cov`, `jest --coverage`).

Then the same 5-step process can be run to produce the structured report with concrete “tested? yes/no”, “missing branches”, and “coverage delta” filled in.
