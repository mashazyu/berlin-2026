# Reports

Wahl Kompass reporting lives under **`apps/wahl`** (not the live root berlin-2026 app).

Locked metrics: [`_metrics-summary.md`](_metrics-summary.md). Portfolio: [`portfolio-case-study.md`](portfolio-case-study.md). Public story (EN/DE + PDFs): [`public-project-story.md`](public-project-story.md).

## Local inputs

Analytics exports belong in a local **`apps/wahl/stats/`** directory (gitignored). Chart regeneration needs that tree; committed SVGs under [`charts/`](charts/) are the preview artifacts.

## Regenerate charts

From `apps/wahl`:

```bash
python3 scripts/generate-report-charts.py
```

Requires `matplotlib` (`scripts/requirements-report.txt`) and a local `stats/` snapshot.

## Regenerate public story PDFs

From `apps/wahl`:

```bash
./scripts/generate-report-pdfs.sh
```

Writes to [`public/reports/`](../../public/reports/) (served at `/reports/…`). Sources stay in this folder; styled with [`public-project-story.css`](public-project-story.css). Uses `npx md-to-pdf` and Chromium (`PUPPETEER_EXECUTABLE_PATH` or Playwright cache).
