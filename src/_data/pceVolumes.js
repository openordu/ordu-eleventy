const fs = require("fs");
const path = require("path");

/**
 * GAF-297 hotfix 3: /pce/<X>/ alias pages.
 *
 * The PCE letter volumes physically emit at /content/pce/<X>/ (phase-a
 * assembles the pce submodule corpus under src/content/pce/<X>/ — moving the
 * emit path would churn 5k+ sitemap URLs, not worth it). But the PCE index
 * historically links (and humans type) /pce/<X>/. This global data file feeds
 * a Nunjucks template that emits a redirect stub at pce/<X>/index.html for
 * every single-letter volume dir found in src/content/pce/. Stub = meta
 * refresh + canonical + plain link fallback (JS-free, crawler-safe).
 */
module.exports = function () {
  const volumesDir = path.join(__dirname, "..", "content", "pce");
  try {
    return fs
      .readdirSync(volumesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^[A-Z]$/.test(d.name))
      .map((d) => d.name)
      .sort();
  } catch (e) {
    // corpus not assembled (bare submodule) — no aliases, build stays green
    return [];
  }
};
