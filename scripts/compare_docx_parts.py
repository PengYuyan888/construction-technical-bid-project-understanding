#!/usr/bin/env python3
"""Compare DOCX ZIP parts and optionally enforce an allow-list of changed parts."""

from __future__ import annotations

import argparse
import hashlib
import json
import zipfile
from pathlib import Path


def part_hashes(path: Path) -> dict[str, str]:
    with zipfile.ZipFile(path) as package:
        return {
            name: hashlib.sha256(package.read(name)).hexdigest()
            for name in package.namelist()
        }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("before", type=Path, help="Original DOCX")
    parser.add_argument("after", type=Path, help="Modified DOCX")
    parser.add_argument(
        "--allow",
        action="append",
        default=[],
        help="ZIP part allowed to change; repeat for multiple parts",
    )
    parser.add_argument("--out", type=Path, help="Write JSON report to this path")
    args = parser.parse_args()

    errors: list[str] = []
    try:
        before = part_hashes(args.before)
        after = part_hashes(args.after)
    except (OSError, zipfile.BadZipFile) as exc:
        before = {}
        after = {}
        errors.append(str(exc))

    before_names = set(before)
    after_names = set(after)
    added = sorted(after_names - before_names)
    removed = sorted(before_names - after_names)
    changed = sorted(
        name for name in before_names & after_names if before[name] != after[name]
    )
    all_changes = set(added) | set(removed) | set(changed)
    unexpected = sorted(all_changes - set(args.allow)) if args.allow else []
    if unexpected:
        errors.append("Unexpected changed package parts: " + ", ".join(unexpected))

    report = {
        "before": str(args.before.resolve()),
        "after": str(args.after.resolve()),
        "added": added,
        "removed": removed,
        "changed": changed,
        "allowed": args.allow,
        "unexpected": unexpected,
        "errors": errors,
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
