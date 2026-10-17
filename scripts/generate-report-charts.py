#!/usr/bin/env python3
"""Generate SVG charts for docs/reports/_metrics-summary.md from stats/ exports."""

from __future__ import annotations

import csv
import json
import statistics
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import matplotlib

matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
from matplotlib import font_manager

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "reports" / "charts"
FONTS = OUT / "fonts"
BERLIN = ZoneInfo("Europe/Berlin")
CUTOFF = datetime(2026, 9, 20, 18, 0, 0, tzinfo=BERLIN)
PRODUCT = {"topic_open", "party_toggle", "party_preset", "program_link"}
SESSION_SANITY_MAX = 4 * 3600

# Chart palette: light orange + light grey (soft brand terracotta / cool gray)
INK = "#171f26"
MUTED = "#5a6672"
GRID = "#dde0e4"
LIGHT_ORANGE = "#e8916a"  # soft terracotta
LIGHT_GREY = "#c5cbd1"  # soft cool gray
ACCENT = LIGHT_ORANGE  # primary series
ACCENT2 = LIGHT_GREY  # secondary / after / pageviews
LINE = LIGHT_ORANGE
PUB = LIGHT_ORANGE

# Site body font = DM Sans (app globals / next/font). Used for all chart text.
for _name in ("DMSans-Regular.ttf", "DMSans-Medium.ttf", "DMSans-SemiBold.ttf"):
    font_manager.fontManager.addfont(str(FONTS / _name))
FONT_SANS = "DM Sans"
FONT_TITLE = font_manager.FontProperties(fname=str(FONTS / "DMSans-SemiBold.ttf"), size=12)
FONT_FOOTER = font_manager.FontProperties(fname=str(FONTS / "DMSans-Regular.ttf"), size=8)
plt.rcParams.update(
    {
        "font.family": FONT_SANS,
        "axes.titlesize": 12,
        "axes.labelsize": 9,
        "xtick.labelsize": 9,
        "ytick.labelsize": 9,
        "legend.fontsize": 8,
    }
)
# Match title↔plot gap to plot↔footer caption gap
TITLE_PAD = 28
FOOTER_Y = -0.28


def style_ax(ax):
    ax.set_facecolor("white")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color(GRID)
    ax.spines["bottom"].set_color(GRID)
    ax.tick_params(colors=MUTED, labelsize=9)
    ax.yaxis.grid(False)
    ax.xaxis.grid(False)
    ax.set_axisbelow(True)


def set_title(ax, text: str):
    if not text:
        ax.set_title("")
        return
    ax.set_title(text, color=INK, pad=TITLE_PAD, fontproperties=FONT_TITLE)


def footer(ax, text: str, y: float = FOOTER_Y):
    ax.text(0.0, y, text, transform=ax.transAxes, color=MUTED, fontproperties=FONT_FOOTER)


def fmt_day_month(d) -> str:
    """Numeric day.month (e.g. 20.9)."""
    return f"{d.day}.{d.month}"


def save(fig, name: str):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    fig.patch.set_facecolor("white")
    fig.savefig(path, format="svg", bbox_inches="tight", facecolor="white", edgecolor="none")
    plt.close(fig)
    print("wrote", path.relative_to(ROOT))


def parse_ts(s: str) -> datetime:
    return datetime.fromisoformat(s.strip()).astimezone(BERLIN)


def trimmed_mean_5_5(xs: list[float]) -> float:
    s = sorted(xs)
    n = len(s)
    k = int(n * 0.05)
    mid = s[k : n - k] if 2 * k < n else s
    return statistics.mean(mid)


