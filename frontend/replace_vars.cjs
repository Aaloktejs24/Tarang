const fs = require('fs');

const radiusMap = {
  '4px': 'var(--radius-sm)',
  '5px': 'var(--radius-sm)',
  '6px': 'var(--radius-sm)',
  '7px': 'var(--radius-md)',
  '8px': 'var(--radius-md)',
  '10px': 'var(--radius-lg)',
  '12px': 'var(--radius-lg)',
  '16px': 'var(--radius-xl)',
  '20px': 'var(--radius-xl)',
  '24px': 'var(--radius-2xl)',
  '50%': 'var(--radius-full)'
};

const fontMap = {
  '12px': 'var(--font-xs)',
  '13px': 'var(--font-sm)',
  '14px': 'var(--font-sm)',
  '0.95rem': 'var(--font-md)',
  '15px': 'var(--font-md)',
  '16px': 'var(--font-base)',
  '1rem': 'var(--font-base)',
  '18px': 'var(--font-lg)',
  '20px': 'var(--font-lg)',
  '24px': 'var(--font-xl)'
};

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
let totalReplacements = 0;

files.forEach(file => {
  if (file.includes('globals.css') || file.includes('variables.css')) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace borderRadius
  content = content.replace(/(borderRadius:\s*)['"]?([^,'"}]+)['"]?/g, (match, prefix, val) => {
    const cleanVal = val.trim();
    if (radiusMap[cleanVal]) {
      totalReplacements++;
      return `${prefix}'${radiusMap[cleanVal]}'`;
    }
    return match;
  });

  // Replace fontSize
  content = content.replace(/(fontSize:\s*)['"]?([^,'"}]+)['"]?/g, (match, prefix, val) => {
    const cleanVal = val.trim();
    if (fontMap[cleanVal]) {
      totalReplacements++;
      return `${prefix}'${fontMap[cleanVal]}'`;
    }
    return match;
  });
  
  // Replace standard boxShadow
  content = content.replace(/(boxShadow:\s*)['"](none)['"]/g, (match, prefix, val) => {
    totalReplacements++;
    return `${prefix}'var(--shadow-none)'`;
  });
  
  content = content.replace(/(boxShadow:\s*)['"](0 4px 20px rgba\(0, 0, 0, 0\.04\)|0 4px 20px rgba\(0,0,0,0\.04\))['"]/g, (match, prefix, val) => {
    totalReplacements++;
    return `${prefix}'var(--shadow-md)'`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedFilesCount++;
  }
});

console.log(`Modified ${modifiedFilesCount} files, replaced ${totalReplacements} values with variables.`);
