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

const reverseMap = {
  '--theme-blue-dark': '--color-primary-dark',
  '--theme-blue-light': '--color-primary-light',
  '--theme-blue': '--color-primary',
  '--theme-green-light': '--color-success-light',
  '--theme-green': '--color-success',
  '--theme-yellow-light': '--color-warning-light',
  '--theme-yellow': '--color-warning'
};

files.forEach(file => {
  if (file.includes('variables.css')) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  Object.keys(reverseMap).forEach(oldVar => {
    const regex = new RegExp(oldVar.replace(/\(/g, '\\(').replace(/\)/g, '\\)'), 'g');
    let tempCount = (content.match(regex) || []).length;
    if (tempCount > 0) {
      replacedCount += tempCount;
      content = content.replace(regex, reverseMap[oldVar]);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files.`);
console.log(`Replaced ${replacedCount} color variables back to semantic.`);
