#!/usr/bin/env bash
# PR Test Coverage Analysis – helper script
# Usage:
#   ./analyze_pr_coverage.sh [base_branch] [head_branch]
#   Default: base=main, head=HEAD (current branch)
#
# Requires: git, and (optional) coverage tool (pytest, jest, go test, etc.)

set -e
REPO_ROOT="$(git rev-parse --show-toplevel)"
BASE="${1:-main}"
HEAD="${2:-HEAD}"
OUT_DIR="${REPO_ROOT}/pr-coverage-analysis"
mkdir -p "$OUT_DIR"

echo "=== PR Coverage Analysis ==="
echo "Base: $BASE  Head: $HEAD"
echo ""

# Step 1: Export diff
DIFF_FILE="${OUT_DIR}/pr_diff.txt"
git diff "$BASE"...$HEAD --no-color > "$DIFF_FILE" || true
echo "[1] Diff saved to $DIFF_FILE ($(wc -l < "$DIFF_FILE") lines)"

# List changed files (for mapping to tests)
CHANGED_FILES="${OUT_DIR}/changed_files.txt"
git diff "$BASE"...$HEAD --name-only > "$CHANGED_FILES"
echo "[2] Changed files: $(wc -l < "$CHANGED_FILES")"

# Step 2: Detect test layout
if [ -d "${REPO_ROOT}/tests" ]; then
  echo "[3] Test directory: tests/"
elif [ -d "${REPO_ROOT}/__tests__" ]; then
  echo "[3] Test directory: __tests__/"
elif [ -d "${REPO_ROOT}/test" ]; then
  echo "[3] Test directory: test/"
else
  echo "[3] Test directory: (searching...)"
  find "$REPO_ROOT" -maxdepth 3 -type d -name "test*" 2>/dev/null || true
fi

# Step 3: Run coverage if available (optional)
COV_REPORT="${OUT_DIR}/coverage_report.txt"
if command -v pytest &>/dev/null && [ -f "${REPO_ROOT}/pyproject.toml" ] || [ -f "${REPO_ROOT}/setup.cfg" ] || [ -f "${REPO_ROOT}/pytest.ini" ]; then
  echo "[4] Running pytest with coverage..."
  (cd "$REPO_ROOT" && pytest --cov --cov-report=term-missing -q 2>/dev/null) > "$COV_REPORT" 2>&1 || true
elif [ -f "${REPO_ROOT}/package.json" ] && grep -q '"jest"\|"vitest"\|"mocha"' "${REPO_ROOT}/package.json" 2>/dev/null; then
  echo "[4] Running npm test -- --coverage..."
  (cd "$REPO_ROOT" && npm test -- --coverage --watchAll=false 2>/dev/null) > "$COV_REPORT" 2>&1 || true
else
  echo "[4] No supported coverage runner found; skip or add your command."
fi

echo ""
echo "Outputs in: $OUT_DIR"
echo "Next: Fill PR_COVERAGE_REPORT_TEMPLATE.md using diff + test files + coverage (if any)."