def load_posthog():
    path = ROOT / "stats/posthog/export-2026-10-14-082324.csv"
    session_events: dict[str, list[tuple[datetime, str]]] = defaultdict(list)
    lang_pv = {"before": Counter(), "after": Counter()}
    lang_devices: dict[str, dict[str, set[str]]] = {
        "before": defaultdict(set),
        "after": defaultdict(set),
    }
    weekly = Counter()
    groups = {"before": Counter(), "after": Counter()}

    with path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            ev = row.get("event") or ""
            ts = parse_ts(row["timestamp"])
            window = "before" if ts <= CUTOFF else "after"
            sid = row.get("*.properties.$session_id") or ""
            did = row.get("*.properties.$device_id") or ""
            key = sid or (f"dev:{did}" if did else "")
            if key:
                session_events[key].append((ts, ev))

            if ev == "$pageview":
                ui = row.get("*.properties.ui_language") or "?"
                lang_pv[window][ui] += 1
                if did:
                    lang_devices[window][ui].add(did)
                monday = ts.date() - timedelta(days=ts.weekday())
                weekly[monday] += 1
            if ev == "topic_open":
                groups[window][row.get("*.properties.group") or "unknown"] += 1

    lang_visitors = {
        "before": Counter({k: len(v) for k, v in lang_devices["before"].items()}),
        "after": Counter({k: len(v) for k, v in lang_devices["after"].items()}),
    }

    def session_durs(pred):
        xs = []
        for evs in session_events.values():
            evs = sorted(evs)
            start = evs[0][0]
            if pred and not pred(start):
                continue
            if not ({e for _, e in evs} & PRODUCT):
                continue
            dur = (evs[-1][0] - start).total_seconds()
            if 0 < dur <= SESSION_SANITY_MAX:
                xs.append(dur)
        return xs

    pre = session_durs(lambda t: t <= CUTOFF)
    post = session_durs(lambda t: t > CUTOFF)
    return pre, post, groups, lang_visitors, lang_pv, weekly


def chart_weekly_visits_vercel():
    """Weekly visitors + pageviews from Vercel Web Analytics API export."""
    path = ROOT / "stats/vercel/visits-by-week.json"
    payload = json.loads(path.read_text(encoding="utf-8"))
    rows = []
    for row in payload.get("data", []):
        ts = datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00")).astimezone(BERLIN)
        monday = ts.date()
        visitors = int(row.get("visitors") or 0)
        pageviews = int(row.get("pageviews") or 0)
        # skip leading all-zero weeks for a readable chart
        if visitors == 0 and pageviews == 0 and not rows:
            continue
        rows.append((monday, visitors, pageviews))
    # drop trailing zeros only if after we've seen data? keep all after first non-zero
    while rows and rows[0][1] == 0 and rows[0][2] == 0:
        rows.pop(0)

    labels = []
    visitors = []
    pageviews = []
    colors_v = []
    for monday, v, p in rows:
        sunday = monday + timedelta(days=6)
        labels.append(f"{fmt_day_month(monday)}–{fmt_day_month(sunday)}")
        visitors.append(v)
        pageviews.append(p)
        # Light orange through end-of-elections week; light grey after
        if monday > CUTOFF.date():
            colors_v.append(ACCENT2)
        else:
            colors_v.append(ACCENT)

    fig, ax = plt.subplots(figsize=(9.0, 4.0))
    style_ax(ax)
    x = range(len(labels))
    w = 0.38
    ax.bar([i - w / 2 for i in x], visitors, width=w, color=colors_v, label="Visitors")
    ax.bar([i + w / 2 for i in x], pageviews, width=w, color=ACCENT2, label="Pageviews")
    ax.set_xticks(list(x))
    ax.set_xticklabels(labels, rotation=25, ha="right")
    ax.set_ylabel("Count", color=MUTED)
    set_title(ax, "Weekly visits")
    ax.legend(frameon=False, fontsize=8, loc="upper right")
    ymax = max(max(visitors), max(pageviews), 1)
    for i, (v, p) in enumerate(zip(visitors, pageviews)):
        if v:
            ax.text(i - w / 2, v + ymax * 0.015, f"{v:,}", ha="center", va="bottom", fontsize=7, color=MUTED)
        if p:
            ax.text(i + w / 2, p + ymax * 0.015, f"{p:,}", ha="center", va="bottom", fontsize=7, color=MUTED)
    save(fig, "weekly-visits.svg")


