const fs = require('fs');

const file = '/Users/aaloktejas/Development/Tarang/frontend/src/features/auth/components/RegisterDetailsStep.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace all `<Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>` with `<Box sx={{ width: 'calc(50% - 6px)' }}>`
content = content.replace(/<Box sx=\{\{\s*flex:\s*1,\s*minWidth:\s*0,\s*width:\s*"100%"\s*\}\}>/g, '<Box sx={{ width: "calc(50% - 6px)" }}>');

fs.writeFileSync(file, content);
console.log('Successfully updated flex children to strict 50% width');
