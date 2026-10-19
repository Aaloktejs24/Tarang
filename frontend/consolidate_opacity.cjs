const fs = require('fs');

const replaceMap = {
  'var(--opacity-2xs)': 'var(--opacity-sm)',
  'var(--opacity-xs)': 'var(--opacity-sm)',
  'var(--opacity-sm)': 'var(--opacity-sm)',
  'var(--opacity-md)': 'var(--opacity-sm)',
  'var(--opacity-lg)': 'var(--opacity-md)',
  'var(--opacity-xl)': 'var(--opacity-md)',
  'var(--opacity-2xl)': 'var(--opacity-lg)',
  'var(--opacity-3xl)': 'var(--opacity-lg)'
};

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
  if (file.includes('globals.css') || file.includes('variables.css')) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  Object.keys(replaceMap).forEach(oldVar => {
    // Escape parenthesis for regex
    const oldVarEscaped = oldVar.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const regex = new RegExp(oldVarEscaped, 'g');
    content = content.replace(regex, (match) => {
      // Avoid replacing if it's already the target and we are processing it, but since
      // we only match oldVar EXACTLY, it will replace "--opacity-sm" with "--opacity-sm" 
      // which is harmless.
      if(oldVar !== replaceMap[oldVar]) replacedCount++;
      return replaceMap[oldVar];
    });
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files.`);
console.log(`Replaced ${replacedCount} opacity variables.`);
