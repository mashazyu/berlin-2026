# Party program PDF fixtures

Local copies of each party’s Wahlprogramm used by `scripts/verify-citations.py`.
**No network access** — CI and local verify only read these files.

| File | Party |
| --- | --- |
| `afd.pdf` | AfD |
| `bsw.pdf` | BSW |
| `cdu.pdf` | CDU |
| `fdp.pdf` | FDP |
| `gruene.pdf` | Grüne |
| `linke.pdf` | Linke |
| `oedp.pdf` | ÖDP |
| `spd.pdf` | SPD |
| `tierschutz.pdf` | Tierschutzpartei |
| `volt.pdf` | Volt |

When a party publishes a new program PDF:

1. Download it yourself (browser).
2. Replace `scripts/fixtures/pdfs/{partyId}.pdf`.
3. Update `programUrl` in `data/comparison/base.json` if the public URL changed.
4. Run `pnpm assemble:comparison && pnpm verify:citations` (use `--force-extract` via the Python script if page text was cached).
