const fs = require('fs');
const path = '/Users/aaloktejas/Development/Tarang/frontend/src/features/auth/components/RegisterDetailsStep.jsx';
let content = fs.readFileSync(path, 'utf8');

// Change the parent gap of the form rows from gap: 2 to gap: 3
content = content.replace('<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>', '<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>');

// What about mb: 0 on Email? 
// The email has <Box sx={{ mb: 0 }}>. That's fine, it will just use the gap: 3 from the parent.

fs.writeFileSync(path, content);
console.log('Updated RegisterDetailsStep gap to 3');
