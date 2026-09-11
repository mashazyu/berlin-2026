#!/usr/bin/env python3
"""Layer-1 mechanical citation verifier for data/comparison.json.

Caches party program PDFs under .tmp-verify/, extracts per-page text, and checks:
- schema completeness (party×topic cells, locales)
- quote URL matches party programUrl
- quote literally appears in PDF (normalized)
- page number when set
- truncated / mid-cut quotes
- stance none vs topical quote heuristics

Writes .tmp-verify/verify-report.json and prints a short summary.
Exit code 1 if any hard failure is found.
"""

from __future__ import annotations

import json
import re
import ssl
import sys
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "comparison.json"
CACHE = ROOT / ".tmp-verify"
PDF_DIR = CACHE / "pdfs"
TEXT_DIR = CACHE / "pages"
REPORT_PATH = CACHE / "verify-report.json"

LOCALES = ("en", "de", "ru", "tr", "pl", "uk")
STANCES = {"for", "against", "mixed", "none"}
CYRILLIC_RE = re.compile(r"[\u0400-\u04FF]")
TERMINAL_PUNCT_RE = re.compile(r"[.!?…]$")
# Mid-word truncation: ends with letter then hyphen, or ellipsis mid-token
MID_CUT_RE = re.compile(r"[A-Za-zÄÖÜäöüß][-–—]$|…$|\w{2,}-\s*$")

# Soft hyphen / common PDF artifacts
SOFT_HYPHEN = "\u00ad"

# Page chrome that PDFs inject mid-sentence when pages are concatenated
HEADER_PATTERNS = [
    re.compile(r"\b\d+\s+BAUEN\s*&\s*WOHNEN\b", re.I),
    re.compile(r"\bWahlprogramm\s+Berlin\s+2026\s+\d+\s+BERLIN\s+GEWINNT\b", re.I),
    re.compile(r"\b\d+\s+BERLIN\s+GEWINNT\b", re.I),
    re.compile(r"\b\d+\s+WAHLPROGRAMM\s+BERLIN\s+2026\b", re.I),
    re.compile(r"\bWAHLPROGRAMM\s+BERLIN\s+2026\b", re.I),
    re.compile(r"\bPARTEI\s+MENSCH\s+KLIMA\s+TIERSCHUTZ\s*//\s*TIERSCHUTZPARTEI\b", re.I),
    re.compile(
        r"\b\d+\s+ÖDP\s+Berlin\s+Landespolitisches\s+Programm\s+Stand\s+[\d-]+\b",
        re.I,
    ),
    re.compile(r"\b\d+\s+WIRTSCHAFT\s*&\s*SOZIALES\b", re.I),
    re.compile(r"\bWIRTSCHAFT\s*&\s*SOZIALES\b", re.I),
    # Page number interrupting a hyphenated line break (e.g. "Mas- 49 sen-")
    re.compile(r"(?<=[A-Za-zÄÖÜäöüß]-)\s*\d{1,3}\s+(?=[A-Za-zÄÖÜäöüß])"),
    re.compile(r"\bRegierungsprogramm\s+2026-2030\b", re.I),
    re.compile(r"\bRegierungsprogramm\s+2026-2031\b", re.I),
    # Lone printed page number between sentences (e.g. "des § 23 250 BauGB")
    re.compile(r"(?<=\s)\d{1,3}(?=\s+\d{2,3}\s)", re.I),
]


def strip_page_chrome(s: str) -> str:
    for pat in HEADER_PATTERNS:
        s = pat.sub(" ", s)
    return s


def normalize_text(s: str, *, strip_chrome: bool = False) -> str:
    """Normalize PDF/quote text for substring matching."""
    if strip_chrome:
        s = strip_page_chrome(s)
    s = s.replace("\u00a0", " ")
    s = s.replace("ﬁ", "fi").replace("ﬂ", "fl")
    s = s.replace("ﬀ", "ff").replace("ﬃ", "ffi").replace("ﬄ", "ffl")
    # Soft hyphen = optional break: drop it and any following whitespace/newline
    s = re.sub(rf"{SOFT_HYPHEN}\s*", "", s)
    # Unify dash / hyphen variants (incl. non-breaking hyphen U+2011)
    s = re.sub(r"[‐‑‒–—―]", "-", s)
    # Hyphenated line breaks: "Wort-\nbruch" / "Wort- bruch"
    s = re.sub(r"(\w)-\s+(\w)", r"\1\2", s)
    s = s.replace("₂", "2")
    s = re.sub(r"\s+", " ", s)
    return s.strip().lower()


