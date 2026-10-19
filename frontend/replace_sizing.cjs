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

  // Replacements
  const replacements = [
    // 100%
    { regex: /(['"])100%\1/g, replace: '$1var(--size-full)$1' },
    { regex: /:\s*100%;/g, replace: ': var(--size-full);' }, // For CSS files

    // 100vw
    { regex: /(['"])100vw\1/g, replace: '$1var(--size-screen-w)$1' },
    { regex: /:\s*100vw;/g, replace: ': var(--size-screen-w);' },

    // 100vh
    { regex: /(['"])100vh\1/g, replace: '$1var(--size-screen-h)$1' },
    { regex: /:\s*100vh;/g, replace: ': var(--size-screen-h);' },

    // 1px solid
    { regex: /1px solid/g, replace: 'var(--border-thin) solid' },
    { regex: /2px solid/g, replace: 'var(--border-thick) solid' },

    // Border Radius
    { regex: /borderRadius:\s*4\b/g, replace: "borderRadius: 'var(--radius-sm)'" },
    { regex: /borderRadius:\s*(['"])4px\1/g, replace: "borderRadius: $1var(--radius-sm)$1" },
    { regex: /border-radius:\s*4px;/g, replace: 'border-radius: var(--radius-sm);' },

    { regex: /borderRadius:\s*8\b/g, replace: "borderRadius: 'var(--radius-md)'" },
    { regex: /borderRadius:\s*(['"])8px\1/g, replace: "borderRadius: $1var(--radius-md)$1" },
    { regex: /border-radius:\s*8px;/g, replace: 'border-radius: var(--radius-md);' },

    { regex: /borderRadius:\s*12\b/g, replace: "borderRadius: 'var(--radius-lg)'" },
    { regex: /borderRadius:\s*(['"])12px\1/g, replace: "borderRadius: $1var(--radius-lg)$1" },
    { regex: /border-radius:\s*12px;/g, replace: 'border-radius: var(--radius-lg);' },

    { regex: /borderRadius:\s*(['"])50%\1/g, replace: "borderRadius: $1var(--radius-full)$1" },
    { regex: /border-radius:\s*50%;/g, replace: 'border-radius: var(--radius-full);' }
  ];

  replacements.forEach(item => {
    content = content.replace(item.regex, (match, p1) => {
      replacedCount++;
      // p1 is the captured quote if any. The replacement string handles it dynamically.
      // JS replace with string handles $1 interpolation natively.
      return match; // Wait, actually replace string itself works differently if passed as a function.
    });
    // Let's do it properly using string replacement which supports $1 natively.
    // I need to count manually before replacing because String.prototype.replace with string doesn't provide a count easily unless we use a function.
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
console.log(`Replaced ${replacedCount} hardcoded size/spacing variables.`);
