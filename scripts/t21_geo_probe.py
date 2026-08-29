#!/usr/bin/env python3
"""T21 geometry probe — measure live rects for the slides page fixes."""
import http.server, socketserver, threading, functools, socket, sys

REPO = "/home/cgodwin/code/openordu/core/ordu-eleventy"

GEO_JS = r"""
() => {
  const out = {};
  const aside = document.querySelector('aside#headings');
  if (aside) {
    const r = aside.getBoundingClientRect();
    const cs = getComputedStyle(aside);
    out.aside = {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
                 float: cs.cssFloat, gridColumn: cs.gridColumn, display: cs.display};
  } else { out.aside = null; }
  const main = document.querySelector('#main');
  if (main) { const r = main.getBoundingClientRect(); out.main = {x: Math.round(r.x), right: Math.round(r.right)}; }
  out.carousels = [];
  document.querySelectorAll('.carousel').forEach(c => {
    const cr = c.getBoundingClientRect();
    const prev = c.querySelector('.carousel-control-prev');
    const next = c.querySelector('.carousel-control-next');
    const rec = {x: Math.round(cr.x), w: Math.round(cr.width),
                 prev: prev ? {x: Math.round(prev.getBoundingClientRect().x), w: Math.round(prev.getBoundingClientRect().width)} : null,
                 next: next ? {x: Math.round(next.getBoundingClientRect().x), w: Math.round(next.getBoundingClientRect().width)} : null,
                 texts: []};
    const active = c.querySelector('.carousel-item.active');
    if (active) {
      active.querySelectorAll('p,h1,h2,h3,h4,h5,li,a,span,button').forEach(e => {
        if ((e.textContent || '').trim().length <= 3) return;
        const er = e.getBoundingClientRect();
        rec.texts.push({tag: e.tagName + '.' + (e.className || ''), text: (e.textContent || '').trim().slice(0, 24),
                        x: Math.round(er.x), right: Math.round(er.right), y: Math.round(er.y)});
      });
    }
    out.carousels.push(rec);
  });
  // TOC entries vs slide content overlap check
  out.tocLis = [];
  document.querySelectorAll('aside#headings li').forEach(li => {
    const r = li.getBoundingClientRect();
    out.tocLis.push({text: (li.textContent || '').trim().slice(0, 20), x: Math.round(r.x), right: Math.round(r.right), y: Math.round(r.y)});
  });
  return out;
}
"""

def main():
    page = sys.argv[1] if len(sys.argv) > 1 else "docs/editing/slides-and-tabs/index.html"
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
            import json
            print(json.dumps(pg.evaluate(GEO_JS), indent=1))
            b.close()
    finally:
        httpd.shutdown(); httpd.server_close()

main()
