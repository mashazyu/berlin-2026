# Monorepo layout

Four Kompass sites share UI packages. Production **wahl** (berlin-2026) still lives at the **repository root** and deploys from Vercel Root `/` until cutover to `apps/wahl`.

| Domain | App | Status |
| --- | --- | --- |
| [kompass.berlin](https://kompass.berlin) | `apps/www` | scaffold (creators / hub) |
| [polit.kompass.berlin](https://polit.kompass.berlin) | `apps/polit` | scaffold (Beteiligung) |
| [wahl.kompass.berlin](https://wahl.kompass.berlin) | `apps/wahl` | cutover placeholder; live app still at repo root |
| [water.kompass.berlin](https://water.kompass.berlin) | `apps/water` | placeholder for water4all move |

```
/
  app/ components/ …     # LIVE wahl (do not move yet)
  apps/
    www/                 # kompass.berlin — creators — port 3001
    polit/               # polit.kompass.berlin — Beteiligung — port 3002
    wahl/                # wahl.kompass.berlin — cutover target
    water/               # water.kompass.berlin — water4all (later)
  packages/
    ui/                  # @kompass/ui — shadcn + base.css (no brand hues)
    landing/             # @kompass/landing — shell, Hero, Mentions, Header/Footer
  pnpm-workspace.yaml
```

## Develop

```bash
pnpm install
pnpm --filter berlin-2026 dev   # live wahl at repo root, port 3000
pnpm --filter @kompass/www dev  # port 3001
pnpm --filter @kompass/polit dev # port 3002
```

## Vercel

| Site | Root Directory |
| --- | --- |
| wahl (production today) | `/` until cutover |
| www | `apps/www` |
| polit | `apps/polit` |
| water | `apps/water` (after move) |
| wahl (after cutover) | `apps/wahl` |

Use Ignored Build Step / monorepo filters so a change in one app does not rebuild the others.
