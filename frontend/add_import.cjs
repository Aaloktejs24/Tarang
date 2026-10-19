const fs = require('fs');
let css = fs.readFileSync('src/styles/globals.css', 'utf8');
if (!css.includes("@import url('./variables.css');") && !css.includes("@import './variables.css';")) {
  css = "@import './variables.css';\n" + css;
  fs.writeFileSync('src/styles/globals.css', css);
  console.log("Added import to globals.css");
} else {
  console.log("Import already exists");
}