def chart_daily_uniques():
    path = ROOT / "stats/posthog/web-analytics-GRAPHS.csv"
    dates, uniques = [], []
    with path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            dates.append(datetime.strptime(row["Date"], "%d-%b-%Y"))
            uniques.append(int(row["Unique visitors (current)"] or 0))

    fig, ax = plt.subplots(figsize=(9.5, 3.8))
    style_ax(ax)
    ax.plot(
        dates,
        uniques,
        color=LINE,
        linewidth=2.2,
        marker="o",
        markersize=4,
        markerfacecolor="white",
        markeredgewidth=1.6,
        markeredgecolor=LINE,
        label="Unique visitors",
    )
    # Publication cluster markers (key outreach days)
    for pd, lab in (
        (datetime(2026, 9, 10), "10.9"),
        (datetime(2026, 9, 14), "14.9"),
        (datetime(2026, 9, 17), "17.9"),
    ):
        ax.axvline(pd, color=ACCENT, linewidth=1.0, linestyle=":", alpha=0.85)
        ax.text(
            pd,
            max(uniques) * 1.02,
            lab,
            ha="center",
            va="bottom",
            fontsize=7,
            color=ACCENT,
        )
    election = datetime(2026, 9, 20)
    ax.axvline(election, color=MUTED, linewidth=1.2, linestyle="--", label="Election day (20.9)")
    ax.set_ylim(0, max(uniques) * 1.18)
    ax.set_ylabel("")
    set_title(ax, "")
    ax.xaxis.set_major_formatter(
        plt.FuncFormatter(lambda x, _pos: fmt_day_month(mdates.num2date(x)))
    )
    ax.xaxis.set_major_locator(mdates.DayLocator(interval=3))
    fig.autofmt_xdate(rotation=30, ha="right")
    ax.legend(frameon=False, fontsize=8, loc="upper right")
    save(fig, "daily-uniques.svg")


def chart_time_on_site(pre: list[float], post: list[float]):
    labels = ["Before\nelection day", "After\nelection day"]
    medians = [statistics.median(pre) / 60, statistics.median(post) / 60]
    trims = [trimmed_mean_5_5(pre) / 60, trimmed_mean_5_5(post) / 60]

    fig, ax = plt.subplots(figsize=(6.5, 3.8))
    style_ax(ax)
    x = range(len(labels))
    w = 0.36
    bars1 = ax.bar([i - w / 2 for i in x], medians, width=w, color=ACCENT, label="Typical (median)")
    bars2 = ax.bar([i + w / 2 for i in x], trims, width=w, color=ACCENT2, label="Robust average")
    ax.set_xticks(list(x))
    ax.set_xticklabels(labels)
    ax.set_ylabel("Minutes", color=MUTED)
    set_title(ax, "")
    ax.legend(frameon=False, fontsize=8)
    for bars in (bars1, bars2):
        for b in bars:
            h = b.get_height()
            ax.text(
                b.get_x() + b.get_width() / 2,
                h + 0.15,
                f"{h:.1f}m",
                ha="center",
                va="bottom",
                fontsize=8,
                color=MUTED,
            )
    save(fig, "time-on-site.svg")


def chart_languages(lang: dict[str, Counter]):
    """Visitors (distinct devices) by UI language — top 5 + Other, before vs after."""
    ranked = sorted(
        (set(lang["before"]) | set(lang["after"])) - {"?"},
        key=lambda L: -(lang["before"][L] + lang["after"][L]),
    )
    top = ranked[:5]
    rest = ranked[5:]
    labels_list = list(top)
    before = [lang["before"][L] for L in top]
    after = [lang["after"][L] for L in top]
    if rest:
        labels_list.append("other")
        before.append(sum(lang["before"][L] for L in rest))
        after.append(sum(lang["after"][L] for L in rest))

    fig, ax = plt.subplots(figsize=(8.2, 3.8))
    style_ax(ax)
    y = range(len(labels_list))
    h = 0.38
    bars_b = ax.barh(
        [i + h / 2 for i in y], before, height=h, color=ACCENT, label="Before election day"
    )
    bars_a = ax.barh(
        [i - h / 2 for i in y], after, height=h, color=ACCENT2, label="After election day"
    )
    ax.set_yticks(list(y))
    ax.set_yticklabels(labels_list)
    ax.invert_yaxis()
    ax.set_xlabel("")
    set_title(ax, "")
    ax.legend(frameon=False, fontsize=8, loc="lower right")
    xmax = max(max(before, default=0), max(after, default=0), 1)
    ax.set_xlim(0, xmax * 1.18)
    for bar, val in zip(bars_b, before):
        if val:
            ax.text(
                val + xmax * 0.012,
                bar.get_y() + bar.get_height() / 2,
                f"{val:,}",
                va="center",
                fontsize=8,
                color=MUTED,
            )
    for bar, val in zip(bars_a, after):
        if val:
            ax.text(
                val + xmax * 0.012,
                bar.get_y() + bar.get_height() / 2,
                f"{val:,}",
                va="center",
                fontsize=8,
                color=MUTED,
            )
    save(fig, "languages-before-after.svg")


