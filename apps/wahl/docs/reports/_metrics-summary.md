# Berlin 2026 — locked metrics summary

Shared numbers for [`portfolio-case-study.md`](./portfolio-case-study.md) and the public story [`public-project-story.md`](./public-project-story.md).  
Exports analysed: local `stats/` snapshot (14 Oct 2026; not committed — see [README](./README.md)). **End of elections:** **20 Sep 2026, 18:00 Europe/Berlin**.

Charts: from `apps/wahl`, run `python3 scripts/generate-report-charts.py` → [`charts/`](./charts/).

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
| **Before end of elections** | Activity ≤ **2026-09-20 18:00** Europe/Berlin | PostHog events only (instrumented from ~15 Sep) |
| **After end of elections** | After poll close → end of exports (~13–14 Oct) | PostHog events (continued use was unexpected; team had assumed demand would stop at election end) |
| **All-period** | Full Vercel / SEO export ranges | Vercel + Search Console / Bing aggregates (not 18:00-splitable in current CSVs) |

Label the PostHog “before” window as **instrumented before end of elections**, not “full campaign engagement.”

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

### Language paths (Vercel, all-period)

Visitors are per path (not mutually exclusive across languages). **Not** split by election end — use the PostHog language section below for before/after.

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

### Traffic sources (Vercel)

Merged app/web hosts (e.g. `com.google.android.gm` → Google; Telegram app + `web.telegram.org` → Telegram). **Direct** = `/[lang]` visitors minus attributed referrers.

| Source | Visitors | Share of `/[lang]` |
|--------|----------|--------------------|
| Direct | 3,027 | 71% |
| Google | 394 | 9% |
| Substack | 329 | 8% |
| DuckDuckGo | 123 | 3% |
| bing.com | 106 | 2% |
| ecosia.org | 79 | 2% |
| Telegram | 44 | 1% |
| Other (incl. Facebook, ChatGPT, …) | 153 | 4% |

---

## Instrumented engagement (PostHog)

Source: `stats/posthog/export-2026-10-14-082324.csv`. Cutoff: **end of elections** 20 Sep 2026 18:00 Europe/Berlin.

### Weekly visits (Vercel)

Source: local `stats/vercel/visits-by-week.json` (Web Analytics API, `by=week`). Weeks with zero traffic before September omitted.

| Week (Mon–Sun) | Visitors | Pageviews |
|----------------|----------|-----------|
| 7.9–13.9 | 959 | 1,558 |
| 14.9–20.9 (contains end of elections) | **2,688** | **3,953** |
| 21.9–27.9 | 466 | 594 |
| 28.9–4.10 | 102 | 121 |
| 5.10–11.10 | 87 | 95 |
| 12.10–18.10 | 53 | 66 |

Visitor counts are **per week** (not additive unique users across weeks). Peak week is **14.9–20.9**, spanning election day / end of voting.

### Time on site and time with topics (highlight)

Derived from PostHog `$session_id` (or `$device_id` fallback) and `topic_open` timestamps in the instrumented window.

Session length is right-skewed (idle tabs pull a raw average up). We therefore report **median** (typical visit) and a **5%/5% trimmed mean** (average of the middle 90% after dropping the shortest and longest 5%). Long real reading sessions are kept; only a **4 hour** sanity bound removes impossible spans (none in this export).

**Method**

| Metric | Definition |
|--------|------------|
| **Time on site** | Last − first event in a session with at least one product event (`topic_open` / `party_*` / `program_link`); duration **> 0** and **≤ 4 hours** |
| **Topic reading time** | Gap from one `topic_open` to the **next** `topic_open` (**excludes** last topic in a session); dwell **> 0** and **≤ 30 minutes** |
| **How we report** | **Median** + IQR; **trimmed mean 5%/5%**; share of sessions longer than 2 / 5 / 15 minutes |

These remain **proxies** (no dedicated dwell timer was shipped).

#### Time on site (product-engaged sessions)

![Time on site before vs after end of elections](./charts/time-on-site.svg)

| Window | n | **Median** | IQR (p25–p75) | **Trimmed mean 5%/5%** | Share > 2 min | Share > 5 min | Share > 15 min |
|--------|---|------------|---------------|------------------------|---------------|---------------|----------------|
| All instrumented | 1,168 | **3m 58s** | 1m 17s – 10m 56s | **7m 10s** | **67%** | 44% | 20% |
| Before end of elections | 935 | **4m 18s** | 1m 22s – 12m 28s | **7m 41s** | **69%** | 46% | 22% |
| After end of elections | 233 | **2m 56s** | 1m 05s – 7m 19s | **5m 17s** | **59%** | 37% | 13% |

#### Time reading a topic (topic→next topic, excl. last-in-session)