def match_key(s: str, *, strip_chrome: bool = False) -> str:
    """Aggressive key: drop hyphens/spaces for compound-glue mismatches."""
    return re.sub(r"[-\s]", "", normalize_text(s, strip_chrome=strip_chrome))


def download_pdf(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 1000:
        return
    ctx = ssl.create_default_context()
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "berlin-2026-verify-citations/1.0"},
    )
    with urllib.request.urlopen(req, context=ctx, timeout=120) as resp:
        dest.write_bytes(resp.read())


def extract_pages(pdf_path: Path, party_id: str, *, force: bool = False) -> list[str]:
    """Return 1-indexed list where pages[i] is text of page i (pages[0] unused)."""
    pages_json = TEXT_DIR / f"{party_id}.json"
    if pages_json.exists() and not force:
        data = json.loads(pages_json.read_text())
        return data["pages"]

    try:
        import fitz  # PyMuPDF — better soft-hyphen / layout text

        doc = fitz.open(str(pdf_path))
        pages = [""]
        for i in range(len(doc)):
            pages.append(doc[i].get_text() or "")
        doc.close()
    except Exception:
        from pypdf import PdfReader

        reader = PdfReader(str(pdf_path))
        pages = [""]
        for page in reader.pages:
            pages.append(page.extract_text() or "")

    TEXT_DIR.mkdir(parents=True, exist_ok=True)
    pages_json.write_text(
        json.dumps({"partyId": party_id, "pageCount": len(pages) - 1, "pages": pages}),
        encoding="utf-8",
    )
    full = TEXT_DIR / f"{party_id}.txt"
    parts = []
    for i, text in enumerate(pages):
        if i == 0:
            continue
        parts.append(f"\n\n===== PAGE {i} =====\n{text}")
    full.write_text("".join(parts), encoding="utf-8")
    return pages


def quote_candidates(quote: str) -> list[str]:
    """Normalized variants to match against PDF text."""
    nq = normalize_text(quote)
    out = [nq, match_key(quote)]
    if nq.endswith("."):
        out.append(nq[:-1].rstrip())
        out.append(match_key(quote[:-1]))
    # Deduplicate preserving order
    seen: set[str] = set()
    uniq = []
    for item in out:
        if item and item not in seen:
            seen.add(item)
            uniq.append(item)
    return uniq


def find_quote_pages(
    matched: str,
    norm_pages: list[str],
    *,
    key_pages: list[str],
) -> list[int]:
    hits = []
    use_key = "-" not in matched and " " not in matched
    for i, page in enumerate(norm_pages):
        if i == 0:
            continue
        hay = key_pages[i] if use_key else page
        if matched and matched in hay:
            hits.append(i)
    return hits


def find_quote_anywhere(
    candidates: list[str], full_norm: str, full_key: str
) -> tuple[bool, str | None]:
    for cand in candidates:
        hay = full_key if (" " not in cand and "-" not in cand) else full_norm
        # Also try key hay for spaced candidates that fail
        if cand in hay or cand in full_key:
            return True, cand if cand in hay else match_key(cand)
    return False, None