def chart_topic_groups(groups: dict[str, Counter]):
    """Topic opens by group — before vs after end of elections."""
    labels = {
        "transport": "Transport",
        "housing": "Housing",
        "climate_energy": "Climate & energy",
        "migration": "Migration",
        "education": "Education",
        "democracy": "Democracy",
        "security": "Security",
        "economy": "Economy",
        "society": "Society",
        "waste": "Waste",
        "health": "Health",
        "animals": "Animals",
    }
    keys = sorted(
        (set(groups["before"]) | set(groups["after"])) - {"unknown"},
        key=lambda k: -(groups["before"][k] + groups["after"][k]),
    )[:5]
    before = [groups["before"][k] for k in keys]
    after = [groups["after"][k] for k in keys]
    names = [labels.get(k, k) for k in keys]

    fig, ax = plt.subplots(figsize=(7.2, 3.6))
    style_ax(ax)
    y = range(len(keys))
    h = 0.38
    bars_b = ax.barh(
        [i + h / 2 for i in y], before, height=h, color=ACCENT, label="Before election day"
    )
    bars_a = ax.barh(
        [i - h / 2 for i in y], after, height=h, color=ACCENT2, label="After election day"
    )
    ax.set_yticks(list(y))
    ax.set_yticklabels(names)
    ax.invert_yaxis()
    ax.set_xlabel("")
    set_title(ax, "")
    ax.legend(frameon=False, fontsize=8, loc="lower right")
    xmax = max(max(before, default=0), max(after, default=0), 1)
    ax.set_xlim(0, xmax * 1.18)
    for bar, val in zip(bars_b, before):
        if val:
            ax.text(
                val + xmax * 0.012,
                bar.get_y() + bar.get_height() / 2,
                f"{val:,}",
                va="center",
                fontsize=7,
                color=MUTED,
            )
    for bar, val in zip(bars_a, after):
        if val:
            ax.text(
                val + xmax * 0.012,
                bar.get_y() + bar.get_height() / 2,
                f"{val:,}",
                va="center",
                fontsize=7,
                color=MUTED,
            )
    save(fig, "topic-groups.svg")


def _normalize_referrer(host: str) -> str:
    h = host.lower().strip()
    if (
        h in {
            "google.com",
            "google.de",
            "com.google.android.gm",
            "com.google.android.googlequicksearchbox",
            "mail.google.com",
        }
        or h.endswith(".google.com")
    ):
        return "Google"
    if (
        h in {
            "org.telegram.messenger",
            "web.telegram.org",
            "org.telegram.messenger.web",
            "t.me",
        }
        or "telegram" in h
    ):
        return "Telegram"
    if "substack" in h or h == "link.sbstck.com":
        return "Substack"
    if "facebook" in h or h in {"l.facebook.com", "lm.facebook.com", "m.facebook.com"}:
        return "Facebook"
    if "duckduckgo" in h:
        return "DuckDuckGo"
    if "yahoo" in h:
        return "Yahoo"
    return host


