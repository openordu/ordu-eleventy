/** @type {import('tailwindcss').Config} */
// GAF-313 openordu-v2b-editorial-home-gauntlet T2b: Brigid→V2b re-point.
// Mechanism (GAF-276 T17 / GAF-308 T4 precedent): semantic token NAMES are
// KEPT so all 224+ template color-class instances keep resolving; HEXES
// re-point to the V2b "Teal Editorial + PCE panel" palette
// (docs/v2b-reskin.md §1). Logo teal #46bd87 is LOCKED (brand moments only);
// text-role teal #1f7a53 (AA on white); #0f4c33 = deep-teal nav/footer bg;
// #b52f0d = crimson sparing accent (v0.2 badge).
module.exports = {
  content: [
    './src/**/*.njk',
    './src/_includes/**/*.njk',
    './src/**/*.html',
    './src/**/*.md',
    // GAF-276 T20 root-cause fix: the scope-locked plugins (markdown-it-ordu/
    // quiz/tabs/footnote/texmath) and PCE templates emit their markup at BUILD
    // time, after the content scan of src/ — every class that exists only in
    // plugin output (tab-content, nav-tabs, tab-pane, quiz option buttons,
    // carousel controls, katex scaffolding) purged out of the artifact. The
    // build runs eleventy BEFORE both tailwind passes (gulpfile build chain),
    // so scanning the built pages catches the real, final class vocabulary.
    // Negated globs are NOT supported in the v3 content array — the raw
    // dev/** glob would pull the 5 deslop /preview/ pages (which DESCRIBE
    // Bootstrap) back into the vocabulary. The build syncs dev pages minus
    // preview into this snapshot dir before the tailwind passes run.
    './.twscan/**/*.html'
  ],
  // PLANK: markdown-it-ordu/quiz/tips-bootstrap emit Bootstrap markup from
  // the CONTENT layer (unmodifiable scope-lock). Safelist the classes those
  // plugins generate so Tailwind keeps emitting them. (The separate gulp
  // pruning step that once guarded this list was removed at GAF-276 T14;
  // Tailwind's own purge is the only pruning pass now.)
  safelist: [
    // Non-Tailwind classes emitted by content-layer plugins or custom CSS
    // that must survive the Tailwind build (purge-safe). Only exact-string
    // entries: Tailwind v3 cannot emit utility classes it has no definition
    // for, so {pattern} wildcards of bare plugin classes correctly warn and
    // are omitted — those get skinned via real utilities at T13-T17.
    'shine', 'pulsate', 'sticky', 'search-suggestions',
    'list-group-item-danger', 'list-group-item-primary',
    'collapsed', 'collapse', 'active', 'show', 'collapsing',
    // T20: the shim's toggle state class — added/removed at RUNTIME by
    // tailwind-interactions.js (classList), invisible to every content glob.
    'hidden'
  ],
  theme: {
    extend: {
      colors: {
        // GAF-313 V2b palette (docs/v2b-reskin.md §1 token map). HARD RULE:
        // no indigo/purple (ban-list colors). Real hexes only. Semantic
        // token NAMES retained so existing template classes keep working;
        // hexes re-pointed to V2b. moss/earth/ochre/gold/gold-deep/peat-3/
        // crimson UNCHANGED (V2b maps teal→moss, deep→earth, teal-2→ochre).
        ink:    '#122019',   // V2b --fg — body text
        paper:  '#f7faf9',   // V2b --paper — page paper (body bg also via custom layer)
        moss:   '#1f7a53',   // deep teal — CTA buttons (bg-moss); V2b --teal
        earth:  '#0f4c33',   // deep-teal nav/footer bg token; V2b --deep
        ochre:  '#46bd87',   // brand teal — accents, badges, brand moments; V2b --teal-2
        peat:   '#f7faf9',   // raised panels → light raised surface (V2b --paper)
        mist:   '#3f554c',   // muted text/borders (V2b --fg-2; AA 8.1:1 on white)
        bone:   '#f2fbf7',   // light text — DARK zones only (docs/v2b-reskin.md §4 audit)
        // Explicit aliases (kept from Brigid T4):
        gold:      '#46bd87',
        'gold-deep': '#1f7a53',
        'peat-2':  '#eef4f2',   // V2b --paper-2
        'peat-3':  '#ffffff',   // white card surface (mock cards)
        crimson:   '#b52f0d',   // sparing accent (v0.2 badge, hover, one per view)
        // GAF-313 V2b additions (mock PCE panel + legend ONLY):
        teal:   '#1f7a53',   // V2b name → moss alias
        amber:  '#efac2e',   // panel dot + SOURCES legend only
        coral:  '#e7405e'    // panel dot + REVIEW legend only
      },
      fontFamily: {
        // V2b type system (docs/v2b-reskin.md §2): Source Sans 3 body (V2b
        // is a sans-body design), Source Serif 4 display serif (re-pointed
        // from the old display face, which was never network-loaded; V2b
        // display IS Source Serif 4), JetBrains Mono. Wired via Google
        // Fonts css2 link in head.njk (T2a).
        sans: ['Source Sans 3', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Source Serif 4', 'Iowan Old Style', 'Georgia', 'serif'],
        display: ['Source Serif 4', 'Iowan Old Style', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    }
  },
  plugins: []
};