/** @type {import('tailwindcss').Config} */
// GAF-308 openordu-brigid-reskin-gauntlet T4: atlas→Brigid re-point.
// Mechanism (GAF-276 T17 precedent): semantic token NAMES are KEPT so all
// 224 template color-class instances keep resolving; HEXES re-point to the
// Brigid palette (docs/brigid-reskin.md §3). Logo teal #46bd87 is LOCKED
// (brand moments only); text-role teal #1f7a53 (AA 5.29:1 on white);
// #0f4c33 = deep-teal nav/footer bg; #b52f0d = crimson sparing accent.
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
        // GAF-308 Brigid palette. HARD RULE: no indigo/purple (ban-list
        // colors). Real hexes only. Semantic names retained from the
        // V5 baseline so existing template classes keep working
        // (docs/brigid-reskin.md §3 token map):
        ink:    '#1c1e1c',   // Brigid ink — body text on white
        paper:  '#ffffff',   // Brigid paper — page background (now white)
        moss:   '#1f7a53',   // deep teal — CTA buttons (bg-moss)
        earth:  '#0f4c33',   // deep-teal nav/footer bg token
        ochre:  '#46bd87',   // brand teal — accents, badges, brand moments
        peat:   '#f4f7f5',   // raised panels → light surface
        mist:   '#5c6e64',   // muted text/borders (5.43:1 on white)
        bone:   '#f2f7f4',   // light text — DARK zones only (atlas hero, teal footer/nav)
        // Explicit Brigid aliases (T4):
        gold:      '#46bd87',
        'gold-deep': '#1f7a53',
        'peat-2':  '#eef2ef',
        'peat-3':  '#ffffff',
        crimson:   '#b52f0d'   // NEW — sparing accent (hover, one per view)
      },
      fontFamily: {
        // V5 type system: Source Serif 4 body, Cormorant display,
        // JetBrains Mono. Wired via Google Fonts in head.njk.
        sans: ['Source Serif 4', 'Iowan Old Style', 'Georgia', 'serif'],
        display: ['Cormorant', 'Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    }
  },
  plugins: []
};