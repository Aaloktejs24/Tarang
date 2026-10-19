const fs = require('fs');
const path = require('path');

const directory = '/Users/aaloktejas/Development/Tarang/frontend/src';

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk(directory, function(err, results) {
  if (err) throw err;
  
  results.forEach(file => {
    // skip fonts and binaries
    if (file.endsWith('.woff') || file.endsWith('.woff2') || file.endsWith('.svg') || file.endsWith('.png') || file.endsWith('.jpg')) return;
    
    // skip globals.css
    if (file.endsWith('globals.css')) return;
    
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace CSS line-height
    if (file.endsWith('.css')) {
      content = content.replace(/line-height\s*:\s*[^;]+;/g, '');
    }
    
    // Replace JSX/JS lineHeight
    if (file.endsWith('.jsx') || file.endsWith('.js')) {
      // Handles: lineHeight: 1.5,
      // Handles: lineHeight: '14px',
      // Handles: lineHeight={1.8}
      content = content.replace(/lineHeight\s*:\s*[^,}]+,?/g, '');
      content = content.replace(/lineHeight=\{[^}]+\}/g, '');
    }
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  });
});
