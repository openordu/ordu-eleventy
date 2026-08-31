# V2b Editorial Home — Implementation Spec (GAF-313)

Approved design: variant V2b "Teal Editorial + PCE panel" (mock
/tmp/openordu-deslop/v2b-editorial-panel.html, approved render
~/.hermes/cache/images/img_89b43fddc8af.jpg). This doc is the implementation
contract for the openordu.github.io homepage + chrome. Real logo assets are
canonical and byte-identical (user directive: "However use our logo").

## 1. Token map (§token-map)

Mechanism (GAF-276 T17 / GAF-308 T4, PRESERVED): semantic token NAMES stay;
only HEXES re-point. All 224+ template color-class instances keep resolving.

| Token      | GAF-308 hex (old)         | V2b hex (new) | Role / notes |
|------------|---------------------------|---------------|--------------|
| ink        | #1c1e1c                   | #122019       | body text; V2b --fg |
| paper      | #ffffff                   | #f7faf9       | page paper; body bg via custom layer too |
| moss       | #1f7a53                   | #1f7a53       | UNCHANGED (V2b --teal) — CTA, links |
| earth      | #0f4c33                   | #0f4c33       | UNCHANGED (V2b --deep) — footer/nav bg |
| ochre      | #46bd87                   | #46bd87       | UNCHANGED (V2b --teal-2) — brand/logo teal |
| peat       | #f4f7f5                   | #f7faf9       | light raised surface (V2b --paper) |
| mist       | #5c6e64                   | #3f554c       | muted text/borders (V2b --fg-2); AA on white 8.1:1 |
| bone       | #f2f7f4                   | #f2fbf7       | light text on DARK zones only |
| gold       | #46bd87                   | #46bd87       | UNCHANGED — brand teal (logo lock) |
| gold-deep  | #1f7a53                   | #1f7a53       | UNCHANGED |
| peat-2     | #eef2ef                   | #eef4f2       | V2b --paper-2 |
| peat-3     | #ffffff                   | #ffffff       | white card surface |
| crimson    | #b52f0d                   | #b52f0d       | UNCHANGED — v0.2 badge + sparing accent |
| (new) teal | —                         | (alias moss)  | V2b names map onto moss/earth/ochre |
| (new) amber| —                         | #efac2e       | panel dot + SOURCES legend only |
| (new) coral| —                         | #e7405e       | panel dot + REVIEW legend only |

Amber/coral are added as tokens (panel + legend only; one use each — not a
palette expansion beyond the approved mock).

## 2. Font loading plan (§fonts)

Add to snippets/head.njk, before the stylesheet link:

