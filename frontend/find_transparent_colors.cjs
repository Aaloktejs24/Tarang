const fs = require('fs');

function getFiles(dir, files_) {
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else if (name.match(/\.(jsx|js|tsx|ts|css)$/)) {
      files_.push(name);
    }
  }
  return files_;
}

const files = getFiles('./src');
const colors = {};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match exactly 8-character hex codes (including the hash) -> #RRGGBBAA
  const matches = content.match(/#[0-9a-fA-F]{8}\b/g);
  if (matches) {
    matches.forEach(m => {
      const lower = m.toLowerCase();
      colors[lower] = (colors[lower] || 0) + 1;
    });
  }
});

const sorted = Object.entries(colors).sort((a,b) => b[1] - a[1]);
console.log(`Found ${sorted.length} unique 8-character hex colors.`);
console.log(sorted);
