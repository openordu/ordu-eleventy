# UPGRADE-NOTES — Eleventy 1.0.1 → 3.1.6 (GAF-296 T4)

Branch: upgrade/eleventy-3 (base b55e047). Every change is engine-compat only;
zero content edits. Parity re-verified at T6.

## Package changes (package.json)

| package | before | after | why |
|---|---|---|---|
| @11ty/eleventy | ^1.0.1 | 3.1.6 | the engine upgrade (loop mission) |
| @11ty/eleventy-plugin-rss | ^1.1.1 (inferred v1 line) | 2.0.4 | v2 is the Eleventy-3-era major; old filters removed |

Kept: @11ty/eleventy-plugin-syntaxhighlight 4.1.0 — already v3-compatible
(peerDeps empty; plugin majors only "as required by v3 compat" per plan T4).
markdown-it stack untouched (rids below the Eleventy API; story ground truth).

## Config fixes (.eleventy.js)

- `eleventyConfig.setDataDeepMerge(true)` REMOVED — the API was deleted in
  Eleventy 2.0 and deep data merge is the default since 2.0. Calling it is a
  v3 boot error. Behavior equivalent.

## Template fixes (src/feed.njk)

- `rssLastUpdatedDate` filter removed in rss plugin v2. Feed-level `<updated>`
  now: `collections.sortedPosts | getNewestCollectionItemDate | dateToRfc3339`
  with a `'now' | dateToRfc3339` fallback when the collection is empty.
- `rssDate` removed in v2. Per-entry `<updated>` now `post.date | dateToRfc3339`
  (Atom feed — RFC 3339 is the correct wire format here).

## Filter fix (src/_11ty/filters/searchFilter.js)

- `page.template.frontMatter.data.*` (sync monkey-patched internal getter)
  is not async-friendly and hard-errors on Eleventy 3 ("use the async read()
  method"). Replaced all 7 field reads with `page.data.*` — the v3-native
  merged data cascade on the collection item. Found by the second full-corpus
  attempt (render2.log); smoke re-proven green after the fix.

## Evidence

- Attempt-1 full-corpus render (2026-08-27 23:25, loop dir baseline-v2/) died
  on `rssLastUpdatedDate` — captured in render.attempt1-rssfail.log. That
  failure preceded the feed.njk fix by ~1 min (fix landed 23:26:37).
- Smoke render (8-page ordu-blog subset → /tmp/t4-smoke) exits 0 on v3.1.6,
  8 files written in 0.6s.
- Full-corpus v3 render is T5 (next task).

## Known risks carried to T5/T6

- category.njk / tags.njk pagination over nested collections.all — the exact
  shape that deterministically hung v1 (see baseline-v1/HANG-REPORT.md). v3's
  rewritten pagination engine is the remediation; T5 watches the pce→category
  transition point specifically.
- Full-corpus wall-clock + RSS measured at T5 for the T7 perf verdict.