def chart_referrers():
    """Pie of traffic sources: merge Google/Telegram apps, include Direct."""
    refs = list((ROOT / "stats/vercel").glob("Top Referrers*.csv"))[0]
    routes = list((ROOT / "stats/vercel").glob("Top Routes*.csv"))[0]
    merged: Counter = Counter()
    with refs.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            merged[_normalize_referrer(row["Page"])] += int(row["Visitors"])

    # Site-level visitors from main route as denominator for Direct
    total_visitors = 0
    with routes.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row["Page"] == "/[lang]":
                total_visitors = int(row["Visitors"])
                break
    attributed = sum(merged.values())
    direct = max(0, total_visitors - attributed)
    merged["Direct"] = direct

    # Top slices + Other
    top_n = 7
    ranked = merged.most_common()
    # Keep Direct + largest named sources
    primary = [("Direct", merged["Direct"])]
    others_sum = 0
    for name, n in ranked:
        if name == "Direct":
            continue
        if len(primary) < top_n:
            primary.append((name, n))
        else:
            others_sum += n
    if others_sum:
        primary.append(("Other", others_sum))

    labels = [n for n, _ in primary]
    sizes = [n for _, n in primary]
    total = sum(sizes) or 1
    colors = [ACCENT if i % 2 == 0 else ACCENT2 for i in range(len(sizes))]
    # Direct always grey; largest orange accents alternate
    colors = []
    for i, (name, _) in enumerate(primary):
        if name == "Direct":
            colors.append(ACCENT2)
        elif name in {"Google", "Substack", "Telegram"}:
            colors.append(ACCENT)
        else:
            colors.append(ACCENT2 if i % 2 else ACCENT)

    fig, ax = plt.subplots(figsize=(7.2, 4.8))
    ax.set_facecolor("white")
    for spine in ax.spines.values():
        spine.set_visible(False)

    def autopct(pct: float) -> str:
        return f"{pct:.0f}%" if pct >= 3 else ""

    wedges, texts, autotexts = ax.pie(
        sizes,
        colors=colors,
        startangle=90,
        counterclock=False,
        autopct=autopct,
        pctdistance=0.72,
        wedgeprops={"linewidth": 1.5, "edgecolor": "white"},
    )
    for t in autotexts:
        t.set_color(INK)
        t.set_fontsize(8)
        t.set_fontfamily(FONT_SANS)

    legend_labels = [f"{n}  {v:,}  ({100 * v / total:.0f}%)" for n, v in primary]
    ax.legend(
        wedges,
        legend_labels,
        loc="center left",
        bbox_to_anchor=(1.02, 0.5),
        frameon=False,
        fontsize=8,
        prop={"family": FONT_SANS},
    )
    set_title(ax, "Traffic sources")
    ax.set_aspect("equal")
    save(fig, "referrers.svg")


def chart_vercel_languages_lifetime():
    pages = list((ROOT / "stats/vercel").glob("Top Pages*.csv"))[0]
    rows = []
    with pages.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            p = row["Page"]
            if p.count("/") == 1:
                rows.append((p, int(row["Visitors"])))
    rows.sort(key=lambda r: r[1])

    fig, ax = plt.subplots(figsize=(6.5, 4.2))
    style_ax(ax)
    ys = range(len(rows))
    ax.barh(list(ys), [v for _, v in rows], color=ACCENT, height=0.7)
    ax.set_yticks(list(ys))
    ax.set_yticklabels([p for p, _ in rows])
    ax.set_xlabel("Visitors", color=MUTED)
    set_title(ax, "Visitors by language path")
    for i, (_, v) in enumerate(rows):
        ax.text(v + 20, i, str(v), va="center", fontsize=8, color=MUTED)
    ax.set_xlim(0, max(v for _, v in rows) * 1.18)
    save(fig, "languages-vercel-lifetime.svg")


def main():
    pre, post, groups, lang_visitors, _lang_pv, _weekly_posthog = load_posthog()
    chart_weekly_visits_vercel()
    chart_daily_uniques()
    chart_time_on_site(pre, post)
    chart_languages(lang_visitors)
    chart_vercel_languages_lifetime()
    chart_topic_groups(groups)
    chart_referrers()
    print("done")


if __name__ == "__main__":
    main()
