#!/usr/bin/env python3
"""T21 exact-replica collision probe — runs verify-page's OVERLAP_JS verbatim,
annotates each hard pair with element tag+class, replicates timing
(load + 2500ms + mouse + 700ms). Prints hard pairs with locators.
"""
import http.server, socketserver, threading, functools, socket, sys, re

REPO = "/home/cgodwin/code/openordu/core/ordu-eleventy"
VERIFY = "/home/cgodwin/.hermes/skills/creative/deslop-web-design/scripts/verify-page.py"

# Extract OVERLAP_JS verbatim from verify-page.py
src = open(VERIFY).read()
m = re.search(r'OVERLAP_JS = r"""(.*?)"""', src, re.S)
OVERLAP_JS = m.group(1)
# Wrap: capture element identity per pair
ANNOTATED_JS = """
() => {
  const vis = e => {
    const s = getComputedStyle(e);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    if (parseFloat(s.opacity) === 0) return false;
    if (e.offsetParent === null && s.position !== 'fixed') return false;
    if (typeof e.checkVisibility === 'function' && !e.checkVisibility()) return false;
    if (e.closest('details:not([open])')) return false;
    return true;
  };
  const lineRects = e => {
    const r = document.createRange();
    r.selectNodeContents(e);
    return [...r.getClientRects()];
  };
  const els = [...document.querySelectorAll('p,h1,h2,h3,h4,li,a,span,button')]
    .filter(e => vis(e) && (e.textContent || '').trim().length > 3)
    .filter(e => { const r = e.getBoundingClientRect(); return r.width > 30 && r.height > 8; });
  const hard = [];
  for (let i = 0; i < els.length; i++) {
    for (let j = i + 1; j < els.length; j++) {
      const A = els[i], B = els[j];
      if (A.contains(B) || B.contains(A)) continue;
      const ra = lineRects(A), rb = lineRects(B);
      if (!ra.length || !rb.length) continue;
      const lh = Math.max(...ra.map(r => r.bottom - r.top));
      let oy = 0, ox = 0;
      for (const rax of ra) {
        for (const rbx of rb) {
          if (Math.abs(rax.top - rbx.top) > lh * 0.5) continue;
          const x = Math.min(rax.right, rbx.right) - Math.max(rax.left, rbx.left);
          const y = Math.min(rax.bottom, rbx.bottom) - Math.max(rax.top, rbx.top);
          if (x > ox) ox = x;
          if (y > oy) oy = y;
        }
      }
      if (ox <= 2) continue;
      if (oy > 1) hard.push({
        a: (A.textContent || '').trim().slice(0, 30),
        aTag: A.tagName + '.' + (A.className || '').toString().split(' ').slice(0,3).join('.'),
        b: (B.textContent || '').trim().slice(0, 30),
        bTag: B.tagName + '.' + (B.className || '').toString().split(' ').slice(0,3).join('.'),
        ox: Math.round(ox), oy: Math.round(oy),
      });
    }
  }
  return hard.slice(0, 12);
}
"""

def main():
    page = sys.argv[1]
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=REPO + "/dev")
    httpd = socketserver.TCPServer(("127.0.0.1", port), handler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True); t.start()
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            b = p.chromium.launch(args=["--no-sandbox"])
            pg = b.new_page(viewport={"width": 1440, "height": 900})
            pg.goto(f"http://127.0.0.1:{port}/{page}", wait_until="load")
            pg.wait_for_timeout(2500)
            pg.mouse.move(880, 430)
            pg.wait_for_timeout(700)
            hard = pg.evaluate(ANNOTATED_JS)
            for h in hard:
                print(f"HARD ox={h['ox']} oy={h['oy']}")
                print(f"  A: <{h['aTag']}> {h['a']!r}")
                print(f"  B: <{h['bTag']}> {h['b']!r}")
            if not hard:
                print("NO_HARD_COLLISIONS")
            b.close()
    finally:
        httpd.shutdown(); httpd.server_close()

main()
