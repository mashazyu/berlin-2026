# Berlin 2026

Informational comparison of Berlin party positions for the **20 September 2026** Berlin state election (Wahl zum Abgeordnetenhaus).

Live domain: [www.berlin-2026.de](https://www.berlin-2026.de)

Languages: English, German, Turkish, Kurdish (Kurmanji), Vietnamese, Polish, Russian, Ukrainian, Arabic, Spanish, Italian.

## Stack

- Next.js 15 (App Router) + TypeScript + pnpm
- Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com) (`components.json`, `pnpm dlx shadcn@latest add …`)
- Locale JSON in `locales/{en,de,tr,ku,vi,pl,ru,uk,ar,es,it}.json`
- Comparison dataset split under `data/comparison/` (`base.json` + `{lang}.json` overlays)
- Resolved per-locale files emitted to `public/data/comparison/{lang}.json` on `dev`/`build` (keeps ISR page payloads small)

## Develop

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/de` or negotiated language).

```bash
pnpm build
pnpm type-check
pnpm check:translation-completeness
pnpm check:translation-links
pnpm encode:comparison     # rebuild monolith from Notion scrapes (script paths)
pnpm split:comparison      # monolith → data/comparison/base.json + {lang}.json
pnpm assemble:comparison   # overlays → data/comparison.json (for Python verify scripts)
pnpm emit:comparison       # overlays → public/data/comparison/{lang}.json
pnpm verify:citations
pnpm verify:relevance
```

### Cypress smoke

With the app running (`pnpm build && pnpm start` or `pnpm dev`):

```bash
CYPRESS_BASE_URL=http://127.0.0.1:3000 pnpm test:e2e      # headless
CYPRESS_BASE_URL=http://127.0.0.1:3000 pnpm test:e2e:open # interactive UI
```

(Scripts clear `ELECTRON_RUN_AS_NODE` so Cypress can start if that env var is set in the shell.)
## Maintaining content

- [docs/SITE-OVERVIEW.md](docs/SITE-OVERVIEW.md) — where to edit what
- [docs/content-update-runbook.md](docs/content-update-runbook.md) — comparison / locale / mentions checklist
- Election date constant: `lib/seo/election.ts`

## CI

PRs to `main` run [`.github/workflows/ci-pr.yml`](.github/workflows/ci-pr.yml):

- Lint, type-check, i18n (completeness + links)
- Content verify (assemble + citation/relevance Python checks)
- Security (gitleaks + `pnpm audit`)
- Cypress e2e against `next build` + `next start`

Dependabot updates npm and GitHub Actions weekly. Push to `main` can notify IndexNow via [`.github/workflows/indexnow.yml`](.github/workflows/indexnow.yml).

## Deploy (Vercel)

1. Push this repo to GitHub (`mashazyu/berlin-2026`).
2. Import the repo in [Vercel](https://vercel.com) — Framework: Next.js, production branch: `main`.
3. Every merge/push to `main` deploys automatically.
4. Add domains `berlin-2026.de` and `www.berlin-2026.de`. Apex redirects to `www` via `next.config.ts`.

## PostHog (product analytics)

1. Create a project at [eu.posthog.com](https://eu.posthog.com) (EU, not US).
2. In Project settings: copy the Project API key; enable **Cookieless server hash mode**; turn **Session replay** off; accept the DPA; set a **$0 billing limit**.
3. Set in `.env.local` and in Vercel env (Production + Preview):

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_...
# or: NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

4. Restart `pnpm dev` after changing env. Without the key, analytics no-ops.

**Verify locally:** open the site → interact with the comparison → Live events in PostHog EU (cookieless; no cookie banner).

## Content notes

- Table cells are AI-assisted summaries of official party programs. Double-check what matters; full translations: [BerlinVote.Help](https://www.berlinvote.help/).
- Contact: feedback@berlin-2026.de
- Not affiliated with any party or the City of Berlin.
