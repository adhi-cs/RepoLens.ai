# PR Test Coverage Analysis – Demo Repo

A small JavaScript app and **end-to-end demo** for analyzing whether a pull request's new or modified code is covered by unit tests.

## Generate a report when you create a PR

Run this with your PR’s base and head branches (e.g. from your feature branch):

**Existing PR** (e.g. `feature/add-multiply` → `main`):

```bash
npm install
./analyze_pr_coverage.sh main feature/add-multiply
```

From the feature branch (uses `main` and current branch):

```bash
./analyze_pr_coverage.sh
```

The **coverage report** is written to **`pr-coverage-analysis/PR_COVERAGE_REPORT.md`** (diff, coverage delta, verdict, and recommendations).

## Push and create a PR (end-to-end test)

1. **Create a new repository on GitHub** (empty, no README): https://github.com/new

2. **Push this branch and get the PR link:**
   ```bash
   ./push-and-create-pr.sh https://github.com/YOUR_USER/YOUR_REPO.git
   ```
   Replace with your GitHub username and repo name. The script pushes the current branch and prints the **Compare & pull request** URL.

3. **Open the URL** in your browser and create the PR. The PR will include **`pr-coverage-analysis/PR_COVERAGE_REPORT.md`** so you can verify the end-to-end flow.

## Run the demo

```bash
./run_demo.sh
```

Runs baseline + PR-branch coverage and analysis for the sample PR. Then open **`pr-coverage-analysis/PR_COVERAGE_REPORT.md`**.

**Full walkthrough:** see **[DEMO.md](DEMO.md)** (step-by-step and optional fix).

## What's in this repo

| Item | Description |
|------|--------------|
| **`./analyze_pr_coverage.sh [base] [head]`** | Run on PR: captures diff + coverage and **generates the report** |
| **`pr-coverage-analysis/PR_COVERAGE_REPORT.md`** | **Generated report** for the last run (dynamic per PR) |
| **`./run_demo.sh`** | One-command demo (baseline → PR branch → analysis) |
| **`DEMO.md`** | End-to-end demo guide and optional "close the gap" step |
| **`scripts/generate-report.js`** | Generates the markdown report from analysis artifacts |
| **`README_PR_COVERAGE.md`** | Process and output format (Steps 1–5) |
| **`src/calculator.js`** | Sample source (add, subtract, multiply, divide) |
| **`tests/calculator.test.js`** | Jest unit tests |

## Branches

- **`main`** – Initial calculator (add, subtract, divide); 100% coverage.
- **`feature/add-multiply`** – Sample PR branch (adds `multiply`, modifies `divide`); used in the demo.

## Requirements

- Node.js 18+
- Git