def check_schema(data: dict) -> list[dict]:
    fails: list[dict] = []
    parties = {p["id"]: p for p in data["parties"]}
    topics = {t["id"]: t for t in data["topics"]}
    cells = data["cells"]
    by_key = {(c["topicId"], c["partyId"]): c for c in cells}

    for pid in parties:
        for tid in topics:
            if (tid, pid) not in by_key:
                fails.append(
                    {
                        "code": "missing_cell",
                        "partyId": pid,
                        "topicId": tid,
                        "message": "missing party×topic cell",
                    }
                )

    for cell in cells:
        pid, tid = cell["partyId"], cell["topicId"]
        if pid not in parties:
            fails.append(
                {
                    "code": "unknown_party",
                    "partyId": pid,
                    "topicId": tid,
                    "message": "unknown partyId",
                }
            )
        if tid not in topics:
            fails.append(
                {
                    "code": "unknown_topic",
                    "partyId": pid,
                    "topicId": tid,
                    "message": "unknown topicId",
                }
            )
        stance = cell.get("stance")
        if stance not in STANCES:
            fails.append(
                {
                    "code": "bad_stance",
                    "partyId": pid,
                    "topicId": tid,
                    "message": f"invalid stance {stance!r}",
                }
            )
        summary = cell.get("summary") or {}
        for loc in LOCALES:
            val = summary.get(loc)
            if not isinstance(val, str) or not val.strip():
                fails.append(
                    {
                        "code": "missing_locale",
                        "partyId": pid,
                        "topicId": tid,
                        "message": f"missing summary.{loc}",
                    }
                )
        en, uk = summary.get("en", ""), summary.get("uk", "")
        if en and uk and en.strip() == uk.strip():
            fails.append(
                {
                    "code": "uk_equals_en",
                    "partyId": pid,
                    "topicId": tid,
                    "message": "uk summary identical to en",
                }
            )
        for loc in ("ru", "uk"):
            val = summary.get(loc, "")
            if val and not CYRILLIC_RE.search(val):
                fails.append(
                    {
                        "code": "missing_cyrillic",
                        "partyId": pid,
                        "topicId": tid,
                        "message": f"{loc} summary has no Cyrillic",
                    }
                )
        if not cell.get("sources"):
            fails.append(
                {
                    "code": "no_sources",
                    "partyId": pid,
                    "topicId": tid,
                    "message": "cell has no sources",
                }
            )
    return fails


