/** @type {import('tailwindcss').Config} */
// GAF-276 openordu-bootstrap-tailwind-design-gauntlet
// T17: approved V5 "Animated Atlas" winner (deslop 5→3→1). The semantic
// token names from the T5 scaffold are KEPT so all 224 template color-class
// instances keep resolving; their hexes are re-pointed to the dark
// peat/bone/gold atlas (src/preview/variant-5/index.html :root).
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
        // V5 "Animated Atlas" palette. HARD RULE: no indigo/purple (ban-list
        // colors). Real hexes only. Semantic names retained from the
        // parchment baseline so existing template classes keep working:
        ink:    '#efe7d3',   // V5 bone — primary light text
        paper:  '#141412',   // V5 peat — page background (now dark)
        moss:   '#6c7a44',   // V5 moss — green accent (borders/CTAs)
        earth:  '#8f6d1e',   // V5 gold-deep
        ochre:  '#c39a3a',   // V5 gold — CTA accent
        peat:   '#1c1b17',   // V5 peat-2 — raised panels/headers
        mist:   '#a9a293',   // V5 mist — warm grey (borders/muted text)
        bone:   '#d8cfb7',   // V5 bone-2 — secondary light panels/text
        // Explicit V5 aliases (T17):
        gold:      '#c39a3a',
        'gold-deep': '#8f6d1e',
        'peat-2':  '#25231e',
        'peat-3':  '#141412'
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