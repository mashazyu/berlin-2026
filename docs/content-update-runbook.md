# Content update runbook

Step-by-step for changing comparison data, locales, or mentions. Full map: [SITE-OVERVIEW.md](./SITE-OVERVIEW.md).

## Update a comparison cell (summary / stance / sources)

1. Edit [`data/comparison/base.json`](../data/comparison/base.json) for stance/sources (language-agnostic).
2. Edit [`data/comparison/{lang}.json`](../data/comparison/) overlays for translated summaries/labels (`cellSummaries`, `topicLabels`, `partyNames`).
3. Assemble and verify:

```bash
pnpm assemble:comparison
pnpm verify:citations
pnpm verify:relevance
```

4. Emit public JSON (also runs on `pnpm build` / `pnpm dev`):

```bash
pnpm emit:comparison
```

5. Open a PR. CI runs lint, typecheck, i18n, content verify, and Cypress.

### Checklist

- [ ] Cell key `topicId::partyId` exists in base and overlays
- [ ] Quotes (if any) match the party program PDF; URLs/pages correct
- [ ] Spot-check the locale in the browser (SSR summary + interactive quotes)

## Update UI copy (hero, nav, legal, feedback)

1. Edit [`locales/en.json`](../locales/en.json) first (source of truth).
2. Update the same keys in other `locales/{lang}.json` files.
3. Run:

```bash
pnpm check:translation-completeness
pnpm check:translation-links
```

4. PR + spot-check `/de` and the language you changed.

## Update mentions

1. Edit [`data/mentions.json`](../data/mentions.json).
2. Ensure dates are ISO and links work.
3. PR; no assemble step required.

## After production deploy

- Optional: `pnpm indexnow:submit` (also runs from `.github/workflows/indexnow.yml` on push to `main` if enabled).
- Confirm PostHog live events if analytics changed.

## Post-election (after 2026-09-20)

See `ELECTION_DATE` in [`lib/seo/election.ts`](../lib/seo/election.ts).

- [ ] Freeze major comparison edits unless correcting errors
- [ ] Consider a site banner (“election was on …”) — implement when ready
- [ ] Re-check party program PDF URLs still resolve
- [ ] Decide archive vs keep updating for historical reference
