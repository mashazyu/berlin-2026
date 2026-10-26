#!/usr/bin/env bash
# Regenerate public-project-story PDFs into public/reports/ (served by the site).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PDF_OPTS='{"format":"A4","margin":{"top":"16mm","bottom":"18mm","left":"14mm","right":"14mm"},"printBackground":true}'
CSS="docs/reports/public-project-story.css"
OUT_DIR="public/reports"
mkdir -p "$OUT_DIR"

if [[ -z "${PUPPETEER_EXECUTABLE_PATH:-}" ]]; then
  for candidate in \
    "$HOME/Library/Caches/ms-playwright"/chromium-*/chrome-mac*/"Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing" \
    "$HOME/.cache/ms-playwright"/chromium-*/chrome-linux/chrome
  do
    if [[ -x "$candidate" ]]; then
      export PUPPETEER_EXECUTABLE_PATH="$candidate"
      break
    fi
  done
fi

if [[ -z "${PUPPETEER_EXECUTABLE_PATH:-}" ]]; then
  echo "Set PUPPETEER_EXECUTABLE_PATH to a Chromium binary, or install Playwright Chromium." >&2
  exit 1
fi

# Prefer a local Chrome binary via PUPPETEER_EXECUTABLE_PATH (sandbox/CI may block bundled Chromium).
npx --yes md-to-pdf docs/reports/public-project-story.md --stylesheet "$CSS" --pdf-options "$PDF_OPTS"
npx --yes md-to-pdf docs/reports/public-project-story.de.md --stylesheet "$CSS" --pdf-options "$PDF_OPTS"

mv -f docs/reports/public-project-story.pdf "$OUT_DIR/public-project-story.pdf"
mv -f docs/reports/public-project-story.de.pdf "$OUT_DIR/public-project-story.de.pdf"

echo "wrote $OUT_DIR/public-project-story.pdf"
echo "wrote $OUT_DIR/public-project-story.de.pdf"
