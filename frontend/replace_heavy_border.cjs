const fs = require('fs');

function getFiles(dir, files_) {
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()) {
      if (!name.includes('node_modules') && !name.includes('.next')) {
        getFiles(name, files_);
      }
    } else if (name.match(/\.(jsx|js|tsx|ts|css)$/)) {
      files_.push(name);
    }
  }
  return files_;
}

const files = getFiles('./src');
let modifiedCount = 0;
let replacedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  let tempCount = (content.match(/4px solid/g) || []).length;
  if (tempCount > 0) {
      replacedCount += tempCount;
      content = content.replace(/4px solid/g, 'var(--border-heavy) solid');
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files.`);
console.log(`Replaced ${replacedCount} 4px border variables.`);
