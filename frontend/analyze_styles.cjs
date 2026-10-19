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
  
  // Very basic regex to capture common hardcoded values in JSX
  const radiusMatches = content.match(/borderRadius:\s*['"]?([^,'"}]+)['"]?/g);
  if (radiusMatches) {
    radiusMatches.forEach(m => {
      const val = m.split(':')[1].replace(/['"\s]/g, '');
      stats.borderRadius[val] = (stats.borderRadius[val] || 0) + 1;
    });
  }

  const fontMatches = content.match(/fontSize:\s*['"]?([^,'"}]+)['"]?/g);
  if (fontMatches) {
    fontMatches.forEach(m => {
      const val = m.split(':')[1].replace(/['"\s]/g, '');
      stats.fontSize[val] = (stats.fontSize[val] || 0) + 1;
    });
  }

  const shadowMatches = content.match(/boxShadow:\s*['"]([^'"]+)['"]/g);
  if (shadowMatches) {
    shadowMatches.forEach(m => {
      const val = m.split(':')[1].replace(/['"\s]/g, '');
      stats.boxShadow[val] = (stats.boxShadow[val] || 0) + 1;
    });
  }
});

console.log("Border Radius Variations:");
console.log(Object.entries(stats.borderRadius).sort((a,b) => b[1] - a[1]).slice(0, 10));

console.log("\nFont Size Variations:");
console.log(Object.entries(stats.fontSize).sort((a,b) => b[1] - a[1]).slice(0, 10));

console.log("\nBox Shadow Variations:");
console.log(Object.entries(stats.boxShadow).sort((a,b) => b[1] - a[1]).slice(0, 10));
