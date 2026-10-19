const fs = require('fs');

const opacityMap = {
  '2.0%': 'var(--opacity-2xs)',
  '6.3%': 'var(--opacity-xs)',
  '8.2%': 'var(--opacity-sm)',
  '12.5%': 'var(--opacity-md)',
  '18.8%': 'var(--opacity-lg)',
  '25.1%': 'var(--opacity-xl)',
  '50.2%': 'var(--opacity-2xl)',
  '56.5%': 'var(--opacity-3xl)'
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

  Object.keys(opacityMap).forEach(pct => {
    // We want to replace e.g. " 12.5%," with " var(--opacity-md)," inside color-mix()
    // Specifically looking for exact match of " X%," in the codebase
    const regex = new RegExp(` ${pct},`, 'g');
    content = content.replace(regex, (match) => {
      replacedCount++;
      return ` ${opacityMap[pct]},`;
    });
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files.`);
console.log(`Replaced ${replacedCount} opacity percentages.`);
