const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../node_modules/framer-motion/dist/es/context/LayoutGroupContext.mjs');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  content = content.replace(/\/\/# sourceMappingURL=LayoutGroupContext\.mjs\.map/g, '');
  fs.writeFileSync(targetFile, content);
  console.log('Fixed framer-motion source map warning.');
} else {
  console.log('Target file not found for patch. (Framer motion may not be installed or path changed)');
}
