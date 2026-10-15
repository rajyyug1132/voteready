"""Report visible English text left on each page when the UI is switched to Hindi.

Usage:  python scripts/check_hi_coverage.py --base-url http://localhost:8765 [--max-per-page N]
Exit 1 if any page has more than N untranslated strings (default 0).
Ignored: any string that already contains Devanagari, URLs, EPIC samples, ECI/VVPAT/EVM/NOTA/CEO/UT acronyms, numbers, the brand name.
"""
import argparse, re, sys
from playwright.sync_api import sync_playwright

PAGES = [("/", "body"), ("/checklist.html", ".cl-card"), ("/qa.html", "body"), ("/map.html?state=Odisha", ".info-box")]
JS = """() => {
 const out=[]; const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n;
 while(n=w.nextNode()){const p=n.parentElement; if(!p||['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName)) continue;
  const r=p.getBoundingClientRect(); if(!r.width||!r.height) continue;
  const t=n.nodeValue.trim().replace(/\\s+/g,' '); if(t) out.push(t);}
 document.querySelectorAll('[placeholder]').forEach(e=>out.push(e.getAttribute('placeholder')));
 return out;}"""
IGNORE = re.compile(r"^(VoteReady|[\d\s.,:/·—–\-|()↗→]*|[A-Z0-9 /&.,:()\-]{1,12}|\S+\.(in|com)\S*|VOTE\d+.*)$")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default="http://localhost:8765")
    ap.add_argument("--max-per-page", type=int, default=0)
    a = ap.parse_args()
    bad_total = 0
    with sync_playwright() as p:
        br = p.chromium.launch()
        ctx = br.new_context(viewport={"width": 1280, "height": 900})
        ctx.add_init_script("localStorage.setItem('voteready_lang','hi')")
        for path, wait in PAGES:
            pg = ctx.new_page()
            pg.goto(a.base_url + path)
            pg.wait_for_selector(wait)
            pg.wait_for_timeout(800)
            left = sorted({t for t in pg.evaluate(JS) if re.search(r"[A-Za-z]{3,}", t) and not re.search(r"[\u0900-\u097F]", t) and not IGNORE.match(t)})
            print(f"{path}: {len(left)} English strings left in Hindi mode")
            for t in left:
                print("   -", t[:110])
            bad_total += max(0, len(left) - a.max_per_page)
            pg.close()
        br.close()
    sys.exit(1 if bad_total else 0)


if __name__ == "__main__":
    main()