- `<link rel="preconnect" href="https://fonts.googleapis.com">`
- `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
- css2 link: Source+Serif+4:opsz,wght@8..60,400;8..60,600 |
  Source+Sans+3:wght@400;600 | JetBrains+Mono:wght@400;600, display=swap

tailwind.config.js fontFamily:
- sans: ['Source Sans 3', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif]
- serif: ['Source Serif 4', 'Iowan Old Style', Georgia, serif]  (display serif)
- display: ['Source Serif 4', 'Iowan Old Style', Georgia, serif] (re-point from Cormorant — Cormorant was never network-loaded; V2b display IS Source Serif 4)
- mono: ['JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace]

Custom layer (src/scss/tailwind.css): body font-family moves to Source Sans 3
(sans body per V2b); .display uses the serif stack; fallbacks ship regardless.

VERIFICATION RULE: fonts count as loaded only with rendered/network proof
(document.fonts.check or a fetched woff2), never by link-tag presence.

## 3. Per-template change list (§templates)

1. snippets/head.njk — Google Fonts links (above).
2. tailwind.config.js — token hex table §1 + fontFamily §2. Safelist entries,
   content globs, .twscan: UNTOUCHED.
3. src/scss/tailwind.css (custom layer) — body → Source Sans 3; .display →
   Source Serif 4; #progress stays teal gradient; .hero-title/.atlas-hero-bg
   rules die with the old hero; NEW editorial components: .eyebrow (mono,
   11px, letter-spacing .2em uppercase, fg-3), .pce-panel (white card, soft
   deep-teal shadow, radius 18), .pce-bar (chart column), .pce-dot;
   .btn-primary → teal gradient pill. Bootstrap-compat rules untouched.
4. src/index.njk — full rebuild to the approved layout:
   - eyebrow kicker "OPEN CELTIC KNOWLEDGE SYSTEM" (rule dash + mono)
   - serif h1 "Preserve the past. / Build the tradition." (second phrase teal)
   - deck paragraph + teal-rule sub-line
   - actions: Contribute pill (teal gradient, crimson v0.2 badge) +
     "Browse the PCE" ghost pill
   - PCE panel card: window dots (teal-2/amber/coral), mono label
     "PCE · VOLUME A · LIVE", "ENCYCLOPEDIA ENTRIES · GROWING", 12 rising
     bars (pure CSS divs, teal gradient, later bars deeper), legend
     ENTRIES/SOURCES/REVIEW
   - six feature cards on light teal-wash gradient, deep-teal headings;
     mock copy is approved copy ("Credit preserved" replaces "Glory to the
     Empire!")
   - Documentation/Credits band restyled as paper cards; all real links kept
     (license, PCE commits, bibliography, /docs, editing docs, markdown,
     GitHub org, gumroad contribute)
   - mobile (≤960px / ≤600px): hero grid single column, legend wraps,
     panel padding 18px + chart 120px (port the mock's @media rules)
5. snippets/navbar.njk — light sticky nav: paper bg + blur, deep-teal
   wordmark "OpenOrdú", REAL logo.svg in the svg-with-image slot (no filter —
   asset is already teal #46bd87), links fg-2 → deep hover, Contribute pill
   with v0.2 badge. Search form + data-bs-toggle collapse + all route URLs
   preserved.
6. snippets/footer.njk — deep-teal (#0f4c33) footer: brand col + Quick Links
   + Social Media + Contact + DISCLAIMER (all original links survive),
   #0c3a27 colophon strip. GAF-308 mobile-stack grid classes PRESERVED
   exactly (col-span-12 base + md: breakpoints) — t308 probe gate.
7. Inner pages: inherit via tokens only (T6 contrast spot-checks).

## 4. Bone-on-light audit (§bone-audit)

Full repo audit of non-hover text-bone usage (14 instances, grep-verified):

- layouts/*:28,33 footer wrappers — on bg-earth (dark deep-teal). SAFE: bone
  stays light text on dark.
- snippets/navbar.njk:11, navbar-with-side.njk:8,14, quiz.njk:22 (commented),
  footer.njk:82 colophon (bg-moss dark), tagslist.njk:4 + tags.njk:26 +
  editthispage.njk:1 (bg-moss pills/buttons) — all on dark teal surfaces. SAFE.
- hover:text-bone instances (post/prevnext/tagslist buttons) — only render
  on bg-moss hover. SAFE.
- src/index.njk:12 `h1.display.hero-title.text-bone` — the ONLY bone-on-light
  conflict: it sat on the dark atlas-hero-bg plate, which T3 DELETES. The new
  light hero renders this headline on paper → the h1 must flip to ink
  explicitly in the T3 rebuild. RESOLVED BY REBUILD (no blind hex flip).
- bone hex re-point (#f2f7f4 → #f2fbf7) touches only dark-surface text.
  No contrast regression possible from the hex move itself.

## 5. Logo directive (byte-identical contract)

- src/assets/logo.svg — navbar cross (real woven Brigid's cross, teal
  #46bd87). Used in navbar via the existing svg-with-image pattern; the old
  `svg.small-logo-white` invert filter is DROPPED for the light nav (asset
  already teal on paper — no filter needed).
- src/assets/green_logo.svg — homepage hero emblem if the approved layout
  needs a hero emblem slot; current approved render shows the cross only in
  the nav, so green_logo stays in head.njk favicon + og:image only.
- src/assets/green_logo.png — favicon/og unchanged.
- Proof: sha256 of all three before (T1 baseline) and after (T7) — must match.
  If a template needs a light-background variant, style the SURROUNDING
  element, never the asset.

Baseline sha256 (T1, re-measured at exit):
- logo.svg        d6d5589d22724923de9022226f4825bd721b2c89d40d1b47ed54c912b60595e0
- green_logo.svg  56a9321158e427b4abbd8411b56d476249d36efe5d3b30cdafb45c2a830a3a32
- green_logo.png  9bc8f19724e10e1c2861c2597cfad3838ffdafec16c7cac49f690e563bc36302

## 6. Ban list (GAF-308 lineage)

No purple/indigo hexes anywhere. No letter-spacing >.05em on body text
(eyebrow/label mono letter-spacing per mock is display furniture, not body).
Gradients ≤3 stops in text. No AI-generated emblems. No plugin edits
(markdown-it-ordu/quiz/tips scope-locked). No safelist removal.
