#!/usr/bin/env python3
"""T21 collision geometry probe — playwright boundingRect dump for defect localization.
Serves dev/ on ephemeral port, loads page, reports rects of suspect elements
+ all text-node overlap pairs found by pairwise intersection of leaf inline boxes.
"""
import http.server, socketserver, threading, functools, socket, sys, json

REPO = "/home/cgodwin/code/openordu/core/ordu-eleventy"

PAGE = sys.argv[1]
JS = """
() => {
  const out = {rects: [], overlaps: []};
  const targets = [
    ['#last-modified', 'last-modified'],
    ['.reading-time', 'reading-time'],
    ['p.mt-1', 'meta-p'],
  ];
  for (const [sel, name] of targets) {
    const el = document.querySelector(sel);
    if (el) {
      const r = el.getBoundingClientRect();
      out.rects.push({name, text: (el.textContent||'').trim().slice(0,40),
        x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)});
    }
  }
  // leaf text nodes pairwise overlap (viewport coords)
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const boxes = [];
  let n;
  while ((n = walker.nextNode())) {
    const t = n.textContent.trim();
    if (t.length < 2) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) boxes.push({text: t.slice(0,30), x:r.x, y:r.y, w:r.width, h:r.height});
  }
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i+1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      const ox = Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y+a.h, b.y+b.h) - Math.max(a.y, b.y);
      if (ox > 2 && oy > 2) out.overlaps.push([a.text, b.text, Math.round(ox), Math.round(oy)]);
    }
  }
  out.overlaps = out.overlaps.slice(0, 15);
  return out;
}
"""

def main():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=REPO + "/dev")
    httpd = socketserver.TCPServer(("127.0.0.1", port), handler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True); t.start()
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            b = p.chromium.launch()
            pg = b.new_page(viewport={"width": 1440, "height": 900})
            pg.goto(f"http://127.0.0.1:{port}/{PAGE}", wait_until="networkidle")
            pg.wait_for_timeout(1500)
            res = pg.evaluate(JS)
            print(json.dumps(res, indent=1))
            b.close()
    finally:
        httpd.shutdown(); httpd.server_close()

main()
