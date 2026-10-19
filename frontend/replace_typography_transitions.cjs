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
  if (file.includes('globals.css') || file.includes('variables.css')) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  const replacements = [
    // --- JSX Font Weights ---
    // 400
    { regex: /fontWeight:\s*400\b/g, replace: "fontWeight: 'var(--font-regular)'" },
    { regex: /fontWeight:\s*(['"])400\1/g, replace: "fontWeight: $1var(--font-regular)$1" },
    { regex: /fontWeight:\s*(['"])normal\1/g, replace: "fontWeight: $1var(--font-regular)$1" },
    
    // 500
    { regex: /fontWeight:\s*500\b/g, replace: "fontWeight: 'var(--font-medium)'" },
    { regex: /fontWeight:\s*(['"])500\1/g, replace: "fontWeight: $1var(--font-medium)$1" },
    
    // 600
    { regex: /fontWeight:\s*600\b/g, replace: "fontWeight: 'var(--font-semibold)'" },
    { regex: /fontWeight:\s*(['"])600\1/g, replace: "fontWeight: $1var(--font-semibold)$1" },
    
    // 700 / bold
    { regex: /fontWeight:\s*700\b/g, replace: "fontWeight: 'var(--font-bold)'" },
    { regex: /fontWeight:\s*(['"])700\1/g, replace: "fontWeight: $1var(--font-bold)$1" },
    { regex: /fontWeight:\s*(['"])bold\1/g, replace: "fontWeight: $1var(--font-bold)$1" },

    // --- CSS Font Weights ---
    { regex: /font-weight:\s*400/g, replace: 'font-weight: var(--font-regular)' },
    { regex: /font-weight:\s*normal/g, replace: 'font-weight: var(--font-regular)' },
    { regex: /font-weight:\s*500/g, replace: 'font-weight: var(--font-medium)' },
    { regex: /font-weight:\s*600/g, replace: 'font-weight: var(--font-semibold)' },
    { regex: /font-weight:\s*700/g, replace: 'font-weight: var(--font-bold)' },
    { regex: /font-weight:\s*bold/g, replace: 'font-weight: var(--font-bold)' },

    // --- Transitions ---
    { regex: /transition:\s*(['"])all 0\.2s ease\1/g, replace: "transition: $1var(--transition-base)$1" },
    { regex: /transition:\s*(['"])all 0\.3s ease\1/g, replace: "transition: $1var(--transition-slow)$1" },
    { regex: /transition:\s*all 0\.2s ease/g, replace: "transition: var(--transition-base)" },
    { regex: /transition:\s*all 0\.3s ease/g, replace: "transition: var(--transition-slow)" },
    { regex: /transition:\s*all 0\.2s;/g, replace: "transition: var(--transition-base);" },
    { regex: /transition:\s*all 0\.3s;/g, replace: "transition: var(--transition-slow);" }
  ];

  replacements.forEach(item => {
    let tempCount = (content.match(item.regex) || []).length;
    if (tempCount > 0) {
        replacedCount += tempCount;
        content = content.replace(item.regex, item.replace);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files.`);
console.log(`Replaced ${replacedCount} font/transition variables.`);
