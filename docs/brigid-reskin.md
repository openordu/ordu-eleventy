# Brigid Reskin — Design Token Spec (GAF-308)

Authoritative spec for the atlas→Brigid re-skin. T4-T8 implement EXACTLY this.
Mechanism: GAF-276 T17 precedent — semantic token NAMES never change (224+
template color-class instances keep resolving); HEXES re-point.

## 1. Brand colors (locked)

| Role | Hex | Notes |
|---|---|---|
| Brand teal (logo) | `#46bd87` | LOCKED to logo.svg fill. Brand moments only: large display accents, borders, rules, badges, progress bar. |
| Deep teal (text-role) | `#1f7a53` | AA derivation: #46bd87 on white = 2.36:1 (FAIL). #1f7a53 = 5.29:1 (AA PASS). All teal TEXT on white uses this. |
| Deep teal (nav/footer bg) | `#0f4c33` | White/bone text on it = 9.99:1. Footer + nav backgrounds. |
| Crimson accent | `#b52f0d` | 6.22:1 on white. SPARING: hover states + ONE accent per view (hero version badge). |
| Ink (text) | `#1c1e1c` | Body text on white. |
| Page base | `#ffffff` | html/body background. |
| Light surface | `#f4f7f5` | Raised panels/cards on white. |
| Muted | `#5c6e64` | Muted text/borders. 5.43:1 on white. |
| Bone (light text on dark) | `#f2f7f4` | ONLY inside dark zones (atlas hero, deep-teal footer/nav). |

## 2. Zone discipline (the core rule)

The home hero sits ON the dark atlas plate (`atlas-hero-bg` — KEEP DARK, B4).
Two zone types exist; text classes must match their zone:

- DARK zones (atlas-hero-bg hero section, deep-teal nav/footer): light text
  (`text-bone` #f2f7f4 stays legal HERE).
- WHITE zones (all body content): dark text. `text-bone` in body-content
  snippets (maincontent*.njk, postcontent.njk, postloop.njk, tagncatsloop.njk,
  maincontent-topic/details/pce.njk, code.njk) MUST be dropped or flipped to
  inherit-ink — light-on-white is invisible.

T7 census (grep, 2026-08-29): text-bone ×75, bg-peat ×24, bg-moss ×29,
bg-mist ×17, text-peat ×12, bg-gold ×9, text-gold ×9, bg-bone ×4, text-moss ×4,
text-mist ×8. Apply the token map below per instance; zone rule overrides
where hero/footer content differs from body content.

## 3. Token map (tailwind.config.js — T4)

| Token | V5 (old) | Brigid (new) |
|---|---|---|
| ink | #efe7d3 | #1c1e1c |
| paper | #141412 | #ffffff |
| moss | #6c7a44 | #1f7a53 (CTA buttons: bg-moss → deep teal, white/bone text) |
| earth | #8f6d1e | #0f4c33 (nav/footer bg token) |
| ochre | #c39a3a | #46bd87 (accents, badges, brand moments) |
| peat | #1c1b17 | #f4f7f5 (raised panels → light surface) |
| mist | #a9a293 | #5c6e64 (muted text/borders) |
| bone | #d8cfb7 | #f2f7f4 (light text — dark zones only, see §2) |
| gold (alias) | #c39a3a | #46bd87 |
| gold-deep (alias) | #8f6d1e | #1f7a53 |
| peat-2 (alias) | #25231e | #eef2ef |
| peat-3 (alias) | #141412 | #ffffff |
| crimson (NEW) | — | #b52f0d |

## 4. Custom CSS block (src/scss/tailwind.css — T5)

- html/body: background #ffffff, color #1c1e1c. Kill the gold/moss
  radial-gradient wash (or re-tint at rgba(70,189,135,.05) — prefer REMOVE).
- ::selection: rgba(70,189,135,.25), color ink.
- #progress: linear-gradient(90deg, #1f7a53, #46bd87); box-shadow
  rgba(70,189,135,.5).
- #splash-screen: background #ffffff.
- .display: letter-spacing 0 (was -.01em — B2).
- .hero-title: line-height 1.05 (was .9 — B2), letter-spacing 0 (was
  -.02em/-.025em at usage sites). Keep the clamp(3.4rem,10vw,8rem) size.
- .rule: rgba(28,30,28,.14). .rule-gold → .rule-teal semantics: gradient
  #46bd87.
- .plate / .plate-deep: light gradients (#ffffff→#f4f7f5), soft shadow.
- .btn-primary: background #1f7a53, color #f2f7f4; hover background #0f4c33.
- .btn-ghost: color #1f7a53; hover color #b52f0d (crimson hover — sparing).
- .atlas-hero-bg: UNCHANGED (B4 — dark plate stays, incl. its bg imagery).
- Any remaining V5 hexes in this file (incl. _variables-theme.scss,
  _style-theme.scss via T6): replaced per map. _style-theme.scss
  letter-spacing:-.02rem → 0.

## 5. Typography repair (B2 — binding numbers)

- Display sizes (.display, .hero-title): line-height >= 1.05; letter-spacing
  >= 0. Zero negative tracking on display text.
- Template scrub (T7): remove `tracking-tight`/`tracking-tighter` utilities
  from ALL templates (8 files carry them: code.njk, maincontent-topic.njk,
  postcontent.njk, maincontent.njk, postloop.njk, maincontent-pce.njk,
  tagncatsloop.njk, maincontent-details.njk). tracking-normal or remove.
- Body text: Tailwind default leading; no change.

## 6. Hero emblem (B3)

- REMOVE `<img src="/assets/hero-emblem.png" ... mix-blend-mode: screen>`
  from src/index.njk. PLANK: screen blend on dark was the only thing making
  the old asset visible; do NOT carry blend modes over.
- REPLACE with the teal Brigid's cross: `<img src="/assets/green_logo.svg">`
  (verify its fill is #46bd87 family first; if it is a stale color, derive
  assets/brigid-cross.svg from logo.svg paths instead — never recolor
  logo.svg itself).
- width ~10em, mx-auto, alt "Brigid's cross — OpenOrdu emblem", no blend
  mode. Teal #46bd87 on the dark atlas plate = 7.80:1 (visible, no blend
  needed).
- Hero title accent: `<strong class="text-gold">` → renders #46bd87 via the
  alias (brand moment on dark — 7.80:1). Keep the class, the map re-colors it.
- Hero version badge (v0.2): bg-gold→#46bd87 + text-peat→... make it THE one
  crimson accent per view: bg #b52f0d, white text (6.22:1).

## 7. Hard keeps (B6 — audit list)

- src/assets/logo.svg, src/assets/green_logo.png: byte-identical. NEVER edit.
- tailwind.config.js safelist + content globs (plugin scope-locks).
- GAF-276 pipeline gates: build-job override (ef7d8dc) + `test -s
  dev/css/theme.min.css` + rsync apk (678b1fb). Untouched.
- Plugin outputs (markdown-it-ordu/quiz/tips-bootstrap): safelist classes
  render via real utilities; no plugin file edits.
- PCE corpus layout; /pce/A/ wrinkle is PRE-EXISTING — out of scope.
- npm (not yarn) is the build package manager. Do not switch.

## 8. Verification anchors

- Grep gate B1: zero #c39a3a/#efe7d3/#8f6d1e/#1c1b17/#25231e/#141412 in
  tailwind.config.js + src/scss/tailwind.css + src/scss/themes/.
- Computed (T10/T13): h1.hero-title lh>=1.05, letter-spacing>=0 at 1440px AND
  390px; body bg #ffffff; atlas section still dark.
- Live (T13): home 200, theme.min.css contains #46bd87 tokens, zero gold hex,
  zero "hero-emblem", zero bootstrap strings (whitelist preserved).
