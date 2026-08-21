#!/usr/bin/env python3
"""Inventory and coarsely classify construction-bid source files."""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path


SUPPORTED = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".dwg", ".dxf",
    ".jpg", ".jpeg", ".png", ".tif", ".tiff", ".txt", ".zip", ".rar", ".7z",
}

CATEGORIES = [
    ("template", ("模板", "格式", "分工大纲", "样式", "表格示例", "图片示例")),
    ("reference_bid", ("参考标", "参考标书", "参考技术标", "投标文件参考", "技术标范本", "类似项目")),
    ("clarification", ("答疑", "澄清", "补充通知", "补遗")),
    ("bill_of_quantities", ("工程量清单", "清单", "招标控制价")),
    ("geotechnical_survey", ("岩土", "勘察", "地勘", "水文", "测绘", "管线探测")),
    ("tender", ("招标文件", "招标公告", "合同条件", "技术要求", "用户需求")),
    (
        "drawing",
        ("图纸", "建筑", "结构", "给排水", "消防", "电气", "暖通", "园林", "景观", "基坑", "施工图"),
    ),
]


def classify(path: Path) -> str:
    haystack = str(path).lower()
    for category, keywords in CATEGORIES:
        if any(keyword.lower() in haystack for keyword in keywords):
            return category
    return "other"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", type=Path, help="Root directory to scan")
    parser.add_argument("--out", type=Path, help="Write JSON report to this path")
    parser.add_argument("--hash", action="store_true", help="Include SHA-256 hashes")
    args = parser.parse_args()

    root = args.root.resolve()
    if not root.is_dir():
        parser.error(f"Not a directory: {root}")

    records = []
    for path in sorted(root.rglob("*"), key=lambda item: str(item).lower()):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED:
            continue
        record = {
            "path": str(path.relative_to(root)),
            "extension": path.suffix.lower(),
            "size_bytes": path.stat().st_size,
            "category": classify(path.relative_to(root)),
        }
        if args.hash:
            record["sha256"] = sha256(path)
        records.append(record)

    counts = Counter(item["category"] for item in records)
    report = {
        "root": str(root),
        "file_count": len(records),
        "category_counts": dict(sorted(counts.items())),
        "files": records,
    }
    payload = json.dumps(report, ensure_ascii=False, indent=2)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(payload + "\n", encoding="utf-8")
    else:
        print(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
