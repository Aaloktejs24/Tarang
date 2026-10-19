const fs = require('fs');

const replaceMap = {
  'var(--color-gray-50)': 'var(--color-slate-50)',
  'var(--color-gray-100)': 'var(--color-slate-100)',
  'var(--color-gray-200)': 'var(--color-slate-200)',
  'var(--color-gray-300)': 'var(--color-slate-300)',
  'var(--color-gray-400)': 'var(--color-slate-400)',
  'var(--color-gray-600)': 'var(--color-slate-600)',
  'var(--color-gray-700)': 'var(--color-slate-700)',
  'var(--color-gray-800)': 'var(--color-slate-800)',
  'var(--color-gray-900)': 'var(--color-slate-900)',
  'var(--color-light-gray)': 'var(--color-slate-200)'
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
    const regex = new RegExp(oldVar.replace(/\(/g, '\\(').replace(/\)/g, '\\)'), 'g');
    content = content.replace(regex, () => {
      replacedCount++;
      return replaceMap[oldVar];
    });
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files.`);
console.log(`Replaced ${replacedCount} gray variables.`);
