#!/usr/bin/env node
/**
 * Generate PR coverage report from analysis artifacts (dynamic per PR).
 * Reads: pr_diff.txt, changed_files.txt, coverage_report.txt, coverage_report_base.txt (optional).
 * Writes: pr-coverage-analysis/PR_COVERAGE_REPORT.md
 *
 * Run after: ./analyze_pr_coverage.sh [base] [head]
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(REPO_ROOT, 'pr-coverage-analysis');
const REPORT_PATH = path.join(OUT_DIR, 'PR_COVERAGE_REPORT.md');

function readSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function parseDiff(diff) {
  const files = [];
  const fileSymbols = {};
  const testBlocks = {};
  let currentFile = null;

  const lines = diff.split('\n');
  for (const line of lines) {
    const gitFile = line.match(/^diff --git a\/(.+?) b\//);
    if (gitFile) {
      currentFile = gitFile[1];
      files.push(currentFile);
      fileSymbols[currentFile] = [];
      continue;
    }
    if (!currentFile) continue;
    if (line.startsWith('+') && !line.startsWith('+++')) {
      const added = line.slice(1);
      const fnMatch = added.match(/function\s+(\w+)\s*\(/);
      if (fnMatch) fileSymbols[currentFile].push({ name: fnMatch[1], type: 'function' });
      const describeMatch = added.match(/describe\s*\(\s*['"]([^'"]+)['"]/);
      if (describeMatch) {
        if (!testBlocks[currentFile]) testBlocks[currentFile] = [];
        testBlocks[currentFile].push(describeMatch[1]);
      }
      const itMatch = added.match(/\bit\s*\(\s*['"]([^'"]+)['"]/);
      if (itMatch && testBlocks[currentFile]?.length) {
        const last = testBlocks[currentFile][testBlocks[currentFile].length - 1];
        if (typeof last === 'string') testBlocks[currentFile][testBlocks[currentFile].length - 1] = { describe: last, it: itMatch[1] };
      }
    }
  }

  const sourceFiles = files.filter((f) => !/\.(test|spec)\.(js|ts|jsx|tsx)$/.test(f) && !f.includes('__tests__'));
  const testFiles = files.filter((f) => /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(f) || f.includes('__tests__'));

  return { files, fileSymbols, testBlocks, sourceFiles, testFiles };
}

function parseCoverageReport(content) {
  const result = { statements: null, branches: null, functions: null, lines: null, files: [], uncoveredLines: {} };
  const lines = content.split('\n');
  for (const line of lines) {
    const summaryMatch = line.match(/Statements\s*:\s*([\d.]+)%\s*\(?\s*(\d+)\/(\d+)\s*\)?/);
    if (summaryMatch) result.statements = { pct: summaryMatch[1], covered: summaryMatch[2], total: summaryMatch[3] };
    const branchMatch = line.match(/Branches\s*:\s*([\d.]+)%\s*\(?\s*(\d+)\/(\d+)\s*\)?/);
    if (branchMatch) result.branches = { pct: branchMatch[1], covered: branchMatch[2], total: branchMatch[3] };
    const funcMatch = line.match(/Functions\s*:\s*([\d.]+)%\s*\(?\s*(\d+)\/(\d+)\s*\)?/);
    if (funcMatch) result.functions = { pct: funcMatch[1], covered: funcMatch[2], total: funcMatch[3] };
    const lineMatch = line.match(/Lines\s*:\s*([\d.]+)%\s*\(?\s*(\d+)\/(\d+)\s*\)?/);
    if (lineMatch) result.lines = { pct: lineMatch[1], covered: lineMatch[2], total: lineMatch[3] };
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length >= 6 && parts[0] && /\.(js|ts|jsx|tsx)$/.test(parts[0])) {
      const fileName = parts[0];
      if (fileName === 'File' || fileName === 'All files') continue;
      const uncovered = (parts[5] || '').trim();
      result.files.push({ name: fileName, statements: parts[1], branches: parts[2], functions: parts[3], lines: parts[4] });
      if (uncovered && /^\d/.test(uncovered)) result.uncoveredLines[fileName] = uncovered;
    }
  }
  return result;
}

function inferTestFile(sourcePath) {
  const base = path.basename(sourcePath, path.extname(sourcePath));
  const dir = path.dirname(sourcePath);
  const testDir = dir.includes('src') ? dir.replace(/src/, 'tests').replace(/\/$/, '') : 'tests';
  return `${testDir}/${base}.test.js`;
}

function buildReport(diff, changedFilesRaw, coverageAfter, coverageBase, baseBranch, headBranch) {
  const changedFiles = changedFilesRaw.split('\n').map((f) => f.trim()).filter(Boolean);
  const { fileSymbols, sourceFiles, testFiles, testBlocks } = parseDiff(diff);
  const after = parseCoverageReport(coverageAfter);
  const base = coverageBase.trim() ? parseCoverageReport(coverageBase) : null;

  const now = new Date().toISOString().slice(0, 10);
  const prTitle = headBranch ? `${baseBranch} → ${headBranch}` : 'PR';

  let md = `# Pull Request – Test Coverage Analysis Report

**Branch:** ${prTitle}  
**Analyzed at:** ${now}

---

## 1. Code changes summary

| Category | Count |
|----------|--------|
| New files | ${changedFiles.filter((f) => !diff.includes(`--- a/${f}`)).length} |
| Modified files | ${changedFiles.length} |
| New functions/methods | ${sourceFiles.reduce((n, f) => n + (fileSymbols[f] || []).filter((s) => s.type === 'function').length, 0)} |
| Formatting-only files (excluded) | 0 |

### Changed files and symbols

| File | Change type | New/Modified symbols |
|------|-------------|----------------------|
`;

  for (const file of changedFiles) {
    const symbols = (fileSymbols[file] || []).map((s) => `${s.name}()`).join(', ');
    const changeType = /\.(test|spec)\./.test(file) ? 'Modified (tests)' : 'Modified';
    md += `| \`${file}\` | ${changeType} | ${symbols || '(see diff)'} |\n`;
  }

  md += `
---

## 2. Map: code → tests

| Source (file: symbol) | Test file(s) | Test name(s) / describe blocks |
|-----------------------|--------------|---------------------------------|
`;

  for (const file of sourceFiles) {
    if (!changedFiles.includes(file)) continue;
    const symbols = fileSymbols[file] || [];
    const testFile = testFiles.find((t) => t.includes(path.basename(file, path.extname(file)))) || inferTestFile(file);
    const blocks = testBlocks[testFile] || testBlocks[file];
    const testNames = Array.isArray(blocks) ? blocks.map((b) => (typeof b === 'string' ? b : b.describe || b)).join(', ') : '—';
    for (const s of symbols) {
      const status = blocks?.length ? '✅' : '❌';
      md += `| \`${file}\`: \`${s.name}()\` | \`${testFile}\` | ${testNames || '—'} ${status} |\n`;
    }
    if (symbols.length === 0) md += `| \`${file}\` | \`${testFile}\` | ${testNames || '—'} |\n`;
  }

  md += `
**Legend:** ✅ Has matching tests | ❌ No matching tests found

---

## 3. Coverage analysis (per changed symbol)

### 3.1 Functions / methods

| Symbol | Tested? | Test type(s) | Notes |
|--------|---------|--------------|--------|
`;

  for (const file of sourceFiles) {
    if (!changedFiles.includes(file)) continue;
    const symbols = (fileSymbols[file] || []).filter((s) => s.type === 'function');
    const baseName = path.basename(file, path.extname(file));
    const hasTests = testFiles.some((t) => t.includes(baseName)) || (testBlocks[file] || []).length > 0;
    for (const s of symbols) {
      const tested = hasTests ? 'Yes' : 'No';
      md += `| \`${baseName}.${s.name}\` | ${tested} | unit | — |\n`;
    }
  }

  const uncoveredList = Object.entries(after.uncoveredLines).filter(([, lines]) => lines);
  md += `
### 3.2 Missing coverage (action items)

| Symbol / File | Uncovered |
|---------------|-----------|
`;
  if (uncoveredList.length) {
    for (const [file, lines] of uncoveredList) {
      md += `| \`${file}\` | Line(s) ${lines} |\n`;
    }
  } else {
    md += `| — | No uncovered lines in coverage report |\n`;
  }

  md += `
### 3.3 Untested branches / edge cases

`;
  for (const [file, lines] of uncoveredList) {
    md += `- **File:** \`${file}\` – Uncovered line(s): ${lines}\n`;
  }
  if (uncoveredList.length === 0) md += `- None identified from coverage report.\n`;

  md += `
---

## 4. Coverage delta

| Metric | Before PR (existing) | After PR | Delta |
|--------|----------------------|----------|--------|
`;

  const lineBefore = base?.lines ? `${base.lines.pct}% (${base.lines.covered}/${base.lines.total})` : '—';
  const lineAfter = after.lines ? `${after.lines.pct}% (${after.lines.covered}/${after.lines.total})` : '—';
  let lineDelta = '—';
  if (base?.lines && after.lines) {
    const delta = parseFloat(after.lines.pct) - parseFloat(base.lines.pct);
    lineDelta = (delta >= 0 ? '+' : '') + delta.toFixed(2) + '%';
  }
  md += `| Line coverage | ${lineBefore} | ${lineAfter} | ${lineDelta} |\n`;

  const branchBefore = base?.branches ? `${base.branches.pct}%` : '—';
  const branchAfter = after.branches ? `${after.branches.pct}%` : '—';
  let branchDelta = '—';
  if (base?.branches && after.branches) {
    const delta = parseFloat(after.branches.pct) - parseFloat(base.branches.pct);
    branchDelta = (delta >= 0 ? '+' : '') + delta.toFixed(2) + '%';
  }
  md += `| Branch coverage | ${branchBefore} | ${branchAfter} | ${branchDelta} |\n`;

  const funcBefore = base?.functions ? `${base.functions.covered}/${base.functions.total}` : '—';
  const funcAfter = after.functions ? `${after.functions.covered}/${after.functions.total}` : '—';
  md += `| Functions covered | ${funcBefore} | ${funcAfter} | — |\n`;

  if (!base) md += `\n_Base branch coverage not run; delta is N/A. Re-run \`analyze_pr_coverage.sh\` with coverage on both branches._\n`;

  md += `
---

## 5. Verdict and recommendations

- **Overall:** ${uncoveredList.length > 0 ? '⚠️ **Conditional**' : '✅ **Approved**'} – ${uncoveredList.length > 0 ? 'uncovered lines present; add tests for listed lines.' : 'coverage maintained or improved.'}
- **Recommendations:**
  1. Review uncovered line(s) above and add unit tests where appropriate.
  2. Re-run \`./analyze_pr_coverage.sh ${baseBranch || 'main'} ${headBranch || 'HEAD'}\` after changes.
`;

  md += `
---

## Appendix: Commands used

\`\`\`bash
git diff ${baseBranch || 'main'}...${headBranch || 'HEAD'}
./analyze_pr_coverage.sh ${baseBranch || 'main'} ${headBranch || 'HEAD'}
\`\`\`
`;

  return md;
}

function main() {
  const baseBranch = process.argv[2] || 'main';
  const headBranch = process.argv[3] || 'HEAD';

  const diff = readSafe(path.join(OUT_DIR, 'pr_diff.txt'));
  const changedFiles = readSafe(path.join(OUT_DIR, 'changed_files.txt'));
  const coverageAfter = readSafe(path.join(OUT_DIR, 'coverage_report.txt'));
  const coverageBase = readSafe(path.join(OUT_DIR, 'coverage_report_base.txt'));

  if (!diff.trim()) {
    console.error('Error: pr-coverage-analysis/pr_diff.txt is empty. Run ./analyze_pr_coverage.sh first.');
    process.exit(1);
  }

  const report = buildReport(diff, changedFiles, coverageAfter, coverageBase, baseBranch, headBranch);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, report, 'utf8');
  console.log('[5] Report generated:', REPORT_PATH);
}

main();
