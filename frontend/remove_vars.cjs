const fs = require('fs');

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
let shadowRemovals = 0;
let radiusReplacements = 0;

files.forEach(file => {
  if (file.includes('globals.css') || file.includes('variables.css')) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace radius
  content = content.replace(/var\(--radius-xl\)/g, () => {
    radiusReplacements++;
    return 'var(--radius-lg)';
  });
  content = content.replace(/var\(--radius-2xl\)/g, () => {
    radiusReplacements++;
    return 'var(--radius-lg)';
  });

  // Remove box shadow completely from sx or style.
  // We match: boxShadow: 'var(--shadow-whatever)', (and maybe some whitespace/newlines)
  // Or boxShadow: "var(--shadow-whatever)"
  content = content.replace(/\s*boxShadow:\s*['"]?var\(--shadow-[^'"]+['"]?,?/g, () => {
    shadowRemovals++;
    return '';
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedFilesCount++;
  }
});

console.log(`Modified ${modifiedFilesCount} files. Removed ${shadowRemovals} box shadows. Replaced ${radiusReplacements} large radii.`);
