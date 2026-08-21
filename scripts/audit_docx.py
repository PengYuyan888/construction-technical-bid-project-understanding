#!/usr/bin/env python3
"""Audit structural risks in a DOCX package without changing it."""

from __future__ import annotations

import argparse
import json
import zipfile
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET


W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def parse_xml(package: zipfile.ZipFile, name: str) -> ET.Element | None:
    try:
        return ET.fromstring(package.read(name))
    except KeyError:
        return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docx", type=Path, help="DOCX file to inspect")
    parser.add_argument("--out", type=Path, help="Write JSON report to this path")
    parser.add_argument("--strict", action="store_true", help="Fail on warnings")
    args = parser.parse_args()

    warnings: list[str] = []
    errors: list[str] = []
    style_counts: Counter[str] = Counter()

    if not zipfile.is_zipfile(args.docx):
        errors.append("File is not a valid ZIP/DOCX package")
        names: list[str] = []
        metrics = {}
    else:
        with zipfile.ZipFile(args.docx) as package:
            names = package.namelist()
            root = parse_xml(package, "word/document.xml")
            if root is None:
                errors.append("Missing word/document.xml")
                metrics = {}
            else:
                paragraphs = root.findall(f".//{W}p")
                tables = root.findall(f".//{W}tbl")
                cells = root.findall(f".//{W}tc")
                table_manual_breaks = 0
                page_breaks = 0
                literal_caret_p = 0

                for paragraph in paragraphs:
                    style = paragraph.find(f"./{W}pPr/{W}pStyle")
                    if style is not None:
                        style_counts[style.get(f"{W}val", "(missing)")] += 1
                    text = "".join(node.text or "" for node in paragraph.findall(f".//{W}t"))
                    literal_caret_p += text.count("^p")
                    for br in paragraph.findall(f".//{W}br"):
                        if br.get(f"{W}type") == "page":
                            page_breaks += 1

                for cell in cells:
                    table_manual_breaks += len(cell.findall(f".//{W}br"))

                tracked_changes = sum(
                    len(root.findall(f".//{W}{tag}"))
                    for tag in ("ins", "del", "moveFrom", "moveTo")
                )
                metrics = {
                    "paragraphs": len(paragraphs),
                    "tables": len(tables),
                    "table_cells": len(cells),
                    "table_manual_breaks": table_manual_breaks,
                    "page_breaks": page_breaks,
                    "tracked_change_elements": tracked_changes,
                    "literal_caret_p": literal_caret_p,
                    "media_files": len([name for name in names if name.startswith("word/media/")]),
                    "comment_parts": len([name for name in names if "comment" in name.lower()]),
                    "paragraph_styles": dict(style_counts.most_common()),
                }

                if table_manual_breaks:
                    warnings.append(f"Found {table_manual_breaks} manual break(s) inside table cells")
                if literal_caret_p:
                    warnings.append(f"Found visible literal ^p {literal_caret_p} time(s)")
                if tracked_changes:
                    warnings.append(f"Found {tracked_changes} tracked-change element(s)")
                if metrics["comment_parts"]:
                    warnings.append(f"Found {metrics['comment_parts']} comment-related package part(s)")

    if args.strict and warnings:
        errors.extend(f"Strict mode: {warning}" for warning in warnings)

    report = {
        "docx": str(args.docx.resolve()),
        "package_parts": len(names),
        "metrics": metrics,
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
