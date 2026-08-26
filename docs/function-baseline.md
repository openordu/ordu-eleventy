# OpenOrdú (ordu-eleventy) — Function-Parity Baseline

> GAF-276 tick 1 (T1/T3). Written BEFORE any design line. This is the reference
> against which the Tailwind redesign is verified. Live-proof recorded first:
> `curl -sI https://ordu.dev-k8s.cgodwin.io` → HTTP/2 200 (tick 0, verified 2026-08-26).

## 1. Route / page inventory (function-parity set)

| Route | Template | Notes |
|---|---|---|
| `/` | src/index.njk (home layout) | hero, cards, latest content |
| `/blog` | src/blog.njk | post listing |
| `/category/`, `/categorylist` | src/category.njk, categorylist.njk | category index |
| `/tags/`, `/tagslist` | src/tags.njk, tagslist.njk | tag index |
| `/support` | src/support.njk | support / alert page |
| `/about` | src/about.md | static prose |
| `/license` | src/license.md | static prose |
| `/merch` | src/merch.md | static prose |
| `/FAQs` | src/FAQs.md | static prose |
| `/pce` | pce layouts (topic/pce/maincontent-pce) | Public Celtic Encyclopedia entries |
| `/quiz` | quiz layouts | quiz posts |
| `/search-index.json` | src/search-index.json.njk | elasticlunr index (collections.all \| search) |
| `/sitemap.xml` | src/sitemap.njk | sitemap |
| posts | src/posts/ + layouts/post, code, topic | content entries |
| docs | src/docs/ | documentation pages |

Layouts under `src/_includes/layouts/`: default, home, blog, post, code, topic,
pce, quiz, test. Snippets under `src/_includes/snippets/`: navbar, footer,
sidebar, breadcrumbs, toc, postloop, prevnext-*, maincontent-*, editthispage,
categorylist, catlist, tagslist, tagncatsloop, category-and-tag-pills, svg,
quiz-footer, postcontent, blogsidebar, navbar-with-side, navbar.backup.

## 2. Navigation (eleventy-navigation plugin)

Navbar (`snippets/navbar.njk`) links — order + labels:
1. Home — `/` (fa-house)
2. PCE — `/pce` (fa-book)
3. About — `/about` (fa-circle-info)
4. Blog — `/blog` (fa-blog)
Plus: search input (id `search-input`, elasticlunr), brand logo
(`assets/logo.svg`, `metadata.logotitle`), collapsible mobile menu
(data-bs-toggle collapse, `#navbarSupportedContent`).

Sidebar (`snippets/sidebar.njk`): secondary nav + dropdown.
Breadcrumbs: `snippets/breadcrumbs.njk` + `snippets/maincontent-*.njk`.

## 3. Search (elasticlunr)

- `src/js/elasticlunr.js` + `elasticlunr.min.js` (vendored).
- Input `#search-input` → suggestions dropdown `#search-suggestions`
  (search-suggestions safelist class in purgecss).
- Index generated at `/search-index.json` from `collections.all | search`
  (filter `src/_11ty/filters/searchFilter.js`).
- **Function-parity requirement:** search must still work after redesign —
  elasticlunr JS untouched, index route preserved, input ids preserved.

## 4. RSS / feed

- `@11ty/eleventy-plugin-rss` loaded in `.eleventy.js` (feed permalinks
  configurable). `src/sitemap.njk` → `/sitemap.xml`.
- RSS plugin retained in redesign (feed generation is content-layer).

## 5. Components — Bootstrap classes in use (structural)

| Component | Templates | Key classes |
|---|---|---|
| Grid | nearly all | `container`, `row`, `col-*` |
| Navbar | navbar.njk, navbar-with-side.njk, sidebar.njk, navbar.backup.njk | `navbar navbar-expand-lg navbar-light navbar-toggler navbar-collapse navbar-nav nav-item nav-link navbar-brand`, `collapse`, `dropdown` |
| Card | src/index.njk | `card` |
| Button | btn across snippets (postloop, prevnext-*, tagslist, etc.) | `btn btn-primary` etc. |
| Badge | tagslist, categorylist, category-and-tag-pills, index | `badge bg-* rounded-pill` |
| Breadcrumb | breadcrumbs.njk, maincontent-* | `breadcrumb` |
| Alert | src/support.njk | `alert` |
| Table | svg.njk (usage) | `table` |
| Pagination | postloop.njk, tagncatsloop.njk, blog/category/tags | `pagination`, `page-item`, `page-link` |
| Spacing/utility | everywhere | `p-*`, `m-*`, `px-*`, `py-*`, `mt-*`, `mb-*`, `d-*`, `text-*`, `bg-*`, `mx-*` |

**Per-template structural-class counts** (baseline reference; col-/container/
row/card/navbar/btn tokens, not raw class= count):
- src/index.njk: 41 (heaviest — home hero + card grid)
- src/support.njk: 22
- snippets/footer.njk: 17
- layouts/post.njk: 17
- snippets/postloop.njk: 13
- snippets/navbar-with-side.njk: 13, navbar.njk: 12 (same nav structure)
- snippets/quiz-footer.njk: 9, prevnext-*: 9 each, maincontent-pce.njk: 0 structural
- Full machine inventory (39/45 njk templates contain Bootstrap tokens) recorded
  in the tick artifact; this document is the human-readable parity contract.

## 6. Deps / build chain to touch

- `bootstrap@5.1.3` + `bootstrap-icons@1.8.1` → remove (T5).
- `node-sass@7.0.1` (devDep) + `gulp-dart-sass`, `gulp-clean-css` — gulp sass
  task compiles `src/scss/theme.scss` → `src/css` (gulpconfig paths.dev=src).
- `gulp-purgecss` (devDep) + purgecss gulp task (safelist above) → remove (T14).
- `@11ty/eleventy-plugin-syntaxhighlight` — already COMMENTED OUT in
  `.eleventy.js` (line: `// eleventyConfig.addPlugin(eleventyPluginSyntaxHighlighter)`)
  → confirm and drop dep if nothing references it (T5).
- `theme.min.css` output: gulp `inject-min-css` → `/css/theme.min.css` html-replace.
  Tailwind MUST produce this same path (EC2).
- Icon fonts: Font Awesome (`_font-awesome.scss` + `fa-*` classes) + inline svg
  (snippet/svg.njk). Logotitle + brand use svg. Cascade decision recorded T5:
  which FA icons remain vs inline svg.

## 7. Plugin-generated Bootstrap classes (scope-lock — do NOT edit plugins)

markdown-it-ordu / markdown-it-quiz / markdown-it-tips-bootstrap emit Bootstrap
markup from the CONTENT layer. These packages are OUT OF SCOPE (scope lock).
The redesign MUST safelist/style their rule-generated classes in Tailwind
whitelist — not delete the plugin rules. Affected: quiz, tips, tabs content.
Grep gate (T20) must account for these (exclude node_modules + _site/dev
build output; source-of-truth = src/ authored classes).

## 8. Exit-parity contract

After redesign, ALL of the above must still be present and working:
same routes (no 404s), nav order + labels, search produces results, sitemap.xml
served, cards/grid/pagination/badges functional, plugin content skins cleanly.
Live site must be HTTP 200 serving the NEW Tailwind `theme.min.css` with zero
Bootstrap class refs in src/ authored code.