| Window | n | **Median** | IQR | **Trimmed mean 5%/5%** |
|--------|---|------------|-----|------------------------|
| All instrumented | 6,699 | **0m 28s** | 0m 13s – 0m 56s | **0m 37s** |
| Before end of elections | 5,186 | **0m 32s** | 0m 16s – 1m 02s | **0m 41s** |
| After end of elections | 1,513 | **0m 17s** | 0m 09s – 0m 34s | **0m 24s** |

Headline takeaway: among people who used the comparison, a **typical** visit before end of elections lasted about **4 minutes** (median), with a robust average around **7–8 minutes** (trimmed mean); **~70%** stayed over **2 minutes**, and a typical topic dwell was about **half a minute**.

### Event counts

| Event | Before end of elections | After end of elections | All instrumented |
|-------|-------------------------|------------------------|------------------|
| `$pageview` | 1,985 | 739 | 2,724 |
| `topic_open` | 5,898 | 1,680 | 7,578 |
| `party_toggle` | 2,304 | 631 | 2,935 |
| `party_preset` | 183 | 37 | 220 |
| `program_link` | 164 | 38 | 202 |
| Distinct `$device_id` (any product-related events) | 1,829 | 814 | — |
| Distinct `$device_id` with `$pageview` | 1,628 | 657 | — |

Approx. **topic opens per pageview**: before **~3.0**; after **~2.3**.  
**Program / citation link-outs**: before **164** (100 citation, 33 program_header, 31 program); after **38**.

### Daily unique visitors

Source: `stats/posthog/web-analytics-GRAPHS.csv` (calendar days; 20 Sep is a full calendar day, not split at 18:00).

![Daily unique visitors](./charts/daily-uniques.svg)

| Period | Unique visitors (sum of daily uniques; not distinct across days) |
|--------|------------------------------------------------------------------|
| 15–19 Sep | 1,276 |
| 20 Sep (election day) | 486 |
| 21–30 Sep | 423 |
| 1–13 Oct | 96 |

Peak instrumented days: **17 Sep (612)**, **20 Sep (486)**, **19 Sep (277)**.

### Visitors by language — before vs after end of elections

PostHog distinct `$device_id` on `$pageview` by `ui_language` (split at 20 Sep 18:00). Vercel paths above remain lifetime only.

![Visitors by language before vs after end of elections](./charts/languages-before-after.svg)

Chart shows the **top 5** languages plus other; full counts below.

| Lang | Before end of elections | After end of elections |
|------|-------------------------|------------------------|
| ru | 709 | 191 |
| en | 534 | 187 |
| de | 322 | 235 |
| es | 36 | 11 |
| it | 24 | 11 |
| ar | 19 | 6 |
| uk | 15 | 3 |
| tr | 10 | 6 |
| pl | 2 | 9 |
| vi | 2 | 3 |
| ku | — | 2 |

Before end of elections: **ru / en / de** dominate. After end of elections: **de** rises relative to en/ru.

### Topic groups (`topic_open`)

![Topics by group before vs after end of elections](./charts/topic-groups.svg)

Chart shows the **top 5** groups; full counts below.

| Group | Before end of elections | After end of elections |
|-------|-------------------------|------------------------|
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

### Top topics (before end of elections)

1. a100-construction (465)  
2. migration-admission-and-deportations (250)  
3. new-u-bahn-construction-line-extensions (229)  
4. road-construction (221)  
5. cycling-infrastructure (199)  
6. housing-rent-regulation-mietendeckel (197)  
7. tempelhofer-feld-development-edge-development (170)  

After end of elections, top topics stay similar (A100, migration, rent, U-Bahn, Tempelhofer Feld) with housing slightly more prominent.

### Party toggles (before end of elections, top)

afd 319, fdp 317, cdu 281, volt 261, linke 249, spd 233, gruene 210, bsw 204, tierschutz 123, oedp 107  

(After end of elections: linke/cdu/afd/gruene/spd lead; smaller parties drop more.)

### Presets

Before end of elections: `all` 119, `current_factions` 64. After end of elections: `all` 23, `current_factions` 14.

### Device (PostHog `$pageview`)

Before end of elections: Mobile 1,347 / Desktop 629 / Tablet 9.  
After end of elections: Mobile 439 / Desktop 298 / Tablet 2.

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

Canonical list: [`data/mentions.json`](../../data/mentions.json) + locale `mentionSummaries`. All dated **before end of elections**.

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
- Vercel and SEO CSVs are **not** split at end of elections (18:00).  
- PostHog daily uniques are **calendar days**; election-day 486 includes both before and after 18:00.  
- Cookieless mode and blocked analytics understate true use; topic-level events cover ~15 Sep onward (added when capacity allowed).  
- Distinct `$device_id` is a privacy-preserving proxy, not a person count.
