#!/usr/bin/env bash
# Vercel Ignored Build Step helper.
# Exit 0 → skip deploy; exit 1 → build (Vercel convention).
#
# Dashboard → Project → Settings → Git → Ignored Build Step:
#   bash scripts/vercel-should-build.sh apps/www packages/ui packages/landing
#
# For the live root berlin project (Root Directory /):
#   bash scripts/vercel-should-build.sh app components lib locales data public scripts middleware.ts next.config.ts package.json

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "usage: $0 <path> [path...]" >&2
  exit 1
fi

# First deploy / missing previous SHA → always build
if [ -z "${VERCEL_GIT_PREVIOUS_SHA:-}" ]; then
  echo "▶ No VERCEL_GIT_PREVIOUS_SHA — building"
  exit 1
fi

PREV="${VERCEL_GIT_PREVIOUS_SHA}"
CURR="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

# Shared workspace files always invalidate every app
PATHS=("$@" "pnpm-lock.yaml" "pnpm-workspace.yaml")

if git diff --quiet "$PREV" "$CURR" -- "${PATHS[@]}"; then
  echo "⏹ No changes in: ${PATHS[*]} — skipping"
  exit 0
fi

echo "▶ Changes detected under monitored paths — building"
exit 1
