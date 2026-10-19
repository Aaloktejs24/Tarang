const fs = require('fs');

const colorMap = {
  '#0056b3': 'var(--color-primary)',
  '#004494': 'var(--color-primary-dark)',
  '#007bff': 'var(--color-primary-light)',
  '#28a745': 'var(--color-success)',
  '#10b981': 'var(--color-success-light)',
  '#ef4444': 'var(--color-error)',
  '#dc3545': 'var(--color-error-dark)',
  '#f59e0b': 'var(--color-warning)',
  '#ffc107': 'var(--color-warning-light)',
  '#17a2b8': 'var(--color-info)',
  '#f8fafc': 'var(--color-slate-50)',
  '#f1f5f9': 'var(--color-slate-100)',
  '#e2e8f0': 'var(--color-slate-200)',
  '#cbd5e1': 'var(--color-slate-300)',
  '#94a3b8': 'var(--color-slate-400)',
  '#64748b': 'var(--color-slate-500)',
  '#475569': 'var(--color-slate-600)',
  '#334155': 'var(--color-slate-700)',
  '#1e293b': 'var(--color-slate-800)',
  '#0f172a': 'var(--color-slate-900)',
  '#ffffff': 'var(--color-white)',
  '#fff': 'var(--color-white)',
  '#000000': 'var(--color-black)',
  '#000': 'var(--color-black)',
  '#f8f9fa': 'var(--color-gray-50)',
  '#f3f4f6': 'var(--color-gray-100)',
  '#dee2e6': 'var(--color-gray-200)',
  '#e0e0e0': 'var(--color-gray-300)',
  '#9ca3af': 'var(--color-gray-400)',
  '#495057': 'var(--color-gray-600)',
  '#374151': 'var(--color-gray-700)',
  '#343a40': 'var(--color-gray-800)',
  '#111827': 'var(--color-gray-900)',
  '#eeeeee': 'var(--color-light-gray)'
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
let replacedStandardCount = 0;
let replacedDynamicCount = 0;

files.forEach(file => {
  if (file.includes('globals.css') || file.includes('variables.css')) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Replace dynamic template string transparencies e.g. `${c.color}20` -> `color-mix(in srgb, ${c.color} 12.5%, transparent)`
  // Match `${...}XX` inside backticks where XX is hex
  content = content.replace(/\$\{([^}]+)\}([0-9a-fA-F]{2})\b/g, (match, variable, alphaHex) => {
    // Convert hex alpha (00-FF) to percentage
    const alphaInt = parseInt(alphaHex, 16);
    const alphaPct = ((alphaInt / 255) * 100).toFixed(1);
    replacedDynamicCount++;
    return `color-mix(in srgb, \${${variable}} ${alphaPct}%, transparent)`;
  });

  // 2. Replace standalone hex colors with variables
  // Matches '#XXXXXX' taking into account case-insensitivity
  Object.keys(colorMap).forEach(hex => {
    const regex = new RegExp(`(['"])${hex}(['"])`, 'ig');
    content = content.replace(regex, (match, p1, p2) => {
      replacedStandardCount++;
      return `${p1}${colorMap[hex]}${p2}`;
    });
  });
  
  // 3. Replace non-quoted occurrences like fill="#0f172a" in SVG (JSX uses strings, but in CSS they might be standalone)
  if (file.endsWith('.css')) {
     Object.keys(colorMap).forEach(hex => {
       const regex = new RegExp(`\\b${hex}\\b`, 'ig');
       content = content.replace(regex, colorMap[hex]);
     });
  }

  // 4. Replace 8-character hardcoded transparent hex (e.g. "#28a74520")
  content = content.replace(/(['"])#([0-9a-fA-F]{6})([0-9a-fA-F]{2})\1/ig, (match, quote, hex6, alphaHex) => {
    const fullHex = `#${hex6.toLowerCase()}`;
    const alphaInt = parseInt(alphaHex, 16);
    const alphaPct = ((alphaInt / 255) * 100).toFixed(1);
    let colorVar = fullHex;
    if (colorMap[fullHex]) {
       colorVar = colorMap[fullHex];
    }
    replacedStandardCount++;
    return `${quote}color-mix(in srgb, ${colorVar} ${alphaPct}%, transparent)${quote}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files.`);
console.log(`Replaced ${replacedStandardCount} standard colors.`);
console.log(`Rewrote ${replacedDynamicCount} dynamic template string transparencies.`);
