const fs = require('fs');
const path = '/Users/aaloktejas/Development/Tarang/frontend/src/features/auth/components/RegisterDetailsStep.jsx';
let content = fs.readFileSync(path, 'utf8');

// Title mb: 1 -> mb: 0.5
content = content.replace('letterSpacing: "-0.5px", fontSize: \'var(--font-2xl)\', mb: 1', 'letterSpacing: "-0.5px", fontSize: \'var(--font-2xl)\', mb: 0.5');

// Bottom section wrapper
content = content.replace('<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>', '<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>');

// Remove mt: 0.5 from the link
content = content.replace('<Box sx={{ textAlign: "center", mt: 0.5 }}>', '<Box sx={{ textAlign: "center" }}>');

fs.writeFileSync(path, content);
console.log('Fixed bottom gaps');
