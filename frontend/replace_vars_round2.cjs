const fs = require('fs');

const fontMap = {
  '11px': 'var(--font-2xs)',
  '0.75rem': 'var(--font-xs)',
  '0.8rem': 'var(--font-xs)',
  '0.85rem': 'var(--font-sm)',
  '0.9rem': 'var(--font-sm)',
  '1.05rem': 'var(--font-base)',
  '1.1rem': 'var(--font-lg)',
  '28px': 'var(--font-2xl)',
  '32px': 'var(--font-3xl)'
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

  // Replace fontSize
  content = content.replace(/(fontSize:\s*)['"]?([^,'"}]+)['"]?/g, (match, prefix, val) => {
    const cleanVal = val.trim();
    if (fontMap[cleanVal]) {
      totalReplacements++;
      return `${prefix}'${fontMap[cleanVal]}'`;
    }
    return match;
  });
  
  // Replace none !important
  content = content.replace(/(boxShadow:\s*)['"](none !important)['"]/g, (match, prefix, val) => {
    totalReplacements++;
    return `${prefix}'var(--shadow-none) !important'`;
  });
  
  // Replace large shadows
  content = content.replace(/(boxShadow:\s*)['"](0 12px 40px rgba\(0, 0, 0, 0\.1\)|0 12px 40px rgba\(0,0,0,0\.1\)|0 20px 60px rgba\(0,0,0,0\.15\)|0 10px 40px rgba\(0,0,0,0\.1\)|0 10px 30px rgba\(0,0,0,0\.08\))['"]/g, (match, prefix, val) => {
    totalReplacements++;
    return `${prefix}'var(--shadow-lg)'`;
  });

  // Replace small/medium shadows
  content = content.replace(/(boxShadow:\s*)['"](0 12px 24px rgba\(0,0,0,0\.1\)|0 4px 20px rgba\(0,0,0,0\.05\)|0 4px 12px rgba\(0,0,0,0\.1\)|0 8px 32px 0 rgba\(31, 38, 135, 0\.15\)|0 10px 25px rgba\(0,0,0,0\.1\)|0 8px 24px rgba\(0,0,0,0\.1\)|0 4px 12px rgba\(0,0,0,0\.05\)|0 4px 20px rgba\(0,0,0,0\.1\))['"]/g, (match, prefix, val) => {
    totalReplacements++;
    return `${prefix}'var(--shadow-md)'`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedFilesCount++;
  }
});

console.log(`Modified ${modifiedFilesCount} files, replaced ${totalReplacements} values in round 2 cleanup.`);
