const fs = require('fs-extra');
const path = require('path');
const { execFileSync } = require('child_process');

/**
 * GAF-297 hotfix 3: git-aware fileModifiedDate.
 *
 * Old behavior: fs.stat().mtime. On CI the checkout stamps every file with the
 * BUILD time, so "last modified" rendered the build moment ("x seconds ago"
 * forever) and the timeAgo widget lied.
 *
 * New behavior, in priority order:
 *  1. git author date of the file in the site repo (cwd) — for template/source
 *     files that are tracked here.
 *  2. phase-a assembled content (src/content/<repo>/...) is an UNTRACKED copy
 *     of the <repo> content submodule. Map back to the sibling submodule
 *     checkout (../<repo>/<rest>) and read its last commit author date. On CI
 *     GIT_SUBMODULE_STRATEGY=recursive gives those checkouts full history.
 *  3. fs.stat().mtime fallback (untracked local scratch, no git) — page still
 *     renders, worst case shows the local copy time.
 *
 * Results are cached per path. Date is the commit AUTHOR date (%cI) — the
 * moment the content was written, stable across machines.
 */
module.exports = () => {
  const cache = new Map();

  function gitDate(repoDir, relPath) {
    try {
      const iso = execFileSync(
        'git',
        ['log', '-1', '--format=%cI', '--', relPath],
        { cwd: repoDir, encoding: 'utf8' }
      ).trim();
      return iso ? new Date(iso) : null;
    } catch (e) {
      return null;
    }
  }

  return async (filePath, callback) => {
    try {
      if (!cache.has(filePath)) {
        let d = gitDate(process.cwd(), filePath);
        if (!d) {
          // phase-a mapping: src/content/<repo>/<rest> -> ../<repo>/<rest>
          const m = filePath.match(/^src\/content\/([^/]+)\/(.+)$/);
          if (m) {
            const subRepo = path.resolve(process.cwd(), '..', m[1]);
            d = gitDate(subRepo, m[2]);
          }
        }
        cache.set(filePath, d);
      }
      const fromGit = cache.get(filePath);
      if (fromGit) {
        callback(null, fromGit);
        return;
      }
      const fullPath = path.join(process.cwd(), filePath);
      const stats = await fs.stat(fullPath);
      callback(null, stats.mtime);
    } catch (error) {
      callback(error);
    }
  };
};
