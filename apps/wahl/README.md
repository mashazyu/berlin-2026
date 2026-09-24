# apps/wahl → wahl.kompass.berlin

Cutover target for the live Berlin election compass (today: repo root / berlin-2026.de).

Do **not** point the live Vercel project here until cutover.

## When to populate

1. Copy the live root Next app into this folder.
2. Depend on `@kompass/ui` (+ shared pieces as needed).
3. Deploy as a **preview** only; compare with production.
4. Cutover: set Vercel Root Directory to `apps/wahl` for `wahl.kompass.berlin`, then remove the old root app tree.

Until then this directory is intentionally a placeholder.
