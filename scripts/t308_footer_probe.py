#!/usr/bin/env python3
"""Footer mobile-geometry gate v2 (GAF-308 regression).
At 390px: footer columns must occupy DISJOINT vertical bands (stacked rows).
At 1280px: footer columns must be side-by-side (4-across) as designed."""
import asyncio, sys
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8123/"

async def measure(pg):
    return await pg.evaluate("""() => {
      const foot = document.querySelector('footer');
      const grid = foot.querySelector('.grid');
      const cols = [...grid.children].map(d => {
        const r = d.getBoundingClientRect();
        return {top: Math.round(r.top), bottom: Math.round(r.bottom),
                left: Math.round(r.left), right: Math.round(r.right)};
      });
      return {vw: window.innerWidth, cols};
    }""")

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        results = {}
        for name, w, h in [("mobile", 390, 844), ("desktop", 1280, 900)]:
            pg = await b.new_page(viewport={"width": w, "height": h})
            await pg.goto(URL, wait_until="networkidle")
            m = await measure(pg)
            cols = m["cols"]
            # vertical overlap between any two column boxes
            v_overlaps = 0
            for i in range(len(cols)):
                for j in range(i+1, len(cols)):
                    a, c = cols[i], cols[j]
                    if min(a["bottom"], c["bottom"]) - max(a["top"], c["top"]) > 2:
                        v_overlaps += 1
            h_overlaps = 0
            for i in range(len(cols)):
                for j in range(i+1, len(cols)):
                    a, c = cols[i], cols[j]
                    if min(a["right"], c["right"]) - max(a["left"], c["left"]) > 2:
                        h_overlaps += 1
            results[name] = {"vw": m["vw"], "n": len(cols),
                             "v_overlaps": v_overlaps, "h_overlaps": h_overlaps}
            if name == "mobile":
                await pg.screenshot(path="/tmp/gaf308-footer-mobile-after.png", full_page=False)
            await pg.close()
        await b.close()

        mob = results["mobile"]
        dsk = results["desktop"]
        # stacked mobile: disjoint vertical bands (no vertical overlap), sharing horizontal range
        mob_ok = mob["v_overlaps"] == 0 and mob["h_overlaps"] > 0
        # 4-across desktop: same vertical band, disjoint horizontal ranges
        dsk_ok = dsk["v_overlaps"] > 0 and dsk["h_overlaps"] == 0
        print(f"MOBILE {mob['vw']}px: cols={mob['n']} vertical_overlaps={mob['v_overlaps']} horizontal_overlaps={mob['h_overlaps']} -> {'PASS' if mob_ok else 'FAIL'}")
        print(f"DESKTOP {dsk['vw']}px: cols={dsk['n']} vertical_overlaps={dsk['v_overlaps']} horizontal_overlaps={dsk['h_overlaps']} -> {'PASS' if dsk_ok else 'FAIL'}")
        verdict = "PASS" if (mob_ok and dsk_ok) else "FAIL"
        print("FOOTER_GATES:", verdict)
        sys.exit(0 if verdict == "PASS" else 1)

asyncio.run(main())
