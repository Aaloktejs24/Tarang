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
const stats = {
  borderRadius: {},
  fontSize: {},
  boxShadow: {},
  zIndex: {}
};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find borderRadius that do not contain var(
  const radiusMatches = content.match(/borderRadius:\s*['"]?(?!var\()([^,'"}]+)['"]?/g);
  if (radiusMatches) {
    radiusMatches.forEach(m => {
      const val = m.split(':')[1].trim().replace(/['"]/g, '');
      if (val !== '0' && val !== 0 && !val.includes('theme.')) {
        stats.borderRadius[val] = (stats.borderRadius[val] || 0) + 1;
      }
    });
  }

  // Find fontSize that do not contain var(
  const fontMatches = content.match(/fontSize:\s*['"]?(?!var\()([^,'"}]+)['"]?/g);
  if (fontMatches) {
    fontMatches.forEach(m => {
      const val = m.split(':')[1].trim().replace(/['"]/g, '');
      if (!val.includes('theme.') && val !== 'inherit') {
        stats.fontSize[val] = (stats.fontSize[val] || 0) + 1;
      }
    });
  }

  // Find boxShadow that do not contain var(
  const shadowMatches = content.match(/boxShadow:\s*['"]?(?!var\()([^'"}]+)['"]?/g);
  if (shadowMatches) {
    shadowMatches.forEach(m => {
      const val = m.split(':')[1].trim().replace(/['"]/g, '');
      if (val !== 'none' && !val.includes('theme.')) {
        stats.boxShadow[val] = (stats.boxShadow[val] || 0) + 1;
      }
    });
  }
});

console.log("Remaining Hardcoded Border Radius:");
console.log(Object.entries(stats.borderRadius).sort((a,b) => b[1] - a[1]).slice(0, 15));

console.log("\nRemaining Hardcoded Font Size:");
console.log(Object.entries(stats.fontSize).sort((a,b) => b[1] - a[1]).slice(0, 15));

console.log("\nRemaining Hardcoded Box Shadow:");
console.log(Object.entries(stats.boxShadow).sort((a,b) => b[1] - a[1]).slice(0, 15));
