const fs = require('fs');

const file = '/Users/aaloktejas/Development/Tarang/frontend/src/features/auth/components/RegisterDetailsStep.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace all exact matches of `<Box sx={{ flex: 1 }}>` with `<Box sx={{ flex: 1, minWidth: 0 }}>`
content = content.replace(/<Box sx=\{\{\s*flex:\s*1\s*\}\}>/g, '<Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>');

fs.writeFileSync(file, content);
console.log('Successfully added minWidth: 0 and width: 100% to flex items');
