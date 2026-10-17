# Berlin 2026 — civic-tech evaluation

Independent multilingual comparison of party programs for the Berlin Abgeordnetenhaus election of **20 September 2026**.  
Live site: [www.berlin-2026.de](https://www.berlin-2026.de).

This document evaluates the project as a **civic information intervention**: problem, design, measurement approach, observed reach and use, and limits. Shared quantitative detail lives in [`_metrics-summary.md`](./_metrics-summary.md). For a non-technical public version, see [`public-project-story.md`](./public-project-story.md) ([PDF](./public-project-story.pdf)).

---

## 1. Problem and civic context

Berlin elects its state parliament every five years. Official party programs are published **only in German** and often run to roughly **200 pages**. About **16%** of German citizens in Berlin come from immigrant families; long monolingual programs are a barrier even for many native speakers.

Existing aids (notably [Wahl-O-Mat](https://www.wahl-o-mat.de/berlin2026/app/main_app.html)) support preference matching, but are not built for **deep, topic-by-topic comparison** of program text. Rhetoric and concrete commitments are hard to separate without side-by-side structure and sources.

**Civic goal:** make program substance comparable across parties and accessible in languages used in Berlin — without prescribing a vote.

---

## 2. Intervention

**Berlin 2026** presents positions of the **10** most prominent parties on **66** topics in **12** policy groups (transport, housing, climate/energy, migration, education, security, etc.), drawn from official programs.

| Design choice | Rationale |
|---------------|-----------|
| Side-by-side table, not a quiz | Supports exploratory comparison rather than a single “match” score |
| 11 UI languages | Reach internationals and language communities (en, de, tr, ku, vi, pl, ru, uk, ar, es, it) |
| Citations / program links | Encourage verification against primary sources |
| AI-assisted drafting + disclosure | Scale summarisation; keep editorial responsibility human ([AI disclosure](https://www.berlin-2026.de/en/ai-disclosure)) |
| Explicit “not voting advice” framing | Reduce misuse as campaign material |
| Cookieless PostHog (EU) + aggregated Vercel Analytics | Measure use under a privacy-first constraint |

Creators: **Nina** (program comparison / content), **Masha** (product / engineering). Sister civic work includes Water for All.

---

## 3. Evaluation design

### 3.1 What we measure (and what we do not)

| We treat as evidence of… | Metric family |
|--------------------------|---------------|
| Reach / attention | Vercel visitors & pages; search clicks/impressions; publications |
| Exploratory use | `topic_open`, `party_toggle`, `party_preset` |
| Verification behaviour | `program_link` (citation / program) |
| Language access | Path + `ui_language` |

We **do not** claim effects on vote choice, turnout, or knowledge gains. There was no survey or A/B experiment.

### 3.2 Dual instrumentation

1. **Vercel (from mid-July 2026):** lifetime traffic and basic reach.  
2. **PostHog product events (from ~15 Sep 2026):** added once capacity allowed — an **extra layer** beyond the original plan, not a late fix for a missing requirement. These events make topic interest, party filtering, language of use, and program link-outs visible, and allow a clean split at poll close.

The project was scoped first around shipping the comparison itself. Detailed “what topics do people open?” analytics was a later benefit when there was room to instrument it.

### 3.3 Primary contrast: before vs after end of elections

**End of elections:** 20 Sep 2026, **18:00 Europe/Berlin**.

| Window | Civic interpretation |
|--------|----------------------|
| **Before end of elections** (rich events from ~15 Sep) | Decision-period exploration |
| **After end of elections** | Continued visits after voting — **unexpected** relative to the assumption that demand would stop at poll close |

The team expected the site’s role to end with the election. Traffic and topic opens **after end of elections** show that people still returned to compare programs afterward.

Vercel and SEO exports in this snapshot are **all-period** and cannot be split at 18:00; they contextualise lifetime reach and search discovery only.

---

## 4. Reach

### 4.1 Lifetime traffic (Vercel)

On the main comparison route `/[lang]`: **~4,255 visitors** and **~6,076 pageviews** (14 Jul – 14 Oct). Traffic is **majority mobile** (~64% of device visitors). Geography is overwhelmingly **Germany**.

Language paths show strong use of **English and Russian** homes alongside German — consistent with an international / Russophone audience, not only DE-first users:

- `/en` 1,766 visitors · `/ru` 1,575 · `/de` 958 · then ar, es, uk, it, pl, tr, ku, vi.

### 4.2 Community dissemination (publications)

Nine earned mentions (10–17 Sep), all **before** poll close — Telegram channels, Substack, and a local newsletter ([`data/mentions.json`](../../data/mentions.json)):

Volna/Berlin, Bundeskanzler (RU), Berlin Events Weekly, The Berlin Life, Handpicked Berlin, 20 Percent Berlin, Zerna Radosti, Russischsprachige Linke, Goose Expat.

This matches referrer data: **substack.com** is the second Vercel referrer after Google; Telegram and `20percent.berlin` appear as well. PostHog’s highest instrumented unique-visitor day (**17 Sep, 612**) coincides with three Telegram publications that day.

### 4.3 Search discovery

- **Google:** ~275 clicks / ~7,332 impressions in the exported chart window; peak **election day** (86 clicks).  
- **Bing:** ~113 clicks / ~4,069 impressions; queries such as *berlin wahl 2026 programmvergleich* show category demand for program comparison.  
- Multilingual GSC landing pages (`/en`, `/de`, `/ru`, `/it`, `/pl`, `/ar`, …) indicate organic interest beyond a single locale.

### 4.4 Instrumented daily attention (PostHog)

Summing daily uniques (not cross-day distinct): **1,276** (15–19 Sep), **486** (20 Sep calendar day), **423** (21–30 Sep), **96** (1–13 Oct). Attention peaks in the final campaign days — and **does not fall to zero** after polls close. The post-election weeks still show hundreds of unique-visitor-days and ongoing topic exploration, which surprised a team that had assumed the project would effectively “die” once voting ended.

---

## 5. Use patterns (instrumented window)

Split at **20 Sep 2026 18:00** Europe/Berlin (PostHog only).

### 5.1 Time on site (highlight)

A strong signal of genuine engagement — reported as **median** (typical visit) and **5%/5% trimmed mean** (robust average of the middle 90%), so idle-tab outliers do not dominate while long real reading sessions remain in the data.

| | Before end of elections | After end of elections | All instrumented |
|--|-----------|------------|------------------|
| **Median time on site** | **4m 18s** | **2m 56s** | **3m 58s** |
| **Trimmed mean 5%/5%** | **7m 41s** | **5m 17s** | **7m 10s** |
| Share of sessions **> 2 min** | **69%** | **59%** | **67%** |
| Share **> 5 min** | 46% | 37% | 44% |
| Share **> 15 min** | 22% | 13% | 20% |
| **Median time reading a topic** | **0m 32s** | **0m 17s** | **0m 28s** |
| **Trimmed mean topic time** | **0m 41s** | **0m 24s** | **0m 37s** |

Population: sessions that used the comparison (topic/party/program events). Topic time: gap to the *next* topic open (last topic in a session excluded). Full method in [`_metrics-summary.md`](./_metrics-summary.md).

A **typical** before end of elections visit is about **4 minutes**, with a robust average around **7–8 minutes**; roughly **half a minute** per topic — consistent with reading several comparison rows, not a bounce.

### 5.2 Intensity

| | Before end of elections | After end of elections |
|--|-----------|------------|
| `$pageview` | 1,985 | 739 |
| `topic_open` | 5,898 | 1,680 |
| `party_toggle` | 2,304 | 631 |
| `program_link` | 164 | 38 |
| Distinct devices with pageview | 1,628 | 657 |

Before end of elections users opened roughly **three topics per pageview** on average. After end of elections intensity is lower, but use remains clearly exploratory (1,680 topic opens after 18:00 on election day through mid-October) — not a dead site. Citation/program link-outs (**164** before end of elections) show a minority but meaningful path back to primary sources.

That topic- and party-level picture exists because product events were added when capacity allowed; without that later instrumentation, post-election “still coming” would have been visible only as raw pageviews.

### 5.3 What people compared

**Transport** and **housing** dominate topic opens; **migration** and **climate/energy** follow. Top individual topics include A100 construction, migration admission/deportations, U-Bahn extensions, rent regulation (Mietendeckel), and Tempelhofer Feld — aligning with salient Berlin campaign issues.

Party filtering touches all ten parties; presets favour “show all” over “current factions,” suggesting demand for **wide** comparison, including parties outside the prior parliament.

### 5.4 Language of use

Instrumented pageviews before end of elections: **ru > en > de**. After end of elections, **de** rises relative to en/ru. Combined with Vercel path data, the multilingual thesis holds: a large share of use is **not** German-UI-only.

---

## 6. Limitations

1. **Coverage of rich events** — Topic/party/language product events cover ~15 Sep onward (when that layer was added). Earlier visits are reflected in Vercel reach, not in topic-level detail.  
2. **Time metrics are proxies** — Session length is last−first event among product-engaged sessions; topic “reading time” is the gap between successive `topic_open` events (last-in-session excluded), not a dedicated dwell timer. We report median and a 5%/5% trimmed mean because of right skew.  
3. **Cookieless / blocking** — Counts understate true use; `$device_id` is a proxy, not a census of persons.  
4. **No outcome measures** — No knowledge tests, vote reports, or trust surveys.  
5. **Non-splittable aggregates** — Vercel/SEO cannot separate pre- and post-18:00 in this export set; election-day PostHog *daily* uniques also mix morning and evening.  
6. **Publication ≠ causation** — Timeline alignment with spikes is suggestive, not a controlled media effect estimate.  
7. **AI summarisation risk** — Disclosed and mitigated with sources/feedback paths; residual error risk remains (see site AI disclosure).  
8. **Feedback volume** — Not included in this metrics package.

---

## 7. Implications

For election-information civic tech aimed at **linguistic access** and **program substance**:

- A **comparison table + citations** can attract substantial mobile-first, multilingual use in a short campaign window, amplified by **local Telegram/Substack/newsletter** ecosystems rather than paid acquisition.  
- **Dwell time** matters as much as visit counts: among comparison users, **median ~4 minutes** on site before poll close (**~70%** stayed over 2 minutes; trimmed mean ~**7–8 minutes**) and **~½ minute per topic** point to careful reading, not drive-by traffic.  
- Demand is strongest before polls close — but **post-election use continued** at a meaningful level, contrary to the expectation that the site would go quiet overnight. That suggests program comparison retains value for reflection, discussion, or catching up after voting day.  
- Adding topic-interest analytics when capacity appeared turned out to be a **bonus**: it made both the campaign peak and the surprising afterlife readable in civic terms (which topics, which languages, how long people stayed), not only as traffic charts.  
- Privacy-preserving analytics can still support meaningful evaluation of *exploratory* behaviour (topics, parties, languages, time), provided limits are stated clearly.

Berlin 2026 should be read as a **successful access-and-comparison intervention under privacy constraints**, not as proof of electoral impact.
