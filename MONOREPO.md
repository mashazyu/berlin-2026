# Monorepo layout

Four Kompass sites share UI packages. Each site is served on **both** the apex host and its `www` host (same Vercel project, both domains attached).

| Hosts | App | Purpose | Status |
| --- | --- | --- | --- |
| `kompass.berlin`, `www.kompass.berlin` | `apps/www` | Kompass Kollektive (about us) | ready |
| `polit.kompass.berlin`, `www.polit.kompass.berlin` | `apps/polit` | Communal projects / guides | ready |
| `wasser.kompass.berlin`, `www.wasser.kompass.berlin` | `apps/wasser` | water4all copy | placeholder (move later) |
| `wahl.kompass.berlin`, `www.wahl.kompass.berlin` | `apps/wahl` | berlin-2026 election compass | ready in monorepo |
| `berlin-2026.de` (live today) | repo root `/` | same product as wahl | production until cutover |

```
/
  app/ components/ …     # LIVE berlin-2026.de (keep until cutover)
  apps/
    www/                 # Kompass Kollektive — port 3001
    polit/               # communal guides — port 3002
    wahl/                # election compass — port 3000
    wasser/              # water4all (later)
  packages/
    ui/                  # @kompass/ui
    landing/             # @kompass/landing
  scripts/vercel-should-build.sh
  pnpm-workspace.yaml
```

## Develop

```bash
pnpm install
pnpm dev                  # live root berlin (port 3000)
pnpm dev:wahl             # apps/wahl — port 3000
pnpm dev:www              # apps/www — port 3001
pnpm dev:polit            # apps/polit — port 3002
pnpm build:apps           # www + polit production builds
```

## Vercel (one project per app)

| Project | Root Directory | Domains | Ignored Build Step |
| --- | --- | --- | --- |
| berlin (live) | `/` (empty) | `berlin-2026.de`, `www.berlin-2026.de` | `bash scripts/vercel-should-build.sh app components lib locales data public scripts middleware.ts next.config.ts package.json` |
| www | `apps/www` | `kompass.berlin`, `www.kompass.berlin` | `bash scripts/vercel-should-build.sh apps/www packages/ui packages/landing` |
| polit | `apps/polit` | `polit.kompass.berlin`, `www.polit.kompass.berlin` | `bash scripts/vercel-should-build.sh apps/polit packages/ui packages/landing` |
| wahl | `apps/wahl` | `wahl.kompass.berlin`, `www.wahl.kompass.berlin` | `bash scripts/vercel-should-build.sh apps/wahl` |
| wasser | `apps/wasser` | `wasser.*` | after water4all move |

**Settings for each app project**

- Framework: Next.js  
- Install: `pnpm install` (from repo; Vercel uses Root Directory for build cwd)  
- Build: `pnpm build`  
- Production Branch: `main`  
- Attach **both** apex and `www` domains  
- Copy env vars for **wahl** from the live berlin project (www/polit need little/none)

**First deploy tip:** Creating a project does not always build. Use Deployments → Create Deployment on `main`, or push a commit. If Ignored Build Step skips the first run, clear it once, deploy, then re-enable.

## Cutover (wahl) — do later, deliberately

1. Confirm `apps/wahl` preview matches production berlin-2026.de.  
2. Point `wahl.kompass.berlin` (+ www) at the **wahl** Vercel project.  
3. Optionally move berlin-2026.de to the same project (or keep both).  
4. When root is unused: set live berlin project Root Directory to `apps/wahl`, or retire root deploy.  
5. Remove the duplicate root `app/` tree only after that is stable.

## Still later

- Move water4all → `apps/wasser`  
- Optionally stop maintaining the root Next app once wahl owns production
