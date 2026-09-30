#!/usr/bin/env python3
"""Claim-coverage verifier for data/comparison.json.

Catches the class of issues found in manual review:
  - summary claims without a supporting quote (orphan claims)
  - quotes not reflected in the summary (orphan quotes) — soft
  - PDF heading glued onto quote body
  - stance none with over-long / policy-smuggling summaries

Writes .tmp-verify/claim-coverage-report.json
Exit code 1 if any hard failure is found.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "comparison.json"
CACHE = ROOT / ".tmp-verify"
REPORT_PATH = CACHE / "claim-coverage-report.json"

STOP = {
    "der",
    "die",
    "das",
    "den",
    "dem",
    "des",
    "ein",
    "eine",
    "einer",
    "einem",
    "eines",
    "und",
    "oder",
    "für",
    "von",
    "vom",
    "zu",
    "zum",
    "zur",
    "mit",
    "ohne",
    "auf",
    "in",
    "im",
    "an",
    "am",
    "als",
    "auch",
    "nur",
    "nicht",
    "kein",
    "keine",
    "keinen",
    "wir",
    "sie",
    "es",
    "ist",
    "sind",
    "wird",
    "werden",
    "wurde",
    "bei",
    "bis",
    "nach",
    "über",
    "unter",
    "durch",
    "gegen",
    "sowie",
    "etwa",
    "etc",
    "bzw",
    "usw",
    "mehr",
    "weniger",
    "pro",
    "per",
    "aber",
    "dass",
    "daß",
    "wenn",
    "weil",
    "noch",
    "schon",
    "sehr",
    "alle",
    "allem",
    "alles",
}

POLICY_SMUGGLE = re.compile(
    r"\b("
    r"öpnv|vision\s*zero|radweg|u-?bahn|s-?bahn|tram|"
    r"wärmepumpe|solar|photovoltaik|wasserstoff|"
    r"miete|polizei|schule|kita|asyl|"
    r"parken|ladeinfrastruktur|fernwärme|gasnetz|"
    r"ausbau|fördern|ablehnen|einführen|stoppen|"
    r"weniger\s+auto|autovorrang|durchgangsverkehr"
    r")\b",
    re.I,
)

ABSENCE_OK = re.compile(
    r"("
    r"nicht\s+thematisiert|nicht\s+erwähnt|kein\s+treffer|"
    r"nicht\s+adressiert|nicht\s+genannt|im\s+programm\s+nicht|"
    r"keine?\s+\w[\w\s\-/]{0,40}\s+im\s+programm|"
    r"not\s+addressed|not\s+mentioned|no\s+mention"
    r")",
    re.I,
)

# Body sentence after a glued heading often starts with these
BODY_START = re.compile(
    r"^(Wir|Dazu|Deshalb|Daher|Somit|Zugleich|Gleichzeitig|Statt|Hierzu|"
    r"Unser|Unsere|Zentrale|Die|Der|Das)\b"
)

SPLIT_RE = re.compile(r"\s*[;–—]\s*")
TOKEN_RE = re.compile(r"[A-Za-zÄÖÜäöüß0-9]{3,}")
NUMBER_RE = re.compile(r"\d+(?:[.,]\d+)?")

# Distinctive project / policy markers — hard orphan if in claim but no quote
MARKER_RE = re.compile(
    r"\b("
    r"A\s*100|TVO|BEK|EXPO|CO[₂2]|Vision\s*Zero|"
    r"Mietendeckel|Bezahlkarte|Wärmepumpe|Photovoltaik|Fotovoltaik|"
    r"Tempelhofer\s+Feld|Grunderwerbs?steuer|Housing\s+First|"
    r"5\s*-?\s*Prozent|Sperrklausel|Zweitstimme|"
    r"U-?Bahn|S-?Bahn|Tram|BSR|GASAG|"
    r"\d{4}|\d+(?:[.,]\d+)?\s*%|\d+(?:[.,]\d+)?\s*€"
    r")\b",
    re.I,
)


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKC", s or "")
    s = s.replace("\u00ad", "")
    s = s.lower()
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def tokens(s: str) -> set[str]:
    out = set()
    for t in TOKEN_RE.findall(norm(s)):
        if t in STOP:
            continue
        for suf in ("ungen", "ung", "ischen", "ische", "ischer", "isches", "lich", "keit"):
            if len(t) > len(suf) + 3 and t.endswith(suf):
                t = t[: -len(suf)]
                break
        out.add(t)
    for n in NUMBER_RE.findall(s or ""):
        out.add(n.replace(",", "."))
    return out


def markers(s: str) -> set[str]:
    return {m.group(0).lower().replace(" ", "") for m in MARKER_RE.finditer(s or "")}


def split_claims(summary_de: str) -> list[str]:
    parts = [p.strip(" .") for p in SPLIT_RE.split(summary_de or "") if p.strip()]
    return [p for p in parts if len(tokens(p)) >= 2 or NUMBER_RE.search(p) or markers(p)]


def claim_supported(claim: str, quotes: list[str]) -> tuple[bool, str]:
    """Return (ok, severity) severity is hard|soft when not ok."""
    ct = tokens(claim)
    cm = markers(claim)
    quote_blob = " ".join(quotes)
    qm_all = markers(quote_blob)
    qt_all: set[str] = set()
    for q in quotes:
        qt_all |= tokens(q)

    # Hard: distinctive marker in claim missing from all quotes
    missing_markers = cm - qm_all
    # soften: allow partial numeric match (2040 in claim, 2040 in quote)
    if missing_markers:
        still = set()
        for m in missing_markers:
            if any(m in norm(q).replace(" ", "") or norm(q).replace(" ", "") in m for q in quotes):
                continue
            still.add(m)
        if still:
            return False, "hard"

    overlap = ct & qt_all
    if len(overlap) >= 2:
        return True, ""
    if any(NUMBER_RE.fullmatch(x) for x in overlap):
        return True, ""
    if any(len(x) >= 7 for x in overlap):
        return True, ""
    if len(overlap) == 1 and len(next(iter(overlap))) >= 5:
        return True, ""
    # Soft: weak paraphrase gap
    return False, "soft"


def quote_reflected(quote: str, summary: str) -> bool:
    qt = tokens(quote)
    st = tokens(summary)
    qm = markers(quote)
    sm = markers(summary)
    if qm and qm & sm:
        return True
    overlap = qt & st
    if len(overlap) >= 2:
        return True
    if any(len(x) >= 7 for x in overlap):
        return True
    return False


def check_glued_heading(quote: str) -> bool:
    """Detect PDF section title prepended to the first body sentence."""
    q = (quote or "").strip()
    words = q.split()
    if len(words) < 6:
        return False
    # Imperative/title chunk then a new sentence-looking body
    for n in range(2, min(8, len(words) - 2)):
        lead = " ".join(words[:n])
        rest = " ".join(words[n:])
        if re.search(r"[.!?:,]$", lead):
            continue
        lead_l = lead.lower()
        if lead_l.startswith(("wir ", "dazu ", "die ", "der ", "das ", "statt ")):
            continue
        # Allow "Mit … Stadt Das Berliner …" TOC glues; skip other Mit/Über openers
        if lead_l.startswith(("mit ", "über ")) and not re.match(
            r"^(Die|Der|Das|Wir)\b", rest
        ):
            continue
        if not BODY_START.match(rest):
            continue
        # Lead should look like a short heading (not a full clause with comma)
        if "," in lead or len(lead) > 55:
            continue
        # Avoid flagging "X in Berlin Die ..." style by requiring ≥1 lowercase content word in lead
        if not re.search(r"[a-zäöüß]{4,}", lead):
            continue
        # Rest should look like a real sentence (verb-ish), not "Die Stadt"
        if not re.search(
            r"\b(wir|werden|wird|müssen|soll|wollen|ist|sind|hat|haben|setzen|machen|bauen|lehnen|fördern|schaffen)\b",
            rest,
            re.I,
        ):
            continue
        return True
    return False


def check_cell(cell: dict) -> list[dict]:
    fails: list[dict] = []
    pid, tid = cell["partyId"], cell["topicId"]
    stance = cell.get("stance")
    summary = (cell.get("summary") or {}).get("de") or ""
    sources = cell.get("sources") or []
    quotes = [s["quote"].strip() for s in sources if s.get("quote")]

    for i, q in enumerate(quotes):
        if check_glued_heading(q):
            fails.append(
                {
                    "code": "glued_heading",
                    "partyId": pid,
                    "topicId": tid,
                    "sourceIndex": i,
                    "severity": "hard",
                    "message": "quote looks like heading glued to sentence",
                    "quote": q[:180],
                }
            )

    if stance == "none":
        if len(summary) > 110 and not ABSENCE_OK.search(summary[:90]):
            fails.append(
                {
                    "code": "none_summary_long",
                    "partyId": pid,
                    "topicId": tid,
                    "severity": "soft",
                    "message": "stance none summary is long; prefer short absence wording",
                    "summary": summary[:160],
                }
            )
        remainder = ABSENCE_OK.sub(" ", summary)
        if POLICY_SMUGGLE.search(remainder) and (";" in summary or "–" in summary or "—" in summary):
            fails.append(
                {
                    "code": "none_policy_smuggle",
                    "partyId": pid,
                    "topicId": tid,
                    "severity": "hard",
                    "message": "stance none summary smuggles other policy; shorten or cite + change stance",
                    "summary": summary[:180],
                }
            )
        return fails

    if not quotes:
        fails.append(
            {
                "code": "claim_without_quote",
                "partyId": pid,
                "topicId": tid,
                "severity": "hard",
                "message": f"stance {stance} has no quotes",
            }
        )
        return fails

    for claim in split_claims(summary):
        ok, sev = claim_supported(claim, quotes)
        if not ok:
            fails.append(
                {
                    "code": "orphan_claim",
                    "partyId": pid,
                    "topicId": tid,
                    "severity": sev,
                    "message": "summary claim not covered by any quote",
                    "claim": claim[:160],
                }
            )

    for i, q in enumerate(quotes):
        if not quote_reflected(q, summary):
            fails.append(
                {
                    "code": "orphan_quote",
                    "partyId": pid,
                    "topicId": tid,
                    "sourceIndex": i,
                    "severity": "soft",
                    "message": "quote not reflected in DE summary",
                    "quote": q[:160],
                }
            )

    return fails


def main() -> int:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    all_fails: list[dict] = []
    for cell in data["cells"]:
        all_fails.extend(check_cell(cell))

    hard = [f for f in all_fails if f.get("severity") == "hard"]
    soft = [f for f in all_fails if f.get("severity") != "hard"]

    by_code = Counter(f["code"] for f in all_fails)
    by_party: dict[str, Counter] = defaultdict(Counter)
    for f in all_fails:
        by_party[f.get("partyId", "?")][f["code"]] += 1

    hard_cells = {(f["partyId"], f["topicId"]) for f in hard}

    report = {
        "cells": len(data["cells"]),
        "hardFailureCount": len(hard),
        "softFailureCount": len(soft),
        "hardCellCount": len(hard_cells),
        "byCode": dict(by_code.most_common()),
        "byParty": {pid: dict(c) for pid, c in sorted(by_party.items())},
        "failures": all_fails,
    }
    CACHE.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")

    print(f"Claim coverage: {len(data['cells'])} cells")
    print(f"Hard fails: {len(hard)} ({len(hard_cells)} cells)  Soft: {len(soft)}")
    print("By code:")
    for code, n in by_code.most_common():
        print(f"  {code}: {n}")
    print("Hard by code:")
    for code, n in Counter(f["code"] for f in hard).most_common():
        print(f"  {code}: {n}")
    print("By party (all severities):")
    for pid, counts in sorted(by_party.items()):
        print(f"  {pid}: {sum(counts.values())}  {dict(counts)}")
    print(f"Report: {REPORT_PATH.relative_to(ROOT)}")

    # Show hard samples
    print("\nHard samples:")
    shown = 0
    for f in hard:
        print(
            f"  {f['partyId']}/{f['topicId']} [{f['code']}] "
            f"{(f.get('claim') or f.get('quote') or f.get('summary') or '')[:110]}"
        )
        shown += 1
        if shown >= 40:
            print(f"  … {len(hard) - shown} more")
            break

    return 1 if hard else 0


if __name__ == "__main__":
    sys.exit(main())
