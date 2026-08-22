const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileP = promisify(execFile);

// rec()ssively scan directories for .json files
async function scanDir(directory) {
  const files = await fsp.readdir(directory);

  for (let file of files) {
    const filePath = path.join(directory, file);
    const stats = await fsp.stat(filePath);

    if (stats.isDirectory()) {
      await scanDir(filePath);
    } else if (filePath.endsWith('.json')) {
      await processJsonFile(filePath);
    }
  }
}

// process a .json file
async function processJsonFile(file) {
  const data = JSON.parse(await fsp.readFile(file));

  // Check for 'tags' key and that it is an array with at least one value
  if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
    if (data.vcsurl) {
      const directory = path.dirname(file);

      // If vcsbranch is specified, use it. Otherwise default to 'main'
      const branch = data.vcsbranch || 'main';

      try {
        // create a temporary directory
        const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'clone-'));

        // clone into the temporary directory (depth 1, single branch)
        await execFileP('git', ['clone', '--depth', '1', '--branch', branch, data.vcsurl, tmpDir]);

        // get the files in the temporary directory
        const files = await fsp.readdir(tmpDir);

        // copy ONLY top-level subdirectories (letter volumes A..Y); skip
        // dwarf dotfiles and apex files (.gitignore, markdown.py, index.sjson).
        for (const entry of files) {
          if (entry.startsWith('.')) continue;
          const srcPath = path.join(tmpDir, entry);
          const st = await fsp.stat(srcPath);
          if (!st.isDirectory()) continue;
          const destPath = path.join(directory, entry);
          await fsp.cp(srcPath, destPath, { recursive: true, force: true });
        }

        console.log(`Successfully cloned ${data.vcsurl} into ${directory}`);
      } catch (err) {
        console.error(`Failed to clone ${data.vcsurl} into ${directory}:`, err.message || err);
      } finally {
        try {
          await fsp.rm(tmpDir, { recursive: true, force: true });
        } catch (e) { /* best-effort cleanup */ }
      }
    }
  }
}

// start the process
scanDir('./src/').catch(console.error);