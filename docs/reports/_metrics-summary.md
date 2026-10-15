# Berlin 2026 — locked metrics summary

Shared numbers for [`civic-tech-evaluation.md`](./civic-tech-evaluation.md) and [`portfolio-case-study.md`](./portfolio-case-study.md).  
Exports analysed: [`stats/`](../../stats/) (snapshot dated 14 Oct 2026). Election poll close: **20 Sep 2026, 18:00 Europe/Berlin**.

## Instrumentation timeline

| Layer | Coverage in exports | Role |
|--------|---------------------|------|
| **Vercel Web Analytics** | 14 Jul – 14 Oct 2026 | Lifetime **reach** (visitors, pages, referrers, devices). Visits began before advanced product analytics. |
| **Google / Bing Search** | ~3 Sep – 11 Oct 2026 (charts); keyword aggregates | Discovery / search interest |
| **PostHog (product events, cookieless)** | **15 Sep 22:20** – **14 Oct 01:26** Europe/Berlin | **Engagement detail** added when capacity allowed: pageviews, `topic_open`, `party_toggle`, `party_preset`, `program_link`, `ui_language` |

PostHog’s first product events are **not** site launch — visits already existed on Vercel. Topic/party interest data is an **additional benefit** from later instrumentation, not something that was missing from the original plan. Topic-level detail before ~15 Sep is simply out of scope for that layer.

## Time windows

| Window | Definition | What can be split |
|--------|------------|-------------------|
| **Pre-close** | Activity ≤ **2026-09-20 18:00** Europe/Berlin | PostHog events only (instrumented from ~15 Sep) |
| **Post-close** | After poll close → end of exports (~13–14 Oct) | PostHog events (continued use was unexpected; team had assumed demand would stop at election end) |
| **All-period** | Full Vercel / SEO export ranges | Vercel + Search Console / Bing aggregates (not 18:00-splitable in current CSVs) |

Label PostHog Pre-close as **instrumented pre-close**, not “full campaign engagement.”

---

## Lifetime reach (Vercel, all-period)

Source: `stats/vercel/*` (14 Jul – 14 Oct 2026).

| Metric | Value |
|--------|-------|
| Visitors on home route template `/[lang]` | **4,255** |
| Pageviews on `/[lang]` | **6,076** |
| Mobile / desktop / tablet visitors | **2,776** / **1,519** / **22** (~64% mobile) |
| Top country | **DE** 3,624 visitors (US 139, NL 44, GB 42, …) |
| Top browsers | Mobile Safari 1,373; Chrome 991; Chrome Mobile 785 |

### Language (Vercel top home paths)

Visitors are per path (not mutually exclusive across languages):

| Path | Visitors | Pageviews |
|------|----------|-----------|
| `/en` | 1,766 | 2,256 |
| `/ru` | 1,575 | 1,997 |
| `/de` | 958 | 1,245 |
| `/ar` | 119 | 162 |
| `/es` | 82 | 108 |
| `/uk` | 53 | 77 |
| `/it` | 50 | 73 |
| `/pl` | 44 | 60 |
| `/tr` | 32 | 43 |
| `/ku` | 17 | 28 |
| `/vi` | 16 | 27 |

### Top referrers (Vercel)

| Referrer | Visitors |
|----------|----------|
| google.com | 361 |
| substack.com | 306 |
| duckduckgo.com | 120 |
| bing.com | 106 |
| ecosia.org | 79 |
| org.telegram.messenger / web.telegram.org | 19 + 19 |
| chatgpt.com | 23 |
| 20percent.berlin | 12 |

---

## Instrumented engagement (PostHog)

Source: `stats/posthog/export-2026-10-14-082324.csv`. Cutoff: 20 Sep 2026 18:00 Europe/Berlin.

### Event counts

| Event | Pre-close | Post-close | All instrumented |
|-------|-----------|------------|------------------|
| `$pageview` | 1,985 | 739 | 2,724 |
| `topic_open` | 5,898 | 1,680 | 7,578 |
| `party_toggle` | 2,304 | 631 | 2,935 |
| `party_preset` | 183 | 37 | 220 |
| `program_link` | 164 | 38 | 202 |
| Distinct `$device_id` (any product-related events) | 1,829 | 814 | — |
| Distinct `$device_id` with `$pageview` | 1,628 | 657 | — |

Approx. **topic opens per pageview**: Pre-close **~3.0**; Post-close **~2.3**.  
**Program / citation link-outs**: Pre-close **164** (100 citation, 33 program_header, 31 program); Post-close **38**.

### Daily unique visitors (PostHog web analytics chart)

Source: `stats/posthog/web-analytics-GRAPHS.csv` (calendar days; Sep 20 is a full calendar day, not split at 18:00).

| Period | Unique visitors (sum of daily uniques; not distinct across days) |
|--------|------------------------------------------------------------------|
| 15–19 Sep | 1,276 |
| 20 Sep (election day) | 486 |
| 21–30 Sep | 423 |
| 1–13 Oct | 96 |

Peak instrumented days: **17 Sep (612)**, **20 Sep (486)**, **19 Sep (277)**.

### Pageview language (`ui_language`)

| Lang | Pre-close | Post-close |
|------|-----------|------------|
| ru | 813 | 219 |
| en | 649 | 213 |
| de | 391 | 251 |
| es | 45 | 12 |
| it | 34 | 14 |
| ar | 20 | 6 |
| uk | 17 | 3 |
| tr | 11 | 6 |
| pl | 2 | 9 |
| vi | 3 | 4 |
| ku | — | 2 |

