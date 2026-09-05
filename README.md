# Berlin 2026

Informational comparison of Berlin party positions for the **20 September 2026** Berlin state election (Wahl zum Abgeordnetenhaus).

Live domain: [www.berlin-2026.de](https://www.berlin-2026.de)

Languages: English, German, Russian.

## Stack

- Next.js 15 (App Router) + TypeScript + pnpm
- Tailwind CSS 4 + shadcn-style UI primitives
- Locale JSON in `locales/{en,de,ru}.json`
- Comparison dataset in `data/comparison.json`

## Develop

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/de` or negotiated language).

```bash
pnpm build
pnpm type-check
pnpm encode:comparison   # rebuild data/comparison.json from Notion scrapes (script paths)
```

## Deploy (Vercel)

1. Push this repo to GitHub (`mashazyu/berlin-2026`).
2. Import the repo in [Vercel](https://vercel.com) — Framework: Next.js, production branch: `main`.
3. Every merge/push to `main` deploys automatically.
4. Add domains `berlin-2026.de` and `www.berlin-2026.de`. Apex redirects to `www` via `next.config.ts`.

## Content notes

- Table cells are AI-assisted summaries of official party programs. Double-check what matters; full translations: [BerlinVote.Help](https://www.berlinvote.help/).
- Contact: nina.harz@pm.me
- Not affiliated with any party or the City of Berlin.
