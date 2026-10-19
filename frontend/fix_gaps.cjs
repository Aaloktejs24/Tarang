const fs = require('fs');

// Fix LoginForm mb
const loginFile = '/Users/aaloktejas/Development/Tarang/frontend/src/features/auth/LoginForm.jsx';
let loginContent = fs.readFileSync(loginFile, 'utf8');
loginContent = loginContent.replace('<Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>', '<Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>');
fs.writeFileSync(loginFile, loginContent);

// Fix RegisterDetailsStep gap
const regFile = '/Users/aaloktejas/Development/Tarang/frontend/src/features/auth/components/RegisterDetailsStep.jsx';
let regContent = fs.readFileSync(regFile, 'utf8');
regContent = regContent.replace('<Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 1.25 }}>\n      <Box sx={{ mb: 1 }}>', '<Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 3 }}>\n      <Box>');
fs.writeFileSync(regFile, regContent);

console.log('Successfully adjusted gaps');
