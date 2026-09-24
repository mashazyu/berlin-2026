# apps/wahl

**Hosts:** `wahl.kompass.berlin`, `www.wahl.kompass.berlin`

Copy of the berlin-2026 election compass (same codebase as the live app still at repo root until Vercel cutover).

```bash
pnpm --filter @kompass/wahl dev    # port 3000
pnpm --filter @kompass/wahl build
```

Copy `.env.example` → `.env.local` in this folder for local secrets.

## Cutover

1. Preview this app on Vercel (Root Directory `apps/wahl`).
2. Attach both hosts; switch traffic when ready.
3. Remove the duplicate root app tree once production points here.
