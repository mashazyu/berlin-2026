# apps/wahl

**Hosts:** `wahl.kompass.berlin`, `www.wahl.kompass.berlin`

Cutover target for a copy of the live Berlin election site (today: repo root / berlin-2026.de).

Do **not** point these domains here until cutover.

## When to populate

1. Copy the live root Next app into this folder.
2. Depend on `@kompass/ui` (+ shared pieces as needed).
3. Deploy as a **preview** only; compare with production.
4. Cutover: set Vercel Root Directory to `apps/wahl`, attach both hosts, then remove the old root app tree.

Until then this directory is intentionally a placeholder.
