#!/usr/bin/env python3
"""T10: render 5 variants headless via Playwright, assert no console errors."""
import sys, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).parent
fails = []
ok = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    for i in range(1, 6):
        f = ROOT / f"variant-{i}" / "index.html"
        if not f.exists():
            fails.append(f"variant-{i}: FILE MISSING")
            continue
        errs = []
        def on_console(msg, _i=i, _errs=errs):
            if msg.type == "error":
                _errs.append(msg.text)
        pg.on("console", on_console)
        try:
            pg.goto(f"file://{f}", wait_until="load", timeout=30000)
            pg.wait_for_timeout(1500)
        except Exception as e:
            fails.append(f"variant-{i}: LOAD FAIL {e}")
        else:
            if errs:
                fails.append(f"variant-{i}: {len(errs)} console errors: {errs[:3]}")
            else:
                ok += 1
        pg.remove_listener("console", on_console)
    b.close()

print(f"rendered {ok}/5 headless, 0 console errors")
if fails:
    for f in fails:
        print(f"FAIL: {f}")
    sys.exit(1)