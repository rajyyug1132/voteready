"""en/hi parity + provenance check for VoteReady data files.

Usage:
    python scripts/check_parity.py                       # local files
    python scripts/check_parity.py --base-url https://voteready-pi.vercel.app   # deployed files

Fails (exit 1) if:
  * checklist.json and checklist_hi.json differ in ids, order, step counts,
    category keys, officialLink, source or verified_on
  * any item lacks title/description/steps/source/verified_on/category_label
  * the 12-document step does not list exactly the 12 names in id_documents.json
  * the Hindi ink step says thumb (अंगूठे) instead of left forefinger
"""
import argparse, json, sys, urllib.request, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent


def load(name, base):
    if base:
        with urllib.request.urlopen(f"{base.rstrip('/')}/data/{name}", timeout=30) as r:
            return json.load(r)
    return json.loads((ROOT / "data" / name).read_text(encoding="utf-8"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url")
    a = ap.parse_args()
    en, hi = load("checklist.json", a.base_url), load("checklist_hi.json", a.base_url)
    ids = load("id_documents.json", a.base_url)
    errs = []

    if [i["id"] for i in en] != [i["id"] for i in hi]:
        errs.append("item ids/order differ between en and hi")
    for e, h in zip(en, hi):
        k = e["id"]
        for f in ("title", "description", "steps", "source", "verified_on", "category", "category_label", "officialLink"):
            for lang, it in (("en", e), ("hi", h)):
                if not it.get(f):
                    errs.append(f"{k} [{lang}]: missing {f}")
        if len(e["steps"]) != len(h["steps"]):
            errs.append(f"{k}: step count en={len(e['steps'])} hi={len(h['steps'])}")
        for f in ("category", "officialLink", "source", "verified_on"):
            if e.get(f) != h.get(f):
                errs.append(f"{k}: {f} differs ({e.get(f)!r} vs {h.get(f)!r})")
        if re.search(r"[A-Za-z]{4,}", h["category_label"]):
            errs.append(f"{k}: hi category_label is not Hindi")
    docs = ids["documents"]
    if len(docs) != 12:
        errs.append(f"id_documents.json has {len(docs)} docs, expected 12")
    for lang, items, key in (("en", en, "name_en"), ("hi", hi, "name_hi")):
        step = next(i for i in items if i["id"] == "documents_to_carry")["steps"][1]
        for d in docs:
            if d[key] not in step:
                errs.append(f"documents_to_carry [{lang}] missing: {d[key]}")
    ftc = next(i for i in hi if i["id"] == "first_time_confidence")["steps"]
    if any("अंगूठे पर स्याही" in s or "अंगूठे पर" in s and "स्याही" in s for s in ftc):
        errs.append("first_time_confidence [hi]: ink on thumb; must be left forefinger")
    ftc_en = next(i for i in en if i["id"] == "first_time_confidence")["steps"]
    if "Ballot button on the Control Unit" not in ftc_en[3]:
        errs.append("first_time_confidence [en] step 4 must say the Third Polling Officer presses the Ballot button on the Control Unit")

    if errs:
        print("PARITY FAIL")
        for e in errs:
            print(" -", e)
        sys.exit(1)
    print(f"PARITY OK: {len(en)} items, steps per item {[len(i['steps']) for i in en]}, 12 IDs in both languages")


if __name__ == "__main__":
    main()