def check_citations(data: dict, page_map: dict[str, list[str]]) -> list[dict]:
    fails: list[dict] = []
    parties = {p["id"]: p for p in data["parties"]}
    norm_pages_cache: dict[str, list[str]] = {}
    key_pages_cache: dict[str, list[str]] = {}
    full_norm_cache: dict[str, str] = {}
    full_key_cache: dict[str, str] = {}

    for pid, pages in page_map.items():
        norm_pages_cache[pid] = [
            normalize_text(p, strip_chrome=True) if p else "" for p in pages
        ]
        key_pages_cache[pid] = [
            match_key(p, strip_chrome=True) if p else "" for p in pages
        ]
        full_norm_cache[pid] = " ".join(norm_pages_cache[pid][1:])
        full_key_cache[pid] = match_key(
            " ".join(pages[1:]), strip_chrome=True
        )

    for cell in data["cells"]:
        pid = cell["partyId"]
        tid = cell["topicId"]
        party = parties.get(pid)
        if not party:
            continue
        program_url = party["programUrl"]
        sources = cell.get("sources") or []
        stance = cell.get("stance")
        has_quote = False
        has_note = False

        for idx, src in enumerate(sources):
            url = src.get("url")
            quote = (src.get("quote") or "").strip()
            note = (src.get("note") or "").strip()
            page = src.get("page")

            if url and url != program_url:
                fails.append(
                    {
                        "code": "url_mismatch",
                        "partyId": pid,
                        "topicId": tid,
                        "sourceIndex": idx,
                        "message": "source.url != party.programUrl",
                        "url": url,
                        "expected": program_url,
                    }
                )

            if quote:
                has_quote = True
                q_stripped = quote.rstrip("\"'«»“”»)")
                if not TERMINAL_PUNCT_RE.search(q_stripped):
                    fails.append(
                        {
                            "code": "truncated_quote",
                            "partyId": pid,
                            "topicId": tid,
                            "sourceIndex": idx,
                            "message": "quote does not end with . ! ? …",
                            "quote": quote[:160],
                        }
                    )
                if MID_CUT_RE.search(quote.rstrip()):
                    fails.append(
                        {
                            "code": "mid_cut_quote",
                            "partyId": pid,
                            "topicId": tid,
                            "sourceIndex": idx,
                            "message": "quote looks mid-cut / hyphen-truncated",
                            "quote": quote[:160],
                        }
                    )

                if pid not in norm_pages_cache:
                    fails.append(
                        {
                            "code": "pdf_missing",
                            "partyId": pid,
                            "topicId": tid,
                            "sourceIndex": idx,
                            "message": "no extracted PDF text for party",
                        }
                    )
                    continue

                candidates = quote_candidates(quote)
                anywhere, matched = find_quote_anywhere(
                    candidates, full_norm_cache[pid], full_key_cache[pid]
                )

                if not anywhere or matched is None:
                    fails.append(
                        {
                            "code": "quote_not_found",
                            "partyId": pid,
                            "topicId": tid,
                            "sourceIndex": idx,
                            "message": "quote not found in program PDF text",
                            "page": page,
                            "quote": quote[:200],
                        }
                    )
                elif page is not None and isinstance(page, int) and page > 0:
                    hits = find_quote_pages(
                        matched,
                        norm_pages_cache[pid],
                        key_pages=key_pages_cache[pid],
                    )
                    # Allow ±1 page (printed vs PDF offset / split quotes)
                    near = {page - 1, page, page + 1}
                    if hits and not (near & set(hits)):
                        fails.append(
                            {
                                "code": "wrong_page",
                                "partyId": pid,
                                "topicId": tid,
                                "sourceIndex": idx,
                                "message": f"quote not near cited page {page}; found on {hits[:8]}",
                                "page": page,
                                "foundPages": hits[:12],
                                "quote": quote[:160],
                            }
                        )

            if note and not quote:
                has_note = True

        if stance == "none":
            if has_quote and not has_note:
                fails.append(
                    {
                        "code": "none_without_note",
                        "partyId": pid,
                        "topicId": tid,
                        "severity": "soft",
                        "message": "stance none has quotes but no absence note",
                    }
                )
            if not has_quote and not has_note:
                fails.append(
                    {
                        "code": "none_no_evidence",
                        "partyId": pid,
                        "topicId": tid,
                        "message": "stance none with neither quote nor note",
                    }
                )
        else:
            if not has_quote:
                fails.append(
                    {
                        "code": "claim_without_quote",
                        "partyId": pid,
                        "topicId": tid,
                        "message": f"stance {stance} has no quote evidence",
                    }
                )

    return fails


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Verify comparison citations against PDFs")
    parser.add_argument(
        "--force-extract",
        action="store_true",
        help="Re-extract PDF text even if cached",
    )
    args = parser.parse_args()

    CACHE.mkdir(parents=True, exist_ok=True)
    data = json.loads(DATA.read_text(encoding="utf-8"))
    parties = data["parties"]

    print(f"Loading {DATA.relative_to(ROOT)} ({len(data['cells'])} cells)…")
    schema_fails = check_schema(data)

    page_map: dict[str, list[str]] = {}
    download_errors: list[dict] = []

    for party in parties:
        pid = party["id"]
        url = party["programUrl"]
        pdf_path = PDF_DIR / f"{pid}.pdf"
        print(f"  PDF {pid}…", end=" ", flush=True)
        try:
            download_pdf(url, pdf_path)
            pages = extract_pages(pdf_path, pid, force=args.force_extract)
            page_map[pid] = pages
            print(f"ok ({len(pages) - 1} pages)")
        except Exception as exc:  # noqa: BLE001
            print(f"FAIL {exc}")
            download_errors.append(
                {
                    "code": "pdf_download_or_extract",
                    "partyId": pid,
                    "message": str(exc),
                    "url": url,
                }
            )

    citation_fails = check_citations(data, page_map)
    all_fails = download_errors + schema_fails + citation_fails

    hard = [f for f in all_fails if f.get("severity") != "soft"]
    soft = [f for f in all_fails if f.get("severity") == "soft"]

    by_party: dict[str, Counter] = defaultdict(Counter)
    by_code: Counter = Counter()
    for f in all_fails:
        by_code[f["code"]] += 1
        by_party[f.get("partyId", "?")][f["code"]] += 1

    report = {
        "cells": len(data["cells"]),
        "parties": [p["id"] for p in parties],
        "hardFailureCount": len(hard),
        "softFailureCount": len(soft),
        "byCode": dict(by_code.most_common()),
        "byParty": {pid: dict(c) for pid, c in sorted(by_party.items())},
        "failures": all_fails,
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")

    print()
    print(f"Hard fails: {len(hard)}  Soft fails: {len(soft)}")
    print("By code:")
    for code, n in by_code.most_common():
        print(f"  {code}: {n}")
    print("By party:")
    for pid, counts in sorted(by_party.items()):
        total = sum(counts.values())
        print(f"  {pid}: {total}  {dict(counts)}")
    print(f"Report: {REPORT_PATH.relative_to(ROOT)}")

    return 1 if hard else 0


if __name__ == "__main__":
    sys.exit(main())
