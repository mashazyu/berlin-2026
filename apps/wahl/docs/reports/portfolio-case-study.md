# Berlin 2026 — portfolio case study

**Berlin 2026** is an independent, multilingual party-program comparison for the Berlin state election (Abgeordnetenhaus) on **20 September 2026**.  
Live: [www.berlin-2026.de](https://www.berlin-2026.de)

Numbers cited here are locked in [`_metrics-summary.md`](./_metrics-summary.md). Non-technical public story: [`public-project-story.md`](./public-project-story.md) ([PDF](../../public/reports/public-project-story.pdf)).

---

## 1. One-liner and role

> Side-by-side positions from official programs — **10 parties × 65 topics × 11 languages** — so Berliners (including internationals) can compare substance before voting. Not a Wahl-O-Mat. Not campaign material.

| Role | Person |
|------|--------|
| Content / program comparison / project development | **Nina** |
| Product, engineering, analytics, shipping | **Masha** |

Related civic work: [Water for All](https://www.water4all.com.de) (drinking-water atlas for Berlin).

---

## 2. Goals and constraints

**Goals**

- Make long German-only programs **comparable by topic**
- Reach language communities in Berlin (order of locales reflects community size after English)
- Keep a clear path back to **official PDFs / citations**
- Ship before election day with editorial honesty about AI assistance

**Constraints**

- Hard calendar: election **20 Sep 2026**, polls close **18:00**
- Privacy: cookieless PostHog (EU), no session replay, aggregated Vercel Analytics
- Quality bar: citation/relevance checks, i18n completeness, Cypress e2e, CI on PRs
- No party affiliation; public AI disclosure and Impressum/privacy

---

## 3. Solution

### Product

- Interactive comparison table with party filters and “current factions” / “all” presets  
- Topic groups (transport, housing, climate, migration, …) with expandable cells and source quotes  
- Feedback + in-page **text report** for corrections  
- Mentions section for earned Telegram / Substack / newsletter pickup  
- Flyer PDF for offline outreach  

### Stack and craft

- **Next.js 15** (App Router), TypeScript, Tailwind / shadcn, pnpm  
- Locale JSON + comparison overlays (`base.json` + per-language files → emitted public JSON)  
- SEO: hreflang, sitemap, OG images, JSON-LD, IndexNow  
- Deployed on **Vercel** at berlin-2026.de  

### Analytics (how to read the numbers)

**Vercel** covered reach from mid-July. **Topic / party / language product events** in PostHog were added around **~15 September**, once there was capacity — they were never the original MVP. That later layer is an **extra benefit**: it lets us say which topics people opened, not only that they visited. Lifetime Vercel totals and the richer PostHog window therefore answer slightly different questions.

---

## 4. Impact

### Lifetime reach (Vercel, Jul–Oct)

| Signal | Result |
|--------|--------|
| Visitors on `/[lang]` | **~4.3k** |
| Pageviews on `/[lang]` | **~6.1k** |
| Device mix | **~64% mobile** |
| Geography | Dominantly **Germany** |
| Top language homes | **en** (1.8k) · **ru** (1.6k) · **de** (1.0k), then ar/es/uk/… |

Organic acquisition: Google first; **Substack second**; DuckDuckGo, Bing, Ecosia, Telegram, ChatGPT, and 20percent.berlin also appear — consistent with newsletter/Telegram distribution, not ads.

### Earned publications (9, all pre-election)

Local Telegram channels, Substack, and newsletters (10–17 Sep): Volna/Berlin, Bundeskanzler, Berlin Events, The Berlin Life, Handpicked, 20 Percent Berlin, Zerna Radosti, Russischsprachige Linke, Goose Expat. Full table in the metrics summary.

### Time on site (proud metric)

People stayed long enough to actually compare programs. We lead with **median** and a **5%/5% trimmed mean** (middle 90%), so idle-tab outliers do not dominate while long real reading stays in the data.

| | Before end of elections | After end of elections | All instrumented |
|--|--------------|-------------|------------------|
| **Median time on site** | **4m 18s** | **2m 56s** | **3m 58s** |
| **Trimmed mean 5%/5%** | **7m 41s** | **5m 17s** | **7m 10s** |
| Share **> 2 minutes** | **69%** | **59%** | **67%** |
| Share **> 5 minutes** | 46% | 37% | 44% |
| Share **> 15 minutes** | 22% | 13% | 20% |
| **Median time reading a topic** | **0m 32s** | **0m 17s** | **0m 28s** |
| **Trimmed mean topic time** | **0m 41s** | **0m 24s** | **0m 37s** |

Among visitors who used the comparison table: a **typical** visit before end of elections ~**4 minutes**, robust average ~**7–8 minutes**, **~70%** over two minutes, **~½ minute** per topic. Method: [`_metrics-summary.md`](./_metrics-summary.md).

### Before vs after end of elections (PostHog, split at 20 Sep 18:00)

| | Before end of elections | After end of elections |
|--|--------------|-------------|
| Pageviews | 1,985 | 739 |
| Topics opened | 5,898 | 1,680 |
| Party toggles | 2,304 | 631 |
| Program / citation clicks | 164 | 38 |

Instrumented daily uniques peaked **17 Sep (612)** — same day as three Telegram mentions — and **election day (486)**. After polls closed, traffic cooled but **did not stop**: hundreds of unique-visitor-days and **1,680 topic opens** after 18:00 on election day through mid-October. We had assumed the project would effectively die once voting ended; continued visits were a pleasant surprise.

### What people cared about

This view exists because topic-open events were added when capacity allowed. Transport and housing led (A100, U-Bahn, rent/Mietendeckel, Tempelhofer Feld); migration and climate followed. Users often widened the party set (“show all”), not only current parliamentary factions.

### Search

Google ~**275** clicks / **7.3k** impressions in the export window (peak election day); Bing ~**113** clicks / **4.1k** impressions. Landing pages span multiple language prefixes — the i18n investment showed up in search, not only in UI switching.

---

## 5. Process highlights

1. **Content pipeline** — Official PDFs → structured comparison → per-language overlays; verify citations/relevance in CI.  
2. **Ship the comparison; add topic analytics when capacity allowed** — Reach was already measurable on Vercel; product events later unlocked topic/party/language stories as a bonus, including a readable post-election afterlife.  
3. **Distribution** — Flyer + community channels beat cold SEO alone in the final two weeks; Substack/Telegram referrers prove it.  
4. **Trust UX** — AI disclosure, source links, and correction flows are part of the product, not footnotes.  
5. **Monorepo trajectory** — Same product prepared under Kompass (`apps/wahl`) with a collective hub (`apps/www`); berlin-2026.de remained the live election surface for this cycle.

---

## 6. Learnings and next

**Reuse**

- Optional product-event layer (`topic_open`, `party_*`, `program_link`, `ui_language`) that turns traffic into civic insight when you have room for it  
- Cookieless analytics that still support a case study  
- Multilingual SEO + comparison data split for performance  
- Earned-media section fed from structured publication data  

**Worth considering next time**

- Date-filterable traffic exports for clean poll-close cuts on the reach layer  
- Lightweight feedback metrics (volume/themes)  
- Planning for a short **post-election** window — people may keep using the comparison even when you expect the site to go quiet  

**After the election**

Interest continued longer than expected; freeze/update policy still follows the content runbook. Sister projects (Polit Kompass, Water for All, Kompass hub) carry the broader civic-tech practice forward.

---

## Snapshot for a CV / portfolio blurb

Built and shipped a privacy-respecting, 11-language election comparison used by **thousands of visitors** (majority mobile), with strong **RU/EN/DE** usage, organic **Substack/Telegram** distribution, **~4 min median** / **~7–8 min trimmed-mean** time on site among comparison users before poll close (**~70%** stayed over 2 min), **~½ min per topic**, **~5.9k topic opens** before poll close — and surprising continued use afterward.
