#!/usr/bin/env python3
"""Layer-2 relevance selection + heuristic scoring.

Builds the high-risk audit set from Layer-1 failures + all mixed/none cells
+ a deterministic ~10% sample of for/against per party.

Writes:
  .tmp-verify/relevance-queue.json
  .tmp-verify/relevance-heuristics.json
  .tmp-verify/relevance-report.json  (heuristic pass; agent may enrich)
  .tmp-verify/relevance-priority.json (none + for/against sample for deep audit)
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "comparison.json"
CACHE = ROOT / ".tmp-verify"
L1_REPORT = CACHE / "verify-report.json"
QUEUE_PATH = CACHE / "relevance-queue.json"
HEUR_PATH = CACHE / "relevance-heuristics.json"
REPORT_PATH = CACHE / "relevance-report.json"
PRIORITY_PATH = CACHE / "relevance-priority.json"

TOPIC_KEYWORDS: dict[str, list[str]] = {
    "climate-neutrality": ["klima", "klimaneutral", "co2", "co₂", "treibhaus"],
    "a100-construction": ["a100", "a 100", "autobahn"],
    "nuclear-energy": ["kernenergie", "atomkraft", "nuklear", "akw"],
    "ev-charging": ["lade", "wallbox", "e-auto", "elektromobil"],
    "heat-pumps": ["wärmepumpe"],
    "hydrogen": ["wasserstoff"],
    "queer-and-lgbtq-issues": ["queer", "lsbt", "lgbt", "regenbogen"],
    "elections-second-vote-and-5-percent-threshold": [
        "zweitstimme",
        "5-prozent",
        "sperrklausel",
        "wahlrecht",
    ],
    "migration-bezahlkarte-and-access-to-benefits-and-healthcare": [
        "bezahlkarte",
        "sachleistung",
    ],
    "business-succession": ["nachfolge", "unternehmensnachfolge"],
    "parking": ["park", "parkraum", "quartiersgarage"],
    "wind-energy": ["windenergie", "windkraft", "windrad"],
    "solar-energy-photovoltaics": ["solar", "photovoltaik", "pv "],
}

AGAINST_CUES = re.compile(
    r"\b(ablehnen|gegen|stoppen|verhindern|kein[e]?|nicht\s+wollen|verbieten|abschaffen)\b",
    re.I,
)
FOR_CUES = re.compile(
    r"\b(wollen|fördern|ausbauen|einführen|unterstützen|stärken|schaffen|investieren)\b",
    re.I,
)
NUMBER_RE = re.compile(r"\b\d+(?:[.,]\d+)?\s*(?:%|€|euro|prozent|mio|million)?\b", re.I)


def stable_sample(party_id: str, topic_id: str, rate: float = 0.1) -> bool:
    h = hashlib.sha256(f"{party_id}:{topic_id}:relevance-v1".encode()).hexdigest()
    return (int(h[:8], 16) / 0xFFFFFFFF) < rate


def score_item(item: dict) -> dict:
    """Return rubric scores: pass/fail/warn per check + overall."""
    checks = []
    summary = item.get("summaryDe") or ""
    quotes = item.get("quotes") or []
    notes = item.get("notes") or []
    stance = item["stance"]
    tid = item["topicId"]
    quote_blob = " ".join(quotes).lower()
    all_blob = " ".join([summary, *quotes, *notes]).lower()

    # Topic match
    kws = TOPIC_KEYWORDS.get(tid)
    if kws:
        if stance == "none":
            note_blob = " ".join(notes).lower()
            if quotes and not any(kw in note_blob for kw in kws) and any(
                kw in quote_blob for kw in kws
            ):
                checks.append(
                    {
                        "check": "topic_match",
                        "result": "warn",
                        "reason": "none-cell cites topical quotes without absence note",
                    }
                )
            else:
                checks.append({"check": "topic_match", "result": "pass"})
        elif any(kw in all_blob for kw in kws):
            checks.append({"check": "topic_match", "result": "pass"})
        else:
            checks.append(
                {
                    "check": "topic_match",
                    "result": "fail",
                    "reason": f"no topic keywords {kws} in summary/quotes/notes",
                }
            )
    else:
        checks.append({"check": "topic_match", "result": "pass", "reason": "no keyword bag"})

    # Stance entailment (lightweight cue check)
    if stance == "none":
        if notes or (summary and any(
            x in summary.lower()
            for x in ("nicht thematisiert", "kein treffer", "keine ", "nicht erwähnt", "im programm nicht")
        )):
            checks.append({"check": "stance_entailment", "result": "pass"})
        elif quotes:
            checks.append(
                {
                    "check": "stance_entailment",
                    "result": "warn",
                    "reason": "stance none relies on quotes without clear absence framing",
                }
            )
        else:
            checks.append(
                {
                    "check": "stance_entailment",
                    "result": "fail",
                    "reason": "stance none without note or absence language",
                }
            )
    elif not quotes:
        checks.append(
            {
                "check": "stance_entailment",
                "result": "fail",
                "reason": "claim stance without quotes",
            }
        )
    elif stance == "against" and FOR_CUES.search(quote_blob) and not AGAINST_CUES.search(
        quote_blob
    ):
        checks.append(
            {
                "check": "stance_entailment",
                "result": "warn",
                "reason": "against stance but quotes look supportive",
            }
        )
    elif stance == "for" and AGAINST_CUES.search(quote_blob) and not FOR_CUES.search(
        quote_blob
    ):
        checks.append(
            {
                "check": "stance_entailment",
                "result": "warn",
                "reason": "for stance but quotes look opposing",
            }
        )
    else:
        checks.append({"check": "stance_entailment", "result": "pass"})

    # Summary fidelity: numbers in summary should appear in quotes
    summary_nums = set(NUMBER_RE.findall(summary))
    quote_nums = set(NUMBER_RE.findall(" ".join(quotes)))
    # normalize
    def norm_num(n: str) -> str:
        return re.sub(r"\s+", "", n.lower().replace(",", "."))

    missing = [n for n in summary_nums if not any(norm_num(n) in norm_num(q) or norm_num(q) in norm_num(n) for q in quote_nums)]
    # Only flag distinctive numbers (skip lone small ints that are common)
    missing_sig = [n for n in missing if not re.fullmatch(r"\d{1,2}", n.strip())]
    if missing_sig and quotes:
        checks.append(
            {
                "check": "summary_fidelity",
                "result": "warn",
                "reason": f"summary numbers not in quotes: {missing_sig[:5]}",
            }
        )
    else:
        checks.append({"check": "summary_fidelity", "result": "pass"})

    # Cherry-pick placeholder (needs human/agent) — pass by default
    checks.append({"check": "cherry_pick", "result": "pass", "reason": "deferred to spot-check"})

    results = [c["result"] for c in checks]
    if "fail" in results:
        overall = "fail"
    elif "warn" in results:
        overall = "warn"
    else:
        overall = "pass"

    return {
        **item,
        "checks": checks,
        "overall": overall,
    }


def main() -> None:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    topics = {t["id"]: t for t in data["topics"]}
    l1_fails = []
    if L1_REPORT.exists():
        l1 = json.loads(L1_REPORT.read_text())
        l1_fails = l1.get("failures") or []

    l1_keys = {(f.get("partyId"), f.get("topicId")) for f in l1_fails if f.get("partyId")}

    queue = []
    for cell in data["cells"]:
        pid, tid = cell["partyId"], cell["topicId"]
        stance = cell["stance"]
        why = []
        if (pid, tid) in l1_keys:
            why.append("layer1_failure")
        if stance in ("mixed", "none"):
            why.append(f"stance_{stance}")
        if stance in ("for", "against") and stable_sample(pid, tid):
            why.append("random_sample")
        if not why:
            continue
        quotes = [s.get("quote") for s in (cell.get("sources") or []) if s.get("quote")]
        notes = [
            s.get("note")
            for s in (cell.get("sources") or [])
            if s.get("note") and not s.get("quote")
        ]
        topic = topics.get(tid, {})
        queue.append(
            {
                "partyId": pid,
                "topicId": tid,
                "stance": stance,
                "topicLabelDe": (topic.get("label") or {}).get("de"),
                "summaryDe": (cell.get("summary") or {}).get("de"),
                "quotes": quotes,
                "notes": notes,
                "reasons": why,
            }
        )

    scored = [score_item(item) for item in queue]
    heur_fails = []
    for item in scored:
        for check in item["checks"]:
            if check["result"] in ("fail", "warn") and check["check"] == "topic_match":
                heur_fails.append(
                    {
                        "code": "topic_keyword_miss",
                        "partyId": item["partyId"],
                        "topicId": item["topicId"],
                        "message": check.get("reason", ""),
                        "severity": "soft" if check["result"] == "warn" else "hard",
                    }
                )

    overall_counts = Counter(s["overall"] for s in scored)
    priority = [
        s
        for s in scored
        if s["stance"] == "none"
        or s["overall"] in ("fail", "warn")
        or "random_sample" in s["reasons"]
    ]

    CACHE.mkdir(parents=True, exist_ok=True)
    QUEUE_PATH.write_text(
        json.dumps(
            {
                "count": len(queue),
                "byParty": {
                    pid: sum(1 for q in queue if q["partyId"] == pid)
                    for pid in sorted({q["partyId"] for q in queue})
                },
                "cells": queue,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    HEUR_PATH.write_text(
        json.dumps({"failures": heur_fails, "count": len(heur_fails)}, ensure_ascii=False, indent=2)
        + "\n",
        encoding="utf-8",
    )
    REPORT_PATH.write_text(
        json.dumps(
            {
                "method": "heuristic-rubric-v1",
                "queueCount": len(scored),
                "overallCounts": dict(overall_counts),
                "cells": scored,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    PRIORITY_PATH.write_text(
        json.dumps({"count": len(priority), "cells": priority}, ensure_ascii=False, indent=2)
        + "\n",
        encoding="utf-8",
    )

    print(f"Relevance queue: {len(queue)} → {QUEUE_PATH.relative_to(ROOT)}")
    print(f"Scored: {dict(overall_counts)} → {REPORT_PATH.relative_to(ROOT)}")
    print(f"Priority deep-audit: {len(priority)} → {PRIORITY_PATH.relative_to(ROOT)}")
    print(f"Heuristic topic flags: {len(heur_fails)}")
    fails = [s for s in scored if s["overall"] == "fail"]
    warns = [s for s in scored if s["overall"] == "warn"]
    print(f"Fails ({len(fails)}):")
    for s in fails[:20]:
        reasons = [c.get("reason") for c in s["checks"] if c["result"] == "fail"]
        print(f"  {s['partyId']}/{s['topicId']}: {reasons}")
    print(f"Warns ({len(warns)}):")
    for s in warns[:25]:
        reasons = [c.get("reason") for c in s["checks"] if c["result"] == "warn"]
        print(f"  {s['partyId']}/{s['topicId']}: {reasons}")


if __name__ == "__main__":
    main()
