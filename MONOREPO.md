# Monorepo layout

Four Kompass sites share UI packages. Each site is served on **both** the apex host and its `www` host (same Vercel project, both domains attached).

| Hosts | App | Purpose | Status |
| --- | --- | --- | --- |
| `kompass.berlin`, `www.kompass.berlin` | `apps/www` | About us | scaffold |
| `polit.kompass.berlin`, `www.polit.kompass.berlin` | `apps/polit` | Communal projects | scaffold |
| `wasser.kompass.berlin`, `www.wasser.kompass.berlin` | `apps/wasser` | Copy of water4all | placeholder |
| `wahl.kompass.berlin`, `www.wahl.kompass.berlin` | `apps/wahl` | Copy of berlin-2026 | full copy in monorepo; root still deploys production until cutover |

```
/
  app/ components/ …     # LIVE berlin-2026.de (do not remove until cutover)
  apps/
    www/                 # about us — port 3001
    polit/               # communal projects — port 3002
    wahl/                # berlin-2026 copy — port 3000
    wasser/              # water4all move target
  packages/
    ui/                  # @kompass/ui — shadcn + base.css (no brand hues)
    landing/             # @kompass/landing — shell, Hero, Mentions, Header/Footer
  pnpm-workspace.yaml
```

## Develop

```bash
pnpm install
pnpm --filter @kompass/wahl dev   # wahl.kompass.berlin + www.wahl.kompass.berlin — port 3000
pnpm --filter @kompass/www dev    # kompass.berlin + www.kompass.berlin — port 3001
pnpm --filter @kompass/polit dev  # polit.kompass.berlin + www.polit.kompass.berlin — port 3002
# after water4all move:
# pnpm --filter @kompass/wasser dev  # wasser.kompass.berlin + www.wasser.kompass.berlin
```

## Domains (Vercel)

Attach **both** hostnames to the same project for each app:

| Project | Root Directory | Domains |
| --- | --- | --- |
| www | `apps/www` | `kompass.berlin`, `www.kompass.berlin` |
| polit | `apps/polit` | `polit.kompass.berlin`, `www.polit.kompass.berlin` |
| wasser | `apps/wasser` | `wasser.kompass.berlin`, `www.wasser.kompass.berlin` (after water4all move) |
| wahl (preview / after cutover) | `apps/wahl` | `wahl.kompass.berlin`, `www.wahl.kompass.berlin` |
| wahl (production today) | `/` | current berlin-2026.de until cutover |

Use Ignored Build Step / monorepo filters so a change in one app does not rebuild the others.