Pre-close mix is dominated by **ru / en / de**; post-close **de** rises relative to en/ru.

### Topic groups (`topic_open`)

| Group | Pre-close | Post-close |
|-------|-----------|------------|
| transport | 1,313 | 293 |
| housing | 951 | 326 |
| climate_energy | 679 | 164 |
| migration | 511 | 156 |
| education | 433 | 128 |
| democracy | 390 | 109 |
| security | 357 | 138 |
| economy | 316 | 113 |
| society | 291 | 90 |
| waste | 274 | 66 |
| health | 266 | 65 |
| animals | 117 | 32 |

### Top topics (pre-close)

1. a100-construction (465)  
2. migration-admission-and-deportations (250)  
3. new-u-bahn-construction-line-extensions (229)  
4. road-construction (221)  
5. cycling-infrastructure (199)  
6. housing-rent-regulation-mietendeckel (197)  
7. tempelhofer-feld-development-edge-development (170)  

Post-close top topics stay similar (A100, migration, rent, U-Bahn, Tempelhofer Feld) with housing topics slightly more prominent.

### Party toggles (pre-close top)

afd 319, fdp 317, cdu 281, volt 261, linke 249, spd 233, gruene 210, bsw 204, tierschutz 123, oedp 107  

(Post-close: linke/cdu/afd/gruene/spd lead; smaller parties drop more.)

### Presets

Pre-close: `all` 119, `current_factions` 64. Post-close: `all` 23, `current_factions` 14.

### Device (PostHog `$pageview`)

Pre-close: Mobile 1,347 / Desktop 629 / Tablet 9.  
Post-close: Mobile 439 / Desktop 298 / Tablet 2.

---

## Search discovery (all-period)

### Google Search Console

Zip: `stats/seo/google/berlin-2026.de-Performance-on-Search-2026-10-14.zip` (Web, ~3 months).

| Metric | Value |
|--------|-------|
| Clicks (chart sum) | **275** |
| Impressions | **7,332** |
| Peak click day | **20 Sep** — 86 clicks / 1,686 impressions |
| Next peaks | 19 Sep (53), 14 Sep (22), 21 Sep (15) |

Top pages by clicks: `/en` 125, `/de` 77, `/ru` 20, `/it` 16, `/pl` 11, `/ar` 9.  
Device clicks: Mobile 179, Desktop 92, Tablet 4.  
Queries are sparse at click level; intent clusters around *Wahlprogramme / Vergleich / Berlin 2026* (DE/EN) plus RU/PL queries.

Google AI performance overview (`AIPerformanceOverviewStats`): citations reported as **0** in the exported range.

### Bing Webmaster

| Metric | Value |
|--------|-------|
| Clicks (daily overview sum) | **113** |
| Impressions | **4,069** |
| Notable keyword | `berlin wahl 2026 programmvergleich` — 2,159 impressions, 14 clicks |
| AI grounding sample | `parteien berlin` — 35 citations (21.21% citation share) in AI Search Queries report |

---

## Publications / outreach

Canonical list: [`data/mentions.json`](../../data/mentions.json) + locale `mentionSummaries`. All dated **before poll close**.

| Date | Source | Kind | URL |
|------|--------|------|-----|
| 2026-09-10 | Volna / Berlin | Telegram | https://t.me/berlinwelle/2782 |
| 2026-09-11 | Bundeskanzler | Telegram | https://t.me/bundeskanzlerRU/2386 |
| 2026-09-14 | Berlin Events Weekly | Substack | https://open.substack.com/pub/berlinevents/p/berlin-events-guide-sep-1521-get |
| 2026-09-14 | The Berlin Life | Substack | https://theberlinlife.substack.com/p/berlin-election-2026-who-can-vote |
| 2026-09-14 | Handpicked Berlin | Newsletter | https://newsletter.handpickedberlin.com/p/211-who-you-gon-call-vote-for |
| 2026-09-15 | 20 Percent Berlin | Substack | https://www.20percent.berlin/p/528-election-fever-berliners-pro |
| 2026-09-17 | Zerna Radosti | Telegram | https://t.me/zernaradosti/1413 |
| 2026-09-17 | Russischsprachige Linke | Telegram | https://t.me/RussischsprachigeLinke/321 |
| 2026-09-17 | Goose Expat | Telegram | https://t.me/goose_expat/2098 |

**9** publications: 5 Telegram, 3 Substack, 1 newsletter.  
Aligns with Vercel referrers (substack.com #2; Telegram app/web present; 20percent.berlin) and PostHog spike on **17 Sep** (three Telegram posts that day).

---

## Product facts (repo)

| Fact | Value |
|------|-------|
| Live site | https://www.berlin-2026.de |
| Election | Abgeordnetenhaus Berlin, **20 Sep 2026** |
| Scope | **10** parties × **66** topics in **12** groups |
| Languages | en, de, tr, ku, vi, pl, ru, uk, ar, es, it |
| Positioning | Independent comparison; **not** voting advice; AI-assisted summaries with human editorial responsibility |
| Creators | Nina (content / programs); Masha (product / engineering) |
| Privacy analytics | PostHog EU, cookieless; Vercel Analytics aggregated |

---

## Gaps / caveats

- No feedback / text-report volume in exports.  
- Vercel and SEO CSVs are **not** split at 18:00.  
- PostHog daily uniques are **calendar days**; election-day 486 includes both before and after 18:00.  
- Cookieless mode and blocked analytics understate true use; topic-level events cover ~15 Sep onward (added when capacity allowed).  
- Distinct `$device_id` is a privacy-preserving proxy, not a person count.
