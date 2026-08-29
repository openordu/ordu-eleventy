const fs = require('fs').promises;
const path = require('path');
const simpleGit = require('simple-git/promise');  // use the Promise version of simple-git
const fse = require('fs-extra');  // use fs-extra for additional file system operations
const os = require('os');  // use os module to create temporary directories

// recursively scan directories for .json files
async function scanDir(directory) {
  const files = await fs.readdir(directory);

  for (let file of files) {
    const filePath = path.join(directory, file);
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      await scanDir(filePath);
    } else if (filePath.endsWith('.json')) {
      await processJsonFile(filePath);
    }
  }
}

// process a .json file
async function processJsonFile(file) {
  const data = JSON.parse(await fs.readFile(file));

  // Check for 'tags' key and that it is an array with at least one value
  if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
    if (data.vcsurl) {
      const git = simpleGit();
      const directory = path.dirname(file);

      // If vcsbranch is specified, use it. Otherwise default to 'main'
      const branch = data.vcsbranch || 'main';

      try {
        // create a temporary directory
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'clone-'));

        // clone into the temporary directory
        await git.clone(data.vcsurl, tmpDir, ['-b', branch]);

        // get the files in the temporary directory
        const files = await fs.readdir(tmpDir);

        // filter out dotfiles
        const nonDotfiles = files.filter(file => !file.startsWith('.'));

        // move each non-dotfile to the target directory
        for (let nonDotfile of nonDotfiles) {
          const srcPath = path.join(tmpDir, nonDotfile);
          const destPath = path.join(directory, nonDotfile);
          await fse.move(srcPath, destPath, { overwrite: true });
        }

        console.log(`Successfully cloned ${data.vcsurl} into ${directory}`);
      } catch (err) {
        console.error(`Failed to clone ${data.vcsurl} into ${directory}:`, err);
      }
    }
  }
}

// start the process
scanDir('./src/').catch(console.error);
