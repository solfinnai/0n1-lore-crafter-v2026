#!/bin/bash
# Publish the current local code to GitHub (solfinnai/0n1-lore-crafter-v2026),
# which auto-deploys to Vercel.
#
# Usage:  ./publish.sh "what changed"
#
# Why this exists: the public repo carries a CLEAN history (the local repo's
# old commits contain a dead-but-real Supabase key, so they must never be
# pushed there). This script snapshots your current code onto the clean
# v2026-release branch and pushes it as main.
set -euo pipefail
cd "$(dirname "$0")"

MSG="${1:-Update from local}"

if ! git diff-index --quiet HEAD --; then
  echo "You have uncommitted changes. Commit them first:"
  git status --short
  exit 1
fi

SNAPSHOT=$(git commit-tree "HEAD^{tree}" -p v2026-release -m "$MSG")
git branch -f v2026-release "$SNAPSHOT"
git push v2026 v2026-release:main
echo
echo "Published. Vercel is deploying: https://0n1-lore-crafter-v2026-six.vercel.app"
