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
let fontReplacements = 0;

files.forEach(file => {
  if (file.includes('globals.css') || file.includes('variables.css')) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  content = content.replace(/var\(--font-2xs\)/g, () => {
    fontReplacements++;
    return 'var(--font-xs)';
  });
  
  content = content.replace(/var\(--font-md\)/g, () => {
    fontReplacements++;
    return 'var(--font-base)';
  });

  content = content.replace(/var\(--font-3xl\)/g, () => {
    fontReplacements++;
    return 'var(--font-2xl)';
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedFilesCount++;
  }
});

console.log(`Modified ${modifiedFilesCount} files. Replaced ${fontReplacements} font variables.`);
