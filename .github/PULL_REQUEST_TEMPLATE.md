## Summary

<!-- What changed and why -->

## Checklist

- [ ] `pnpm lint` / `pnpm type-check` pass (or rely on CI)
- [ ] Locale or comparison edits: `pnpm check:translation-completeness` and `pnpm check:translation-links`
- [ ] Comparison data edits: `pnpm assemble:comparison` then `pnpm verify:citations` (and `verify:relevance` if citations changed)
- [ ] No secrets in the diff (`.env*`, API keys)
- [ ] Preview looks correct for touched languages / pages

## Test plan

- [ ] Manual check on `/de` and at least one other locale if UI/copy changed
