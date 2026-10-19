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

const replaceMap = {
  '--color-primary-dark': '--theme-blue-dark',
  '--color-primary-light': '--theme-blue-light',
  '--color-primary': '--theme-blue',
  '--color-success-light': '--theme-green-light',
  '--color-success': '--theme-green',
  '--color-warning-light': '--theme-yellow-light',
  '--color-warning': '--theme-yellow'
};

files.forEach(file => {
  if (file.includes('variables.css')) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  Object.keys(replaceMap).forEach(oldVar => {
    // Regex matches the exact variable string to avoid replacing parts of other words
    const regex = new RegExp(oldVar.replace(/\(/g, '\\(').replace(/\)/g, '\\)'), 'g');
    let tempCount = (content.match(regex) || []).length;
    if (tempCount > 0) {
      replacedCount += tempCount;
      content = content.replace(regex, replaceMap[oldVar]);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files.`);
console.log(`Replaced ${replacedCount} color variables.`);
