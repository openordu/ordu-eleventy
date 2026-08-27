/** @type {import('tailwindcss').Config} */
// GAF-276 openordu-bootstrap-tailwind-design-gauntlet
// T5 scaffold. Palette here is the pre-design baseline (no indigo drift,
// real hexes). The deslop 5→3→1 winner (Opus5 via Claude Code, T9/T17)
// replaces these tokens; this file keeps the site building + purge-safe
// until then.
module.exports = {
  content: [
    './src/**/*.njk',
    './src/_includes/**/*.njk',
    './src/**/*.html'
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
    'collapsed', 'collapse', 'active', 'show', 'collapsing'
  ],
  theme: {
    extend: {
      colors: {
        // Cultural-heritage editorial baseline — earth/moss/peat/ochre.
        // HARD RULE: no indigo/purple (ban-list colors). Real hexes only.
        ink:    '#2b2826',   // warm near-black body text (heritage charcoal)
        paper:  '#faf7f0',   // warm parchment background
        moss:   '#4a5d43',   // muted Irish green (replaces bootstrap teal)
        earth:  '#6f5b3e',   // umber/tan (secondary, replaces $blue #4343cc)
        ochre:  '#a8783a',   // accent gold-ochre (CTA)
        peat:   '#3a3227',   // deep brown (headers/footer)
        mist:   '#e6e0d2',   // light warm grey (borders/serifs)
        bone:   '#fffdf7'    // card/bg highlight
      },
      fontFamily: {
        // Replace "inter" default. Heritage editorial serif body + display.
        sans: ['Georgia', 'ui-serif', 'serif'],
        display: ['Georgia', 'Palatino', 'ui-serif', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    }
  },
  plugins: []
};