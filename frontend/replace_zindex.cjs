const fs = require('fs');

const zMap = {
  10: 'var(--z-sticky)',
  20: 'var(--z-sticky)',
  50: 'var(--z-sticky)',
  100: 'var(--z-sticky)',
  999: 'var(--z-dropdown)',
  1000: 'var(--z-dropdown)',
  1001: 'var(--z-fixed)',
  1002: 'var(--z-fixed)',
  1200: 'var(--z-fixed)',
  9999: 'var(--z-modal)',
  10000: 'var(--z-modal)',
  10001: 'var(--z-popover)',
  10002: 'var(--z-popover)',
  11000: 'var(--z-tooltip)',
};

function getFiles(dir, files_) {
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else if (name.match(/\.(jsx|js|tsx|ts)$/)) {
      files_.push(name);
    }
  }
  return files_;
}

const files = getFiles('./src');

let modifiedFilesCount = 0;
let zReplacements = 0;

files.forEach(file => {
  if (file.includes('globals.css') || file.includes('variables.css')) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace zIndex: number or 'number'
  content = content.replace(/(zIndex:\s*)['"]?(\d+)['"]?/g, (match, prefix, val) => {
    const num = parseInt(val, 10);
    // If it's 10 or more, and we have it in zMap, we replace it.
    // If it's not in zMap but it's massive (like 99999), just cap it to --z-tooltip
    if (num >= 10) {
      if (zMap[num]) {
        zReplacements++;
        return `${prefix}'${zMap[num]}'`;
      } else if (num > 1000) {
        // Fallback for random huge z-indexes not explicitly in map
        zReplacements++;
        return `${prefix}'var(--z-tooltip)'`; 
      }
    }
    return match; // Leave small ones like zIndex: 1, 2, 3 alone
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedFilesCount++;
  }
});

console.log(`Modified ${modifiedFilesCount} files. Replaced ${zReplacements} global z-index variables.`);
