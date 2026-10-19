const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/features/auth/components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx') && f !== 'AuthMessage.jsx');

const regex = /<AnimatePresence mode="wait">[\s\S]*?<\/AnimatePresence>/g;
const importRegex = /import AuthMessage from ["']\.\/AuthMessage["'];?\n?/g;
const framerMotionRegex = /import \{ (motion,\s*AnimatePresence|AnimatePresence,\s*motion) \} from ["']framer-motion["'];?\n?/g;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const original = content;
  content = content.replace(regex, '');
  content = content.replace(importRegex, '');
  
  // optionally remove framer-motion if motion and AnimatePresence are not used elsewhere.
  // We'll leave it as we might break something if it's used elsewhere (like in AuthMessage.jsx but we are skipping it)
  // Let's just remove the block.
  
  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Modified ${file}`);
  }
});
