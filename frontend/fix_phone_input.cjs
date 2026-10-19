const fs = require('fs');

const file = '/Users/aaloktejas/Development/Tarang/frontend/src/components/common/CustomFloatingFields.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const BaseCustomFloatingPhoneInput = \(\{.*?\}\);/s;

// We will extract the entire component and replace it.
// Wait, the component ends at line 372.
// Let's just use string replacement between specific lines.
