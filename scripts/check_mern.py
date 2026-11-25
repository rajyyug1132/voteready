"""Phase 7 checks for the MERN client: mobile, Hindi and keyboard.

Usage:  python scripts/check_mern.py --base-url https://voteready-mern.vercel.app [--shots docs/baseline/mern]
Exit 1 on any failure. For every page at 390 px and 1440 px, in en and hi:
  - no horizontal overflow,
  - in hi: no visible English UI text left (same ignore rules as check_hi_coverage.py),
  - keyboard: Tab reaches every visible control, and each focused control shows a visible focus style.
Then a keyboard-only run (Tab / type / Enter, no mouse) creates a plan on /plans/create, checks it
appears in the list, and deletes it through the API so the database is left as it was.
"""
import argparse, re, sys, json, urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

PAGES = {"home": "/", "checklist": "/checklist", "ask": "/ask", "map": "/map?state=Odisha",
         "plans": "/plans", "plan-form": "/plans/create"}
VIEWPORTS = {"390": (390, 844), "1440": (1440, 900)}
IGNORE = re.compile(r"^(VoteReady|[\d\s.,:/·—–\-|()↗→]*|[A-Z0-9 /&.,:()\-]{1,12}|\S+\.(in|com)\S*|VOTE\d+.*|\d+\. .*)$")
DEVANAGARI = re.compile(r"[ऀ-ॿ]")

TEXT_JS = """() => { const out=[]; const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n;
 while(n=w.nextNode()){const p=n.parentElement; if(!p||['SCRIPT','STYLE','NOSCRIPT','OPTION'].includes(p.tagName)) continue;
  const r=p.getBoundingClientRect(); if(!r.width||!r.height) continue;
  const t=n.nodeValue.trim().replace(/\\s+/g,' '); if(t) out.push(t);}
 document.querySelectorAll('[placeholder]').forEach(e=>out.push(e.getAttribute('placeholder'))); return out; }"""
CONTROLS_JS = """() => [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')]
 .filter(e=>{const r=e.getBoundingClientRect(); const s=getComputedStyle(e); return r.width&&r.height&&s.visibility!=='hidden'&&!e.disabled;}).length"""
FOCUS_JS = """() => { const e=document.activeElement; if(!e||e===document.body) return null; const s=getComputedStyle(e);
 if(!e.__vrk) e.__vrk = (window.__vrn = (window.__vrn||0) + 1);
 const visible=(s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0)||(s.boxShadow&&s.boxShadow!=='none');
 return {id:e.__vrk, tag:e.tagName, text:(e.innerText||e.value||e.getAttribute('aria-label')||'').trim().slice(0,30), visible}; }"""


def check_page(page, url, lang, vw):
    errs = []
    page.goto(url, wait_until="load")
    page.wait_for_timeout(1500)
    if page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1"):
        errs.append("horizontal overflow")
    if lang == "hi":
        left = [t for t in page.evaluate(TEXT_JS) if not DEVANAGARI.search(t) and not IGNORE.match(t)]
        if left:
            errs.append(f"English left in hi: {left[:6]}")
    if vw == "1440":  # keyboard pass once per page/lang; the 390 nav is collapsed behind the toggler
        want = page.evaluate(CONTROLS_JS)
        seen, unstyled, first = set(), [], None
        for _ in range(want + 5):
            page.keyboard.press("Tab")
            f = page.evaluate(FOCUS_JS)
            if not f:
                continue
            if f["id"] == first:  # wrapped round to the first control
                break
            first = first or f["id"]
            if f["id"] in seen:  # e.g. a date input takes one Tab per day/month/year segment
                continue
            seen.add(f["id"])
            if not f["visible"]:
                unstyled.append((f["tag"], f["text"]))
        if len(seen) < want:
            errs.append(f"Tab reached {len(seen)} of {want} controls")
        if unstyled:
            errs.append(f"no visible focus on {unstyled[:4]}")
    return errs


def keyboard_crud(page, base, api):
    page.goto(base + "/plans/create", wait_until="load")
    page.wait_for_function("document.querySelectorAll('#state option').length > 1")  # states loaded
    page.locator("#name").focus()
    page.keyboard.type("Keyboard Test")
    page.keyboard.press("Tab")                      # state select
    page.keyboard.type("Goa")                       # type-to-select
    page.wait_for_function("document.querySelector('#constituency')?.tagName === 'SELECT'")  # constituency list loaded
    page.keyboard.press("Tab")
    page.keyboard.press("ArrowDown")                # 1. North Goa
    for _ in range(10):                             # Tab on to the submit button, then Enter
        page.keyboard.press("Tab")
        if page.evaluate("document.activeElement.type === 'submit'"):
            break
    page.keyboard.press("Enter")
    page.get_by_text("Keyboard Test").wait_for(timeout=15000)  # SPA route change, no page load
    plans = json.load(urllib.request.urlopen(api + "/plans"))
    mine = [p for p in plans if p["name"] == "Keyboard Test"]
    ok = bool(mine) and mine[0]["state"] == "Goa" and mine[0]["constituency"] == "North Goa" and "Keyboard Test" in page.inner_text("body")
    for p in mine:
        urllib.request.urlopen(urllib.request.Request(f"{api}/deleteplan/{p['_id']}", method="DELETE"))
    return ok, mine[:1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default="https://voteready-mern.vercel.app")
    ap.add_argument("--api-url", default="https://voteready-api.vercel.app")
    ap.add_argument("--shots")
    a = ap.parse_args()
    shots = Path(a.shots) if a.shots else None
    if shots:
        shots.mkdir(parents=True, exist_ok=True)
    fails = 0
    with sync_playwright() as p:
        br = p.chromium.launch()
        for lang in ("en", "hi"):
            for vw, (w, h) in VIEWPORTS.items():
                ctx = br.new_context(viewport={"width": w, "height": h})
                ctx.add_init_script(f"localStorage.setItem('voteready_lang','{lang}')")
                page = ctx.new_page()
                for name, path in PAGES.items():
                    errs = check_page(page, a.base_url + path, lang, vw)
                    if shots:
                        page.goto(a.base_url + path, wait_until="load")
                        page.wait_for_timeout(400)
                        page.screenshot(path=str(shots / f"{name}-{vw}-{lang}.jpg"), full_page=True, quality=70, type="jpeg")
                    print(("FAIL " if errs else "ok   ") + f"{name:10} {vw:>4} {lang}  " + "; ".join(errs))
                    fails += bool(errs)
                ctx.close()
        ctx = br.new_context(viewport={"width": 1440, "height": 900})
        ok, rec = keyboard_crud(ctx.new_page(), a.base_url, a.api_url)
        print(("ok   " if ok else "FAIL ") + f"keyboard-only create → list → (API delete): {rec}")
        fails += not ok
        br.close()
    print(f"\n{fails} failure(s)")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
