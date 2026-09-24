# Site overview (berlin-2026)

Short map for humans and coding agents. Live site: [www.berlin-2026.de](https://www.berlin-2026.de).

## What this is

Multilingual comparison of Berlin party positions for the **20 September 2026** Abgeordnetenhaus election (`ELECTION_DATE` in [`lib/seo/election.ts`](../lib/seo/election.ts)).

## Where content lives

| Content | Path |
|---------|------|
| UI copy (nav, hero, legal, feedback) | [`locales/{lang}.json`](../locales/) |
| Comparison structure + PDF sources | [`data/comparison/base.json`](../data/comparison/base.json) |
| Per-language summaries / labels | [`data/comparison/{lang}.json`](../data/comparison/) |
| Press / mentions | [`data/mentions.json`](../data/mentions.json) |
| Supported languages | [`lib/seo/constants.ts`](../lib/seo/constants.ts) `SUPPORTED_LANGUAGES` |

Do **not** edit generated `public/data/comparison/*.json` or `data/comparison.json` — they are build/assemble outputs (gitignored).

## Build / data flow

```
data/comparison/base.json + {lang}.json
        │
        ├─ predev / prebuild → scripts/emit-comparison-public.mjs
        │                      → public/data/comparison/{lang}.json  (CDN static)
        │
        └─ pnpm assemble:comparison → data/comparison.json  (for Python verify)
```

Home page:

- **SSR** [`ComparisonTableSeo`](../components/comparison-table-seo.tsx): summaries only (crawlable, smaller ISR/FOT)
- **Client** fetches `/data/comparison/{lang}.json` for the interactive table (includes quotes)

Do not pass the full comparison object as Client Component props (blows ISR / Fast Origin Transfer).

## App routes

- `/` → negotiate language → `/{lang}`
- `/{lang}` home + comparison
- `/{lang}/about`, `/{lang}/ai-disclosure`
- Privacy / Impressum: **en** and **de** only; other locales redirect to `/de/...`

## Env (see [`.env.example`](../.env.example))

- PostHog: `NEXT_PUBLIC_POSTHOG_KEY` or `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`
- Feedback: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`
- Optional: `INDEXNOW_KEY` for `pnpm indexnow:submit`

## Quality bar

- `pnpm lint`, `pnpm type-check`
- `pnpm check:translation-completeness`, `pnpm check:translation-links`
- Comparison: `pnpm verify:citations`, `pnpm verify:relevance`
- Smoke: `pnpm test:e2e` (Cypress; use `test:e2e:open` interactively)

CI runs these on PRs to `main` (see `.github/workflows/ci-pr.yml`).
