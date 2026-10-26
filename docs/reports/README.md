# Reports

Locked metrics live in [`_metrics-summary.md`](_metrics-summary.md). Portfolio narrative: [`portfolio-case-study.md`](portfolio-case-study.md). Public story (EN/DE + PDFs): [`public-project-story.md`](public-project-story.md).

## Local inputs

Analytics exports belong in a local **`stats/`** directory at the repo root (gitignored). Chart regeneration needs that tree; committed SVGs under [`charts/`](charts/) are the preview artifacts.

## Regenerate charts

```bash
python3 scripts/generate-report-charts.py
```

Requires `matplotlib` and a local `stats/` snapshot matching the paths hardcoded in the script.

## Regenerate public story PDFs

```bash
./scripts/generate-report-pdfs.sh
```

Uses `npx md-to-pdf` and Chromium (Playwright cache or `PUPPETEER_EXECUTABLE_PATH`). Styled with [`public-project-story.css`](public-project-story.css).
