#!/usr/bin/env bash
#
# Push current branch and create a PR (end-to-end test).
# Usage: ./push-and-create-pr.sh [REPO_URL]
#   REPO_URL = full GitHub repo URL, e.g. https://github.com/USER/REPO.git
#   If omitted, uses origin if already set.
#
set -e
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"
BRANCH="$(git branch --show-current)"

if [ -n "$1" ]; then
  if git remote get-url origin 2>/dev/null; then
    git remote set-url origin "$1"
  else
    git remote add origin "$1"
  fi
  echo "Remote origin set to: $1"
fi

if ! git remote get-url origin 2>/dev/null; then
  echo "Error: No remote 'origin' set."
  echo "  Create a repo on GitHub, then run:"
  echo "  ./push-and-create-pr.sh https://github.com/YOUR_USER/YOUR_REPO.git"
  exit 1
fi

echo "Pushing branch: $BRANCH"
git push -u origin "$BRANCH"

ORIGIN_URL="$(git remote get-url origin)"
# Convert git@github.com:user/repo.git or https://github.com/user/repo.git to compare URL
if [[ "$ORIGIN_URL" =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
  USER="${BASH_REMATCH[1]}"
  REPO="${BASH_REMATCH[2]%.git}"
  echo ""
  echo "=============================================="
  echo "  Push done. Create the PR:"
  echo "=============================================="
  echo "  Open: https://github.com/$USER/$REPO/compare/main...$BRANCH?expand=1"
  echo "  (Or: https://github.com/$USER/$REPO → Compare & pull request)"
  echo ""
fi
