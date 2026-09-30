# apps/wahl

**Hosts:** `wahl.kompass.berlin`, `www.wahl.kompass.berlin`

Full copy of the berlin-2026 election compass. Live production still deploys from the **repo root** until cutover (see [MONOREPO.md](../../MONOREPO.md)).

```bash
pnpm --filter @kompass/wahl dev    # port 3000
pnpm --filter @kompass/wahl build
```

Copy env from the live berlin Vercel project into the wahl project (Turnstile, Resend, PostHog, etc.).

Vercel: Root Directory `apps/wahl`, Ignored Build Step:

```bash
bash scripts/vercel-should-build.sh apps/wahl
```
