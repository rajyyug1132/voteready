"""Capture full-page screenshots of every VoteReady page for visual parity checks.

Matrix: 4 pages x 2 viewports (390 mobile, 1440 desktop) x 2 languages (en, hi) = 16 images.
Each shot starts as a fresh visitor (empty localStorage) with only `voteready_lang` set,
then scrolls the page once so scroll-triggered animations have run before capture.

Usage:
    pip install playwright && playwright install chromium
    python scripts/capture_baseline.py --base-url https://voteready-pi.vercel.app \
        --out docs/baseline/v1-promptwars

Re-run against a preview or local URL at the Phase 2 and Phase 5 gates and compare
the folders side by side.
"""

import argparse
import json
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

PAGES = {
    "home": "/",
    "checklist": "/checklist.html",
    "qa": "/qa.html",
    "map": "/map.html",
}
VIEWPORTS = {
    "390": {"width": 390, "height": 844},
    "1440": {"width": 1440, "height": 900},
}
LANGS = ["en", "hi"]


def scroll_through(page, step=400, pause=0.15):
    """Scroll to the bottom in steps so ScrollTrigger/lazy content fires, then return to top."""
    height = page.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < height:
        page.evaluate(f"window.scrollTo(0, {y})")
        time.sleep(pause)
        y += step
        height = page.evaluate("document.documentElement.scrollHeight")
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(0.8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default="https://voteready-pi.vercel.app")
    ap.add_argument("--out", default="docs/baseline/v1-promptwars")
    ap.add_argument("--format", choices=["jpeg", "png"], default="jpeg",
                    help="jpeg (q85) keeps the repo small; png for pixel diffs")
    args = ap.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    manifest = []

    with sync_playwright() as p:
        browser = p.chromium.launch()
        for lang in LANGS:
            for vp_name, vp in VIEWPORTS.items():
                ctx = browser.new_context(viewport=vp, device_scale_factor=1)
                # Fresh visitor: wipe storage, then set only the language key.
                ctx.add_init_script(
                    f"try {{ localStorage.clear(); localStorage.setItem('voteready_lang', '{lang}'); }} catch (e) {{}}"
                )
                for page_name, path in PAGES.items():
                    page = ctx.new_page()
                    errors = []
                    page.on("pageerror", lambda e, errs=errors: errs.append(str(e)))
                    failed = []
                    page.on(
                        "response",
                        lambda r, f=failed: f.append(f"{r.status} {r.url}") if r.status >= 400 else None,
                    )
                    url = args.base_url.rstrip("/") + path
                    page.goto(url, wait_until="load", timeout=60000)
                    # Some pages (map: Google Maps, D3 topojson) never go fully idle; cap the wait.
                    try:
                        page.wait_for_load_state("networkidle", timeout=12000)
                    except Exception:
                        pass
                    if page_name == "map":
                        try:
                            page.wait_for_selector(".state-path", timeout=15000)
                        except Exception:
                            errors.append("map: no .state-path rendered within 15s")
                    time.sleep(1.5)
                    scroll_through(page)
                    ext = "jpg" if args.format == "jpeg" else "png"
                    fname = f"{page_name}-{vp_name}-{lang}.{ext}"
                    shot_opts = {"path": str(out / fname), "full_page": True, "type": args.format}
                    if args.format == "jpeg":
                        shot_opts["quality"] = 85
                    page.screenshot(**shot_opts)
                    manifest.append(
                        {
                            "file": fname,
                            "url": url,
                            "viewport": vp,
                            "lang": lang,
                            "page_errors": errors,
                            "http_errors": failed,
                        }
                    )
                    page.close()
                ctx.close()
        browser.close()

    meta = {
        "base_url": args.base_url,
        "captured_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "shots": manifest,
    }
    (out / "manifest.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False))
    print(f"{len(manifest)} screenshots -> {out}")


if __name__ == "__main__":
    main()
