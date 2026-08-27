# T11 — 5-Variant Judge (deslop Phase 1b: two-axis rubric)

GAF-276 Bootstrap→Tailwind re-skin · deslop-web-design 5→3→1 · Measure + narrow
Author: Herman · tick 10 · 2026-08-26
Method: `measure-variants.py` (objective pixels) + gemini-vision two-axis
rubric (distinctiveness × credibility) for a polytheist/researcher audience.
Variant 5 captured at a scrolled position — its hero is a `position:sticky;
height:100vh` pinned-atlas rail behind IntersectionObserver reveal, so a bare
hero-viewport shot reads as a near-black slab (the known "blank full-page
screenshot" artifact, deslop pitfall) and must NOT be penalized for it.

## Objective metrics (measure-variants.py, staged distinct basenames)

| Variant | ink% | bands | bigWS | lefts | stdL | motion% | scroll | ovf |
|---|---|---|---|---|---|---|---|---|
| V1 Reading Room | 3.06 | 11 | 3 | 14 | 238.4 | 0.00 | 4.5 | d0/m1 |
| V2 Museum Catalogue | 3.02 | 6 | 2 | 15 | 460.8 | 0.00 | 5.0 | d0/m1 |
| V3 Printed Archive | 3.26 | 17 | 2 | 17 | 240.4 | 0.00 | 4.2 | d0/m1 |
| V4 Folk Craft | 4.06 | 11 | 2 | 16 | 260.3 | 0.68* | 4.5 | none |
| V5 Animated Atlas | (hero dark slab) | 0@hero | — | — | — | 0.53` | 10.4 | d0/m1 |

*V4 motion 0.68% from the staged pass is the marquee edge; source confirms
`@keyframes stitch-scroll` (44s marquee) + scroll parallax on `[data-parallax]`
motifs + kinetic-type reveal on one word — real motion, wired in source.
`V5 source confirms scroll-driven pinned atlas (sticky rail + JS index on
scroll progress) + IntersectionObserver reveal; 0.53% motion measured mid-scroll.
V1/V3 are the DELIBERATE static/print extremes (corpus register) — motion 0 is
correct for them, not a defect.

Banned-purple audit: zero hits of #6366f1/#818cf8/#4f46e5/#7c3aed/#8b5cf6/#a855f7 across all 5.
JS errors: 0/5. Overlap: V5 reports 3 collisions (DIV.atlas-panel × H3.display) —
this is the pinned-atlas grid stack at capture; structural, verify at T21.

## Two-axis rubric (gemini vision, cultural-heritage reference register)

| Variant | Distinctiveness | Credibility | Read | Verdict |
|---|---|---|---|---|
| V1 Reading Room | 9 | 9 | illuminated-manuscript parchment/serif, artisan, calm | STRONG |
| V2 Museum Catalogue | 7 | 9 | clean minimalist; "Object of the Day" gradient box reads sterile | WEAKEST (D=7) |
| V3 Printed Archive | 9 | 9.5 | sterile academic print, CC/ISSN/provenance, maximal trust | STRONG |
| V4 Folk Craft | 9 | 10 | refined scholarly, muted academic, .org mission, real motion | STRONG |
| V5 Animated Atlas | 9 | 10 | manuscript-meets-modern-library, shelfmark/MS-000, learned motion | STRONG |

V1 "CelticPaganism.or" cut-off from gemini was a capture artifact — verified at
1440px the h1 renders full "CelticPaganism.org", no overflow (rectW 771, overflowX
false). Not a defect.
V4/V5 "fragmented title" reads = the INTENDED kinetic-type / two-tone reveal,
not slop.

## 5 → 3 narrowing (highest floor across BOTH axes — deslop rule)

Winner is the highest FLOOR, not the highest peak; 9/4 loses to 9/9. Every
variant here is high (9-10), so narrow on distinctiveness floor + register
spread + keeping the motion axis:

1. **V5 Animated Atlas (9/10)** — KEEP. Learned motion extreme (pinned atlas,
   scroll-progress), most distinct energy; the site-only motion-heavy voice.
2. **V4 Folk Craft (9/10)** — KEEP. Warm folk extreme, real marquee/parallax/
   kinetic motion, 10 credibility. Best of the motion pair for cultural warmth.
3. **V3 Printed Archive (9/9.5)** — KEEP. The static/print extreme, highest
   structure (17 bands) + top credibility (9.5); the "trust the record" anchor
   of the register and the required calm/static corner.

DROP V1 (9/9) — strong but redundant: it is a SECOND static/print read that
under-differentiates from V3 in the same register, and V3 does "quiet reference
trust" better (17 vs 11 bands, 9.5 vs 9 credibility).
DROP V2 (7/9, in it 2) — distinctiveness floor 7 is the clear loser; the
minimalist museum reads closest to generic, and its candidate exotic feature
("Object of the Day" gradient placeholder) reads sterile.

## →1 recommendation (provisional — T12 confirms with Christopher, a HARD GATE)

If forced, recommend **V5 Animated Atlas** as the headline (highest
distinctiveness ceiling, learned-motion voice that best separates OpenOrdú from
the old generic Bootstrap shell) with **V4 Folk Craft** as the warmth fallback
and **V3 Printed Archive** as the calm/static alternative. BUT the plank gate is
explicit: Christopher picks from REAL rendered URLs (T12) — this is documented
evidence, not a decision. Present V3/V4/V5 URLs to Christopher at T12.

## Evidence saved
- Objective: /tmp/t11-real/*.png (hero/mid/deep/m0/m1 per variant)
- This file: src/preview/t11-judge.md
- Staged distinct-basename measurement: gates/stage_measure.py (prints MEASURED_5)
