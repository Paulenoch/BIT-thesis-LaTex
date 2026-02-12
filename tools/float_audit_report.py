#!/usr/bin/env python3
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

NEWLABEL_RE = re.compile(
    r"""\\newlabel\{(?P<label>[^}]+)\}\{\{(?P<num>[^}]*)\}\{(?P<page>[^}]*)\}""",
    re.VERBOSE,
)

FIRSTREF_RE = re.compile(
    r"""\\floataudit@firstref\{(?P<label>[^}]+)\}\{(?P<page>\d+)\}""",
    re.VERBOSE,
)

INPUT_RE = re.compile(r"""\\@input\{(?P<path>[^}]+)\}""", re.VERBOSE)


def iter_aux_paths(root_aux: Path):
    seen = set()
    stack = [root_aux]
    while stack:
        p = stack.pop()
        if p in seen or not p.exists():
            continue
        seen.add(p)
        yield p
        text = p.read_text(encoding="utf-8", errors="replace")
        for m in INPUT_RE.finditer(text):
            child = (p.parent / m.group("path")).resolve()
            stack.append(child)


def parse_all_aux(root_aux: Path):
    caption = {}  # label -> (num, page)
    firstref = {}  # label -> page

    for aux_path in iter_aux_paths(root_aux):
        aux_text = aux_path.read_text(encoding="utf-8", errors="replace")

        for m in NEWLABEL_RE.finditer(aux_text):
            label = m.group("label")
            num = m.group("num").strip()
            page = m.group("page").strip()
            if page.isdigit():
                caption[label] = (num, int(page))

        for m in FIRSTREF_RE.finditer(aux_text):
            label = m.group("label")
            page = int(m.group("page"))
            prev = firstref.get(label)
            firstref[label] = page if prev is None else min(prev, page)

    return caption, firstref


def main():
    aux_path = ROOT / "thesis-audit.aux"
    if not aux_path.exists():
        raise SystemExit(f"missing {aux_path}")

    caption, firstref = parse_all_aux(aux_path)

    rows = []
    for label, (num, cap_page) in caption.items():
        if not (label.startswith("fig:") or label.startswith("tab:")):
            continue
        ref_page = firstref.get(label)
        if ref_page is None:
            rows.append((label, num, cap_page, "", ""))
        else:
            rows.append((label, num, cap_page, ref_page, cap_page - ref_page))

    rows.sort(key=lambda r: (r[2], str(r[1]), r[0]))

    out = ROOT / "tmp" / "float_audit_report.tsv"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as f:
        f.write("label\tnum\tcaption_page\tfirst_ref_page\tdelta_pages\n")
        for r in rows:
            f.write("\t".join(map(str, r)) + "\n")

    outliers = []
    for label, num, cap_page, ref_page, delta in rows:
        if ref_page == "":
            continue
        if isinstance(delta, int) and abs(delta) >= 2:
            outliers.append((abs(delta), delta, cap_page, ref_page, num, label))
    outliers.sort(reverse=True)

    print(f"Wrote {out}")
    print("Outliers (|delta| >= 2):")
    for _, delta, cap_page, ref_page, num, label in outliers[:80]:
        print(f"{label}\t{num}\tcap={cap_page}\tref={ref_page}\tdelta={delta}")


if __name__ == "__main__":
    main()
