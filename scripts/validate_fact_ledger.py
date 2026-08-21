#!/usr/bin/env python3
"""Validate a construction-bid fact ledger CSV."""

from __future__ import annotations

import argparse
import csv
import json
from collections import Counter
from pathlib import Path


REQUIRED_COLUMNS = [
    "claim_id", "topic", "value", "discipline", "source_path", "locator",
    "fact_type", "status", "notes",
]
FACT_TYPES = {"tender", "design", "site", "quantity", "derived"}
STATUSES = {"confirmed", "pending", "conflict", "omit"}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ledger", type=Path, help="Fact ledger CSV")
    parser.add_argument("--out", type=Path, help="Write JSON report to this path")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Treat pending or conflicting facts as errors",
    )
    args = parser.parse_args()

    errors: list[str] = []
    warnings: list[str] = []
    status_counts: Counter[str] = Counter()
    seen_ids: set[str] = set()

    with args.ledger.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        headers = reader.fieldnames or []
        missing = [name for name in REQUIRED_COLUMNS if name not in headers]
        extra = [name for name in headers if name not in REQUIRED_COLUMNS]
        if missing:
            errors.append(f"Missing columns: {', '.join(missing)}")
        if extra:
            warnings.append(f"Extra columns: {', '.join(extra)}")

        rows = list(reader) if not missing else []

    for index, row in enumerate(rows, start=2):
        claim_id = (row.get("claim_id") or "").strip()
        if not claim_id:
            errors.append(f"Row {index}: claim_id is empty")
        elif claim_id in seen_ids:
            errors.append(f"Row {index}: duplicate claim_id {claim_id!r}")
        seen_ids.add(claim_id)

        for field in ("topic", "value", "discipline"):
            if not (row.get(field) or "").strip():
                errors.append(f"Row {index}: {field} is empty")

        fact_type = (row.get("fact_type") or "").strip()
        status = (row.get("status") or "").strip()
        if fact_type not in FACT_TYPES:
            errors.append(f"Row {index}: invalid fact_type {fact_type!r}")
        if status not in STATUSES:
            errors.append(f"Row {index}: invalid status {status!r}")
        else:
            status_counts[status] += 1

        source = (row.get("source_path") or "").strip()
        locator = (row.get("locator") or "").strip()
        notes = (row.get("notes") or "").strip()
        if status == "confirmed" and (not source or not locator):
            errors.append(f"Row {index}: confirmed fact needs source_path and locator")
        if fact_type == "derived" and not notes:
            errors.append(f"Row {index}: derived fact needs calculation notes")
        if status in {"pending", "conflict"}:
            warnings.append(f"Row {index}: unresolved status {status}")

    if args.strict and warnings:
        errors.extend(f"Strict mode: {warning}" for warning in warnings)

    report = {
        "ledger": str(args.ledger.resolve()),
        "row_count": len(rows),
        "status_counts": dict(sorted(status_counts.items())),
        "errors": errors,
        "warnings": warnings,
        "valid": not errors,
    }
    payload = json.dumps(report, ensure_ascii=False, indent=2)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(payload + "\n", encoding="utf-8")
    else:
        print(payload)
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
